import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt, ReceiptItem } from './receipt.entity';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ExtractReceiptResponse {
  id: string;
  date: string;
  currency: string;
  vendor_name: string;
  receipt_items: ReceiptItem[];
  tax: number;
  total: number;
  image_url: string;
}

@Injectable()
export class ReceiptService {
  private openai: OpenAI;
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
  ) {
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async extractReceiptDetails(file: Express.Multer.File): Promise<ExtractReceiptResponse> {
    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only .jpg, .jpeg, and .png files are allowed.',
      );
    }

    try {
      // Call AI model to extract receipt details
      const extractedData = await this.callAIModel(file);

      // Verify the response
      this.validateExtractedData(extractedData);

      // Save the image file
      const imageUrl = await this.saveImageFile(file);

      // Save the receipt data to database
      const receipt = new Receipt();
      receipt.date = extractedData.date;
      receipt.currency = extractedData.currency;
      receipt.vendor_name = extractedData.vendor_name;
      receipt.receipt_items = extractedData.receipt_items;
      receipt.tax = extractedData.tax;
      receipt.total = extractedData.total;
      receipt.image_url = imageUrl;

      const savedReceipt = await this.receiptRepository.save(receipt);

      // Return the saved extraction details
      return {
        id: savedReceipt.id,
        date: savedReceipt.date,
        currency: savedReceipt.currency,
        vendor_name: savedReceipt.vendor_name,
        receipt_items: savedReceipt.receipt_items,
        tax: Number(savedReceipt.tax),
        total: Number(savedReceipt.total),
        image_url: savedReceipt.image_url,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.response?.status === 500 || error.status === 500) {
        throw new InternalServerErrorException('AI model returned a 500 error');
      }
      throw new InternalServerErrorException(
        `Failed to extract receipt details: ${error.message}`,
      );
    }
  }

  private async callAIModel(file: Express.Multer.File): Promise<any> {
    const base64Image = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Image}`;

    const prompt = `Extract the following information from this receipt image and return it as a JSON object:
- date: The date of the receipt (format: YYYY-MM-DD)
- currency: The 3-character currency code (e.g., USD, EUR, SGD)
- vendor_name: The name of the vendor/store
- receipt_items: An array of objects, each with "item_name" and "item_cost" (as a number)
- tax: The total GST/tax amount for the entire receipt (as a number)
- total: The total amount of the receipt (as a number)

Return ONLY a valid JSON object with no additional text or markdown formatting.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('Empty response from AI model');
      }

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new BadRequestException('Invalid JSON response from AI model');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      if (error.response?.status === 500 || error.status === 500) {
        throw new InternalServerErrorException('AI model returned a 500 error');
      }
      throw error;
    }
  }

  private validateExtractedData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Invalid response from AI model: empty or poorly-formed');
    }

    const requiredFields = ['date', 'currency', 'vendor_name', 'receipt_items', 'tax', 'total'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new BadRequestException(
          `Invalid response from AI model: missing field '${field}'`,
        );
      }
    }

    if (!Array.isArray(data.receipt_items)) {
      throw new BadRequestException(
        'Invalid response from AI model: receipt_items must be an array',
      );
    }

    if (data.receipt_items.length === 0) {
      throw new BadRequestException(
        'Invalid response from AI model: receipt_items array is empty',
      );
    }

    // Validate receipt items structure
    for (const item of data.receipt_items) {
      if (!item.item_name || typeof item.item_name !== 'string') {
        throw new BadRequestException(
          'Invalid response from AI model: receipt items must have item_name',
        );
      }
      if (typeof item.item_cost !== 'number') {
        throw new BadRequestException(
          'Invalid response from AI model: receipt items must have numeric item_cost',
        );
      }
    }

    // Validate numeric fields
    if (typeof data.tax !== 'number' || typeof data.total !== 'number') {
      throw new BadRequestException(
        'Invalid response from AI model: tax and total must be numbers',
      );
    }

    // Validate currency format
    if (typeof data.currency !== 'string' || data.currency.length !== 3) {
      throw new BadRequestException(
        'Invalid response from AI model: currency must be a 3-character code',
      );
    }
  }

  private async saveImageFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadsDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    // Return relative URL path
    return `/uploads/${fileName}`;
  }
}

