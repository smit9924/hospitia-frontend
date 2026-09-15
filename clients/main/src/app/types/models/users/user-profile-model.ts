import { UserType } from '../../enums/auth';

export class UserProfileModel {
  email = '';
  username = '';
  role: UserType | null = null;
  guid = '';
  firstName: string | null = null;
  lastName: string | null = null;
  isEmailVerified = false;

  constructor(data: Partial<UserProfileModel>) {
    Object.assign(this, data);
  }
}
