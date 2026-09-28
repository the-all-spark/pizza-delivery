import { UserRole } from '@shared/enums';

export interface RegisterResponse {
  uId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
}
