export interface RequestApprovalVacationTimeTransactionApprovalResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    approvalLeaveandAssignments: TimeTransactionApproval[];
    totalCount: number;
  };
}

export interface TimeTransactionApproval {
  recId: number;
  reqId: number;
  empId: number;
  empName: string;
  stsId: number;
  stsLabel: string;
  part: number;
  partLabel: string;
  startDate: string;
  startDateHijri: string;
  endDate: string;
  endDateHijri: string;
  curLevel: number;
  currentLevelLabel: string;
  routeId: number | null;
  requestByEmpId: number;
  requestByName: string;
  note: string;
}

export interface TimeTransactionApprovalRequest {
  empId: number;
  sDate: string;
  eDate: string;
  pageNumber: number;
  pageSize: number;
  searchColumn: string | null;
  searchText: string | null;
}

export interface AcceptApprovalRequestQuery{
  ApprovalRequest: UpdateApprovalReqResult
}

export interface UpdateApprovalReqResult{
  TranId : number;
  EmpId : number
  Note : string
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
  sDate: string;
  eDate: string;
  pageNumber: number;
  pageSize: number;
}
