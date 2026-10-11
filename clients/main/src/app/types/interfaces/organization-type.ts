import { PaginatedQuery, PaginatedResponse } from './pagination';

export type OrganizationTypeSortBy = 'name' | 'createdAt' | 'updatedAt';

export interface OrganizationTypeListItem {
  guid: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationTypeUpsertRequest {
  guid?: string | null;
  name: string;
  description: string | null;
}

export type OrganizationTypeListQuery = PaginatedQuery<OrganizationTypeSortBy>;

export type OrganizationTypeListResponse = PaginatedResponse<OrganizationTypeListItem>;
