
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  // MongoDB auto-generates _id as ObjectId (24-char hex string)
  // Your spec asked for "Number, auto-increment" — MongoDB supports this
  // via a Counter collection pattern, but ObjectId is the standard approach

  @Prop({ required: true, minlength: 3, maxlength: 30 })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['Admin', 'User'], default: 'User' })
  role: string;

  @Prop()
  avatar?: string;

  @Prop()
  age?: number;

  @Prop()
  phoneNumber?: string;

  @Prop()
  address?: string;

  @Prop({ default: true })
  active?: boolean;

  @Prop()
  verificationCode?: string;

  @Prop({ enum: ['male', 'female'] })
  gender?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
