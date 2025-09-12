export interface RequestApprovalVacationTimeTransactionApprovalResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    timeTransactionApprovalRequests: TimeTransactionApproval[];
    totalCount: number;
  };
}

export interface TimeTransactionApproval {
  reqId: number;
  empId: number;
  empName: string;
  requestByEmpId: number;
  requestByEmpName: string;
  signDate: string;
  hsDate: string;
  in: string;
  out: string;
  reqSts: number;
  reqStsName: string;
  note: string;
  routeId: number | null;
  det: string;
  graph: string;
  attch: string;
  del: string;
}

export interface TimeTransactionApprovalRequest {
  empId: number;
  sDate: string | null;
  eDate: string | null;
  pageNumber: number;
  pageSize: number;
  searchColumn: string | null;
  searchText: string | null;
}



export interface RequestApprovalVacationAttendanceAdjustmentResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    approveAttendanceAdjustment: AttendanceAdjustment[];
    totalCount: number;
  };
}

export interface AttendanceAdjustment {
  recId: number;
  reqId: number;
  empId: number;
  empName: string;
  signDate: string;
  signDateHijri: string;
  in1: string;
  out1: string | null;
  curLevel: number;
  routeId: number;
  requestByEmpId: number;
  requestByName: string;
  note: string;
  currentLevelLabel: string;
}

export interface AttendanceAdjustmentRequest {
  empId: number;
  sDate: string | null;
  eDate: string | null;
  pageNumber: number;
  pageSize: number;
}