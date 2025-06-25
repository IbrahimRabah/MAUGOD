export interface PaginationRequest {
  lang: number;
  pageNumber: number;
  pageSize: number;
  empId?: number | null; // Optional, used in employee service
}