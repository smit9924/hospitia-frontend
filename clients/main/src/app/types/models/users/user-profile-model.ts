import { UserType } from '../../enums/auth';

export class UserProfileModel {
  email = '';
  username = '';
  role: UserType | null = null;
  guid = '';
  first_name: string | null = null;
  last_name: string | null = null;

  constructor(data: Partial<UserProfileModel>) {
    Object.assign(this, data);
  }
}
