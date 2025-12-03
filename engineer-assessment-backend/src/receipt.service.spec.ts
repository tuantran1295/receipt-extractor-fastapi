import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ReceiptService } from './receipt.service';
import { Receipt } from './receipt.entity';
import * as fs from 'fs';
import * as path from 'path';

// Mock OpenAI
const mockCreate = jest.fn();

jest.mock('openai', () => {
  const MockOpenAI = jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    };
  });
  return {
    __esModule: true,
    default: MockOpenAI,
  };
});

// Don't mock fs completely, use spies instead

describe('ReceiptService', () => {
  let service: ReceiptService;
  let repository: Repository<Receipt>;

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'receipt.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  const validExtractedData = {
    date: '2024-01-15',
    currency: 'USD',
    vendor_name: 'Test Store',
    receipt_items: [
      { item_name: 'Item 1', item_cost: 10.50 },
      { item_name: 'Item 2', item_cost: 5.25 },
    ],
    tax: 1.50,
    total: 17.25,
  };

  const mockSavedReceipt: Receipt = {
    id: 'test-uuid',
    date: validExtractedData.date,
    currency: validExtractedData.currency,
    vendor_name: validExtractedData.vendor_name,
    receipt_items: validExtractedData.receipt_items,
    tax: validExtractedData.tax,
    total: validExtractedData.total,
    image_url: '/uploads/test-image.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptService,
        {
          provide: getRepositoryToken(Receipt),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ReceiptService>(ReceiptService);
    repository = module.get<Repository<Receipt>>(getRepositoryToken(Receipt));

    // Mock fs methods using spies
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'mkdirSync').mockReturnValue(undefined);
    
    // Mock fs.promises.writeFile
    const fsPromises = require('fs/promises');
    jest.spyOn(fsPromises, 'writeFile').mockResolvedValue(undefined);

    // Mock path.join
    jest.spyOn(path, 'join').mockImplementation((...args) => args.join('/'));

    // Reset all mocks
    jest.clearAllMocks();
    mockCreate.mockClear();
  });

  describe('extractReceiptDetails', () => {
    it('should successfully extract receipt details from valid image', async () => {
      // Mock OpenAI response
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(validExtractedData),
            },
          },
        ],
      } as any);

      // Mock repository save
      mockRepository.save.mockResolvedValue(mockSavedReceipt);

      const result = await service.extractReceiptDetails(mockFile);

      expect(result).toEqual({
        id: mockSavedReceipt.id,
        date: mockSavedReceipt.date,
        currency: mockSavedReceipt.currency,
        vendor_name: mockSavedReceipt.vendor_name,
        receipt_items: mockSavedReceipt.receipt_items,
        tax: Number(mockSavedReceipt.tax),
        total: Number(mockSavedReceipt.total),
        image_url: mockSavedReceipt.image_url,
      });

      expect(mockCreate).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for incorrect file type', async () => {
      const invalidFile: Express.Multer.File = {
        ...mockFile,
        mimetype: 'application/pdf',
      };

      await expect(service.extractReceiptDetails(invalidFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.extractReceiptDetails(invalidFile)).rejects.toThrow(
        'Invalid file type. Only .jpg, .jpeg, and .png files are allowed.',
      );

      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty AI response', async () => {
      // Mock OpenAI response with empty content
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      } as any);

      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockCreate).toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid JSON response from AI', async () => {
      // Mock OpenAI response with invalid JSON
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'This is not valid JSON',
            },
          },
        ],
      } as any);

      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockCreate).toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for poorly-formed response (missing fields)', async () => {
      // Mock OpenAI response with missing fields
      const incompleteData = {
        date: '2024-01-15',
        currency: 'USD',
        // Missing vendor_name, receipt_items, tax, total
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(incompleteData),
            },
          },
        ],
      } as any);

      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        'Invalid response from AI model: missing field',
      );

      expect(mockCreate).toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for empty receipt_items array', async () => {
      const dataWithEmptyItems = {
        ...validExtractedData,
        receipt_items: [],
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(dataWithEmptyItems),
            },
          },
        ],
      } as any);

      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        'receipt_items array is empty',
      );

      expect(mockCreate).toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid receipt_items structure', async () => {
      const dataWithInvalidItems = {
        ...validExtractedData,
        receipt_items: [
          { item_name: 'Item 1' }, // Missing item_cost
        ],
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(dataWithInvalidItems),
            },
          },
        ],
      } as any);

      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        BadRequestException,
      );

      expect(mockCreate).toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException for 500 status response from AI', async () => {
      // Mock OpenAI to throw a 500 error
      const error = new Error('Internal Server Error');
      (error as any).response = { status: 500 };
      (error as any).status = 500;

      mockCreate.mockRejectedValue(error);

      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        'AI model returned a 500 error',
      );

      expect(mockCreate).toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid currency format', async () => {
      const dataWithInvalidCurrency = {
        ...validExtractedData,
        currency: 'US', // Invalid: not 3 characters
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(dataWithInvalidCurrency),
            },
          },
        ],
      } as any);

      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        'currency must be a 3-character code',
      );

      expect(mockCreate).toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for non-numeric tax and total', async () => {
      const dataWithInvalidNumbers = {
        ...validExtractedData,
        tax: '1.50', // String instead of number
        total: '17.25', // String instead of number
      };

      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(dataWithInvalidNumbers),
            },
          },
        ],
      } as any);

      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.extractReceiptDetails(mockFile)).rejects.toThrow(
        'tax and total must be numbers',
      );

      expect(mockCreate).toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});

