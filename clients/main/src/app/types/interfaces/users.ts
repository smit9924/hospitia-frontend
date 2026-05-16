import { UserType } from '../enums/auth';

export interface UserProfileDto {
  email: string;
  username: string;
  role: UserType;
  guid: string;
  first_name: string | null;
  last_name: string | null;
}
