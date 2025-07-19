import { USER_GENDER_ENUM } from 'src/users/enums/gener.enum';

export interface IPayload {
  email: string;
  fullName: string;
  role: string;
  id: number;
  gender: USER_GENDER_ENUM;
}
