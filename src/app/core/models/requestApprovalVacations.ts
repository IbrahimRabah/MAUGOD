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
  searchColumn?: string;
  searchText?: string;
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
  searchColumn?: string;
  searchText?: string;
}


// Response wrapper
export interface TimtranApprovalTransactionsVacationsDetailsData {
  transactions: TimtranApprovalTransactionsVacationsDetail[];
  totalCount: number;
}

// Item shape
export interface TimtranApprovalTransactionsVacationsDetail {
  curlLevel: string;
  flag: number;
  flagName: string;
  updatedByEmpId: number;
  updatedByEmpName: string;
  replyDate: string; // ISO date string, e.g. "2021-12-07"
  note: string;
}
// RoadMap response wrapper
export interface TimtranApprovalRoadmapVacationsDetailsData {
  roadmaps: TimtranApprovalRoadmapVacationsDetail[];
  totalCount: number;
}

// RoadMap item
export interface TimtranApprovalRoadmapVacationsDetail {
  curl_Level: number;   // keeping API casing as-is
  curLevelName: string;
  mgrId: number;
  mgrName: string;
}
