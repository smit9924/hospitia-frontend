import { UserType } from '../enums/auth';

export interface UserProfileDto {
  email: string;
  username: string;
  role: UserType;
  guid: string;
  firstName: string | null;
  lastName: string | null;
  isEmailVerified: boolean;
}

export interface UserProfileUpdate {
  username: string;
  firstName: string;
  lastName: string;
}

export interface UserUpdateRequest extends UserProfileUpdate {
  guid: string;
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

export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export interface ChangePasswordReq {
  currentPassword: string;
  newPassword: string;
}

export type UserListSortBy = 'firstName' | 'lastName' | 'username' | 'email';

export type UserListSortDirection = 'asc' | 'desc';

export interface UserListQuery {
  searchTerm?: string;
  pageSize: number;
  sortBy: UserListSortBy;
  sortDirection: UserListSortDirection;
  pageNumber: number;
}

export interface UserListItem {
  guid: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string;
}

export interface UserListResponse {
  items: UserListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
