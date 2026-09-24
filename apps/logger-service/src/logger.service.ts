// * Сервис для управления и сохранения логов в MongoDB

/**
 * Включает метод, который принимает входящие данные, упаковывает их в структуру MongoDB 
 * и асинхронно сохраняет в базу.
 * Также сервис параллельно дублирует входящие логи в стандартную консоль контейнера 
 * (console.log/console.error). 
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from './schemas/log.schema';
import { ILog } from './schemas/log.interface';

@Injectable()
export class LoggerService {
  constructor(
    // Внедряем Mongoose модель для взаимодействия с коллекцией logs
    @InjectModel(Log.name) private readonly logModel: Model<Log>,
  ) {}

  // * Метод для записи лога в MongoDB и дублирования в консоль
  // На вход принимает объект, частично или полностью соответствующий ILog 
  // (без timestamp, т.к. он генерируется сам)
  async createLog(logData: Omit<ILog, 'timestamp'>): Promise<Log> {
    // 1. Создаем новый документ на основе переданных данных
    const createdLog = new this.logModel(logData);

    // 2. Дублируем лог в консоль контейнера для удобной отладки в терминале
    this.printToConsole(logData);

    // 3. Асинхронно сохраняем документ в MongoDB
    return await createdLog.save();
  }

  // * Вспомогательный метод для красивого форматирования вывода логов в консоль
  private printToConsole(log: Omit<ILog, 'timestamp'>): void {
    const dateStr = new Date().toISOString();
    const prefix = `[${dateStr}] [${log.context.toUpperCase()}] [${log.level.toUpperCase()}]:`;

    if (log.level === 'error') {
      console.error(`${prefix} ${log.message}`);
      if (log.trace) {
        console.error(log.trace);
      }
    } else if (log.level === 'warn') {
      console.warn(`${prefix} ${log.message}`);
    } else {
      console.log(`${prefix} ${log.message}`);
    }
  }
}