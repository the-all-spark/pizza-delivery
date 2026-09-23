// Схема документа MongoDB для коллекции логов (Mongoose)

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ILog } from './log.interface';

// Объявляем класс как документ MongoDB с автоматическим созданием коллекции 'logs'
@Schema({ collection: 'logs', versionKey: false })
export class Log extends Document implements ILog {
  
  // Поле context обязательно для заполнения и индексируется для быстрого поиска
  @Prop({ required: true, index: true, type: String })
  context: string;

  // Уровень лога (всегда приводится к нижнему регистру)
  @Prop({ required: true, index: true, type: String, lowercase: true })
  level: 'info' | 'warn' | 'error';

  // Само текстовое сообщение лога
  @Prop({ required: true, type: String })
  message: string;

  // Стек ошибки, поле не обязательное (nullable)
  @Prop({ required: false, type: String })
  trace?: string;

  // Время создания лога (по умолчанию проставляется текущая дата сервера)
  @Prop({ type: Date, default: Date.now, index: true })
  timestamp: Date;
}

// Генерируем стандартную фабрику схемы Mongoose на основе нашего класса
export const LogSchema = SchemaFactory.createForClass(Log);
