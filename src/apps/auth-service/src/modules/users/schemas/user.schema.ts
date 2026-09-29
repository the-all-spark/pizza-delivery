// Схемы данных (Аналог Entity для Mongo) - описание структуры пользователя для MongoDB

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '@shared/enums';

@Schema({ collection: 'users', timestamps: true }) 
export class MongoUser extends Document {
  @Prop({ required: true, unique: true, type: Number })
  uId: number;

  @Prop({ required: true, unique: true, type: String, trim: true })
  email: string;

  @Prop({ required: true, type: String })
  passwordHash: string;

  @Prop({ required: true, type: String, index: true })
  firstName: string;

  @Prop({ required: true, type: String, index: true })
  lastName: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;
}

export const MongoUserSchema = SchemaFactory.createForClass(MongoUser);

MongoUserSchema.index({ firstName: 1, lastName: 1 }, { name: 'idx_users_names' });
