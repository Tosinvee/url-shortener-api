import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  gender: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  state?: string;

  @Prop()
  city?: string;

  @Prop()
  profilePictureUri: string;

  @Prop()
  country: string;

  @Prop()
  sessionKey: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
