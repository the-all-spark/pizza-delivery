// * Интерфейс, описывающий структуру лога в системе (типы данных, которые циркулируют в коде)

export interface ILog {
  context: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  trace?: string;
  timestamp: Date;
}
