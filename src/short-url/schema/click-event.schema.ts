import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ClickEvent extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ShortUrl', required: true })
  shortUrlId: Types.ObjectId;

  @Prop()
  ip: string;

  @Prop()
  userAgent?: string;

  @Prop()
  country: string;

  @Prop()
  referer?: string;
}

export const ClickEventSchema = SchemaFactory.createForClass(ClickEvent);
ClickEventSchema.index({ shortUrlId: 1 });
