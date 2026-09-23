// Интерфейс, описывающий структуру лога в системе
// типы данных, которые циркулируют в коде

export interface ILog {
  // Название микросервиса-отправителя (например, 'pizza-service', 'api-gateway')
  context: string;

  // Уровень важности лога ('info' | 'warn' | 'error')
  level: 'info' | 'warn' | 'error';

  // Текстовое описание события или текст ошибки
  message: string;

  // Стек вызовов ошибки (заполняется только при level === 'error')
  trace?: string;

  // Дата и время фиксации лога
  timestamp: Date;
}
