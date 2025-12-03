import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export interface ReceiptItem {
  item_name: string;
  item_cost: number;
}

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'varchar' })
  vendor_name: string;

  @Column({ type: 'json' })
  receipt_items: ReceiptItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar' })
  image_url: string;
}

