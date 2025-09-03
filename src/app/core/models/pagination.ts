export interface PaginationRequest {
  lang: number;
  pageNumber: number;
  pageSize: number;
  empId?: number | null; // Optional, used in employee service
  searchColumn?: string;  // optional
  searchText?: string; 
}

export interface PaginationAttendanceRequest {
  pageNumber: number;
  pageSize: number;
  empId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  empFilter?: string | null;
  deptFilter?: string | null;
  searchColumn?: string;  // optional
  searchText?: string; 
}

export interface PaginationPunchTransactionsRequest {
  pageNumber: number;
  pageSize: number;
  empId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  searchColumn?: string;  // optional
  searchText?: string; 
}

export interface PaginationShiftsAssignRequest {
  pageNumber: number;
  pageSize: number;
  empId?: number | null;
  sDate?: string | null;
  eDate?: string | null;
  searchColumn?: string;  // optional
  searchText?: string; 
}

export interface PaginationCommonRequest {
  pageNumber: number;
  pageSize: number;
  searchColumn?: string;  // optional
  searchText?: string; 
}

