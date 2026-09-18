export interface RegisterPayload {
  email: string;
  password: string; // Чистый пароль от шлюза, который мы будем хэшировать
  firstName: string;
  lastName: string;
}