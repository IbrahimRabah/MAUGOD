export interface DelegationResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: DelegationData[];
  totalCount: number;
  pageSize: number;
  pageIndex: number;
}

export interface DelegationData {
  delegateId: number;
  dFromEmp: number;
  dFromEmpName: string;
  dToEmp: number;
  dToEmpName: string;
  sDate: string;
  hsDate: string;
  eDate: string;
  heDate: string;
  dSts: boolean;
  sourceTyp: boolean;
  recDate: string;
  note: string;
}
export interface DelegationRequest {
  pageSize: number;
  pageIndex: number;
}
export interface CreateDelegationRequest {
  dFromEmp: number;
  dToEmps: number[];   // Array of employee IDs
  sDate: string;       // Start date in ISO format or 'yyyy-MM-dd'
  eDate: string;       // End date
  note?: string;       // Optional note
}

export interface CreateDelegationResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: boolean
}
