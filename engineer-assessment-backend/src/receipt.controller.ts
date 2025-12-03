import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptService } from './receipt.service';

@Controller()
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('extract-receipt-details')
  @UseInterceptors(FileInterceptor('image'))
  async extractReceiptDetails(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return await this.receiptService.extractReceiptDetails(file);
  }
}

