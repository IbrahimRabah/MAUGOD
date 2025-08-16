export interface PaginationRequest {
  lang: number;
  pageNumber: number;
  pageSize: number;
  empId?: number | null; // Optional, used in employee service
}

export interface PaginationAttendanceRequest {
  pageNumber: number;
  pageSize: number;
  empId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  empFilter?: string | null;
  deptFilter?: string | null;
}

export interface PaginationPunchTransactionsRequest {
  pageNumber: number;
  pageSize: number;
  empId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

