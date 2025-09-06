import { RoadMapDetailsData } from "./requestRoute";

export interface GetTimeTransactionApprovals {
  pageNumber: number;
  pageSize: number;
  searchColumn?: string;
  searchText?: string;
}
// get-time-transaction-approvals.models.ts

export interface TimeTransactionApproval {
  routeId: number;
  empId: number;
  empName: string;

  deptIdMgr: number | null;
  deptMgrName: string;
  branchIdMgr: number | null;
  branchMgrName: string;

  deptId: number | null;
  deptName: string;
  branchId: number | null;
  branchName: string;

  roleId: number | null;
  roleName: string;

  forEveryoneId: number;
  forEveryoneName: string;

  reqLevelId: number;
  reqLevelName: string;

  isActive: boolean;
  isActiveText: string;

  note: string;

  det: string;
  str: string;
  del: string;
}

export interface GetTimeTransactionApprovalsData {
  timeTransactionApprovals: TimeTransactionApproval[];
  totalCount: number;
}

export interface GetTimeTransactionApprovalsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: GetTimeTransactionApprovalsData;
}

export interface GetRequestRoadMapDetailsForRequestApprovalRouteResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: requestRoadMapDetailsData;
}
export interface requestRoadMapDetailsData {
  requestRoadMapForTimeTransactionApprovalDetails: requestRoadMapDetail[];
  totalCount: number;
}
export interface requestRoadMapDetail {
  routeId: number;
  level: number;
  levelName: string;
  details: string;
}
// time-transaction-approval.models.ts

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: T;
}

export interface ApprovalLevelDetails {
  dynDirectMgr: number;
  dynDirectMgrLevel: number;
  dynDirectMgrDaysLimits: number;
  dynDirectMgrAfterLimitAction: number;

  dynMgrOfDept: number;
  dynMgrOfDeptLevel: number;
  dynMgrOfDeptDaysLimits: number;
  dynMgrOfDeptAfterLimitAction: number;

  dynMgrOfBranch: number;
  dynMgrOfBranchLevel: number;
  dynMgrOfBranchDaysLimits: number;
  dynMgrOfBranchAfterLimitAction: number;

  mgrId: number;
  mgrIdDaysLimits: number;
  mgrIdAfterLimitAction: number;

  mgrOfDeptId: number;
  mgrOfDeptIdDaysLimits: number;
  mgrOfDeptIdAfterLimitAction: number;

  mgrOfBranchId: number;
  mgrOfBranchIdDaysLimits: number;
  mgrOfBranchIdAfterLimitAction: number;

  deptId: number;
  deptIdDaysLimits: number;
  deptIdAfterLimitAction: number;

  branchId: number;
  branchIdDaysLimits: number;
  branchIdAfterLimitAction: number;

  roleId: number;
  roleIdDaysLimits: number;
  roleIdAfterLimitAction: number;

  noteDetails: string;
}

export interface TimeTransactionApprovalCreateDto {
  routeId?: number; // optional for create, required for update
  empId: number;
  mgrOfDeptId: number;
  mgrOfBranchId: number;
  deptId: number;
  branchId: number;
  roleId: number;
  forEveryone: number;
  reqLevels: number;
  isActive: boolean;
  note: string;

  detailsLevel1?: ApprovalLevelDetails;
  detailsLevel2?: ApprovalLevelDetails;
  detailsLevel3?: ApprovalLevelDetails;
  detailsLevel4?: ApprovalLevelDetails;
  detailsLevel5?: ApprovalLevelDetails;
  detailsLevel6?: ApprovalLevelDetails;
  detailsLevel7?: ApprovalLevelDetails;
  detailsLevel8?: ApprovalLevelDetails;
  detailsLevel9?: ApprovalLevelDetails;
}

export interface CreateTimeTransactionApprovalRequest {
  timeTransactionApprovalCreateDto: TimeTransactionApprovalCreateDto;
}


export interface TimeTransactionApprovalDto extends TimeTransactionApprovalCreateDto {
  routeId?: number;
}

export type CreateTimeTransactionApprovalResponse =
  ApiResponse<TimeTransactionApprovalDto | boolean>;



// An approval item (one row)
export interface TimeTransactionApprovalItem {
  routeId: number;
  empId: number;
  empName: string;

  deptIdMgr: number | null;
  deptMgrName: string;

  branchIdMgr: number | null;
  branchMgrName: string;

  deptId: number | null;
  deptName: string;

  branchId: number | null;
  branchName: string;

  roleId: number | null;
  roleName: string;

  forEveryoneId: number;
  forEveryoneName: string;

  reqLevelId: number;
  reqLevelName: string;

  isActive: boolean;
  isActiveText: string;

  note: string;

  // action/string fields as returned by API
  det: string;
  str: string;
  del: string;
}

// Data object inside `data`
export interface TimeTransactionApprovalByIdData {
  timeTransactionApprovals: TimeTransactionApprovalItem[];
  totalCount: number;
}

// Full typed response
export type GetTimeTransactionApprovalByIdResponse =
  ApiResponse<TimeTransactionApprovalByIdData>;
