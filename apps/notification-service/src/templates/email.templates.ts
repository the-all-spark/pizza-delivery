// * Шаблоны писем для notification-service

/**
 * Шаблон приветственного письма при регистрации
 * @param firstName Имя пользователя
 */
export const getWelcomeTemplate = (firstName: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #e67e22; text-align: center;">Welcome to Pizza Delivery! 🍕</h2>
      <p>Hi, <strong>${firstName}</strong>!</p>
      <p>Thank you for registering on our platform. Now you can easily order the most delicious pizza in town directly to your door!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background-color: #e67e22; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">Go to Menu</a>
      </div>
      <p style="font-size: 12px; color: #777; text-align: center; margin-top: 4px;">If you didn't register on our website, please ignore this email.</p>
    </div>
  `;
};

/**
 * Шаблон прощального письма при удалении аккаунта
 * @param firstName Имя пользователя
 */
export const getGoodbyeTemplate = (firstName: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <h2 style="color: #2c3e50; text-align: center;">We're sad to see you go... 😢</h2>
      <p>Dear <strong>${firstName}</strong>,</p>
      <p>Your account has been successfully deleted from our system as per your request.</p>
      <p>We are very sorry that you left us. If you ever want to taste our hot pizza again, you can always create a new account anytime!</p>
      <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">Best regards,<br>The Pizza Delivery Team</p>
    </div>
  `;
};

/**
 * Шаблон уведомления о критической ошибке для администратора
 * @param service Название упавшего микросервиса
 * @param errorMessage Текст ошибки или стэк-трейс
 */
export const getCriticalErrorTemplate = (
  service: string,
  errorMessage: string,
): string => {
  const timestamp = new Date().toISOString();
  return `
    <div style="font-family: monospace; line-height: 1.5; color: #333; max-width: 800px; margin: 0 auto; border: 2px solid #c0392b; padding: 20px; border-radius: 8px; background-color: #fdf2f2;">
      <h2 style="color: #c0392b; margin-top: 0; border-bottom: 2px solid #c0392b; padding-bottom: 10px;">⚠️ CRITICAL SYSTEM ERROR REPORT</h2>
      <p><strong>Timestamp:</strong> ${timestamp}</p>
      <p><strong>Failed Service:</strong> <span style="background-color: #e74c3c; color: #fff; padding: 2px 6px; border-radius: 3px; font-weight: bold;">${service}</span></p>
      <p><strong>Error Details:</strong></p>
      <pre style="background-color: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; font-size: 13px;">${errorMessage}</pre>
      <p style="color: #7f8c8d; font-size: 12px; margin-top: 4px;">Action required: Please check the server logs immediately to resolve this infrastructure issue.</p>
    </div>
  `;
};
