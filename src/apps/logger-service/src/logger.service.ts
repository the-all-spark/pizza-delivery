// * Сервис для управления и сохранения логов в MongoDB

/**
 * Принимает входящие данные, упаковывает их в структуру MongoDB и асинхронно сохраняет в базу.
 * Также параллельно дублирует входящие логи в стандартную консоль контейнера
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log } from './schemas/log.schema';
import { ILog } from './schemas/log.interface';

@Injectable()
export class LoggerService {
  constructor(@InjectModel(Log.name) private readonly logModel: Model<Log>) {}

  // * Метод для записи лога в MongoDB и дублирования в консоль
  async createLog(logData: Omit<ILog, 'timestamp'>): Promise<Log> {
    const createdLog = new this.logModel(logData);
    this.printToConsole(logData);
    return await createdLog.save();
  }

  // * Вспомогательный метод для форматирования вывода логов в консоль
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
