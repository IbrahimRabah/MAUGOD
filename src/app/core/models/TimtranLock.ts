
export type YesNoFlag = 0 | 1;

export interface TimtranLock {
  recId: number;
  sDate: string;
  eDate: string;

  totalLock: YesNoFlag;
  totalLockDesc?: string;

  handleApprovalReqLock: YesNoFlag;
  handleApprovalReqLockDesc?: string;

  handleApprovalReqTranLock: YesNoFlag;
  handleApprovalReqTranLockDesc?: string;

  timtranApprovalReqLock: YesNoFlag;
  timtranApprovalReqLockDesc?: string;

  timtranApprovalReqTranLock: YesNoFlag;
  timtranApprovalReqTranLockDesc?: string;

  daysHandleDirect: YesNoFlag;
  daysHandleDirectDesc?: string;

  daysHandleSync: YesNoFlag;
  daysHandleSyncDesc?: string;

  timtranManualChange: YesNoFlag;
  timtranManualChangeDesc?: string;

  rDate: string;
  note?: string;

  del?: string;
  sel: boolean;
}


export interface GetTimtranLockResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
      items: TimtranLock[];
      totalCount: number;
    };
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
