export interface PaginatedQuery<TSortBy extends string> {
  searchTerm?: string;
  pageSize: number;
  sortBy: TSortBy;
  sortDirection: 'asc' | 'desc';
  pageNumber: number;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
