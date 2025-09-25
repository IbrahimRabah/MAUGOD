export interface MobileSignTransaction {
  mobTransId: number;
  empId: number;
  empName: string;
  signDate: string;     // ISO date string
  hDate: string;        // Hijri date string (kept as string)
  x: number;
  y: number;
  sts: number;
  statusName: string;
  phoneId: number;
  acceptedByLocId: number;
  acceptedBy: string;
  preview: string;
  sel: boolean;
}

export interface MobileSignTransactionResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    mobileSignTransactions: MobileSignTransaction[];
    totalCount: number;
  };
}
export interface MobileSignTransactionRequest {
  empId?: number;
  sDate?: string;       // format: YYYY-MM-DD
  eDate?: string;       // format: YYYY-MM-DD
  pageNumber?: number;
  pageSize?: number;
  searchColumn?: string;
  searchText?: string;
}
export interface RecalculateRequest {
  selectedRecIds: number[];
}
export interface RecalculateResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any; // adjust if backend returns structured data
}