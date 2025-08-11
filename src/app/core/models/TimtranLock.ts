export interface TimtranLock {
  id: number;
  sDate: string;
  eDate: string;
  totalLock: number;
  handleApprovalReqLock: number;
  handleApprovalReqTranLock: number;
  timtranApprovalReqLock: number;
  timtranApprovalReqTranLock: number;
  daysHandleDirect: number;
  daysHandleSync: number;
  timtranManualChange: number;
  note: string;
}

export interface GetTimtranLockResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: TimtranLock[];
  totalCount?: number; // Add this for proper pagination
  currentPage?: number;
  totalPages?: number;
}
export interface DeleteTranLocksRequest {
  ids: number[];
  lang: number;
}
export interface InsertTimtranLockInputFormRequest {
  sDate: string;  // ISO date string
  eDate: string;  // ISO date string
  totalLock: number;
  handleApprovalReqLock: number;
  handleApprovalReqTranLock: number;
  timtranApprovalReqLock: number;
  timtranApprovalReqTranLock: number;
  daysHandleDirect: number;
  daysHandleSync: number;
  timtranManualChange: number;
  rDate: string;  // ISO date string
  note: string;
  lang: number;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: T;
}
