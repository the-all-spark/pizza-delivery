// * Настройки транспорта для отправки почты (через SMTP)

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

import {
  getWelcomeTemplate,
  getGoodbyeTemplate,
  getCriticalErrorTemplate,
} from './templates/email.templates';

@Injectable()
export class NotificationService implements OnModuleInit {
  // Объявляем объект транспорта nodemailer
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {}

  // Метод OnModuleInit автоматически вызывается NestJS один раз при старте модуля
  onModuleInit() {
    // Инициализируем SMTP-транспорт на основе данных из .env
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<number>('SMTP_PORT', 1025)),
      secure: false, // Для локального тестирования (Mailpit/Mailtrap) SSL/TLS не нужен
      auth: {
        // Если логин и пароль не заданы (как в Mailpit), nodemailer пропустит авторизацию
        user: this.configService.get<string>('SMTP_USER') || undefined,
        pass: this.configService.get<string>('SMTP_PASS') || undefined,
      },
    });
  }

  // Универсальный внутренний метод для отправки любого email
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    // this.configService.get('ИМЯ', 'значение_по_умолчанию') - защита от падения
    const from = this.configService.get<string>(
      'SMTP_FROM',
      'no-reply@pizza.com',
    );

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      console.log(
        `✉️ Email с темой "${subject}" успешно отправлен на адрес: ${to}`,
      );
    } catch (error) {
      console.error(`❌ Ошибка при отправке email на адрес ${to}:`, error);
    }
  }

  // ==========================================
  // 1. ОТПРАВКА ПРИВЕТСТВЕННОГО ПИСЬМА
  // ==========================================
  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const subject = 'Welcome to Pizza Delivery! 🍕';
    const htmlContent = getWelcomeTemplate(firstName);

    await this.sendEmail(email, subject, htmlContent);
  }

  // ==========================================
  // 2. ОТПРАВКА ПРОЩАЛЬНОГО ПИСЬМА
  // ==========================================
  async sendGoodbyeEmail(email: string, firstName: string): Promise<void> {
    const subject = "We're sad to see you go... 😢";
    const htmlContent = getGoodbyeTemplate(firstName);

    await this.sendEmail(email, subject, htmlContent);
  }

  // ==========================================
  // 3. ОТПРАВКА КРИТИЧЕСКОЙ ОШИБКИ АДМИНИСТРАТОРУ
  // ==========================================
  async sendCriticalErrorEmail(
    serviceName: string,
    errorMessage: string,
  ): Promise<void> {
    // Считываем email администратора из .env
    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL',
      'admin@pizza.com',
    );
    const subject = `⚠️ CRITICAL ERROR REPORT: ${serviceName}`;
    const htmlContent = getCriticalErrorTemplate(serviceName, errorMessage);

    await this.sendEmail(adminEmail, subject, htmlContent);
  }
}
