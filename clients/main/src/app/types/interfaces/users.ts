import { UserType } from '../enums/auth';

export interface UserProfileDto {
  email: string;
  username: string;
  role: UserType;
  guid: string;
  first_name: string | null;
  last_name: string | null;
}

export interface UserProfileUpdate {
  username: string;
  firstName: string;
  lastName: string;
}

export interface UsernameAvailabilityReq {
  username: string;
}

export interface UserSignup {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}
