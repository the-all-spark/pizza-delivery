// * Интерфейс, описывающий структуру лога в системе

export interface ILog {
  context: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  trace?: string;
  timestamp: Date;
}
