// * Схема документа MongoDB для коллекции логов (Mongoose)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ILog } from './log.interface';

// Объявляем класс - документ MongoDB с автоматическим созданием коллекции 'logs'
@Schema({ collection: 'logs', versionKey: false })
export class Log extends Document implements ILog {
  @Prop({ required: true, index: true, type: String })
  context: string;

  @Prop({ required: true, index: true, type: String, lowercase: true })
  level: 'info' | 'warn' | 'error';

  @Prop({ required: true, type: String })
  message: string;

  @Prop({ required: false, type: String })
  trace?: string;

  @Prop({ type: Date, default: Date.now, index: true })
  timestamp: Date;
}

// Генерируем стандартную фабрику схемы Mongoose на основе класса
export const LogSchema = SchemaFactory.createForClass(Log);
