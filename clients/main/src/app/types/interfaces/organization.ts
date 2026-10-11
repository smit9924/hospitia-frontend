import { PaginatedQuery, PaginatedResponse } from './pagination';
import { OrganizationTypeListItem } from './organization-type';

export type OrganizationSortBy = 'name' | 'createdAt' | 'updatedAt';

export interface OrganizationListItem {
  guid: string;
  name: string;
  organizationTypeName: string;
  ownerDisplayName: string | null;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  isActive: boolean;
  createdByDisplayName: string | null;
  createdAt: string;
  updatedByDisplayName: string | null;
  updatedAt: string;
}

export type OrganizationListQuery = PaginatedQuery<OrganizationSortBy>;

export type OrganizationListResponse = PaginatedResponse<OrganizationListItem>;

export interface AddressInput {
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface AddressDto extends AddressInput {
  guid: string;
}

export interface OrganizationMemberSummary {
  guid: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string;
}

export interface OrganizationCreateAdminRequest {
  guid?: string | null;
  name: string;
  description: string | null;
  organizationTypeGuid: string;
  address: AddressInput;
  ownerUserGuid: string;
  isActive: boolean;
}

export interface OrganizationCreateOwnerRequest {
  guid?: string | null;
  name: string;
  description: string | null;
  organizationTypeGuid: string;
  address: AddressInput;
  isActive: boolean;
}

export interface OrganizationDto {
  guid: string;
  name: string;
  description: string | null;
  isActive: boolean;
  organizationType: OrganizationTypeListItem;
  address: AddressDto;
  owner: OrganizationMemberSummary | null;
  createdBy: OrganizationMemberSummary | null;
  updatedBy: OrganizationMemberSummary | null;
  createdAt: string;
  updatedAt: string;
}
