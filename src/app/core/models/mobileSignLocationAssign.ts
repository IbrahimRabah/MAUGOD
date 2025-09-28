export interface MobileSignLocationAssign {
  recId: number;
  locId: number;
  locName: string;
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
  sDate: string | null;   // nullable date
  hsDate: string;
  eDate: string | null;   // nullable date
  heDate: string;
  note: string;
  sel: boolean;
  del: string;
}

export interface MobileSignLocationsAssignResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    mobileSignLocationsAssign: MobileSignLocationAssign[];
    totalCount: number;
  };
}
export interface MobileSignLocationAssignCreateDto {
  locId: number;
  forEveryone: boolean;
  sDate: string;   // ISO string, e.g. "2025-08-16T15:04:50.112Z"
  eDate: string;   // ISO string
  note: string;
  empIds: string;      // comma-separated IDs or plain string depending on backend
  deptIds: string;
  branchIds: string;
  roleIds: string;
  deptMgrIds: string;
  branchMgrIds: string;
}

export interface MobileSignLocationAssignCreateRequest {
  mobileSignLocationAssignCreateDto: MobileSignLocationAssignCreateDto;
}
