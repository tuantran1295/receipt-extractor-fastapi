import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { Receipt } from './receipt.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'receipts.db',
      entities: [Receipt],
      synchronize: true, // In production, use migrations instead
    }),
    TypeOrmModule.forFeature([Receipt]),
  ],
  controllers: [AppController, ReceiptController],
  providers: [AppService, ReceiptService],
})
export class AppModule {}
