import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ShortUrl extends Document {
  @Prop({ unique: true })
  code: string;

  @Prop()
  originalUrl: string;

  @Prop()
  expiresAt?: Date;

  @Prop()
  passwordHash?: string;

  @Prop({ default: 0 })
  clickCount: number;

  @Prop()
  lastClickAt?: Date;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  createdBy?: string;
}
export const ShortUrlSchema = SchemaFactory.createForClass(ShortUrl);
