export interface RequestPostPermission {
  recId: number;
  stsId: string;
  stsNameAr: string;
  stsNameEn: string;
  empId: number;
  empNameAr: string;
  empNameEn: string | null;
  deptId: number | null;
  deptNameAr: string | null;
  deptNameEn: string | null;
  mgrOfDeptId: number | null;
  mgrDeptNameAr: string | null;
  mgrDeptNameEn: string | null;
  branchId: number | null;
  branchNameAr: string | null;
  branchNameEn: string | null;
  mgrOfBranchId: number | null;
  mgrBranchNameAr: string | null;
  mgrBranchNameEn: string | null;
  roleId: number | null;
  roleNameAr: string | null;
  roleNameEn: string | null;
  everyone: boolean;
  sDate: string | null;
  hsDate: string | null;
  eDate: string | null;
  heDate: string | null;
  delegateId: number | null;
  note: string | null;
}

export interface RequestPostPermissionResponse {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: RequestPostPermission[];
}

export interface ProcessEmployeeDto {
  stsIds: string[];
  empIds: number[];
  everyone: number; // 0 or 1
  sDate: string;    // ISO date string
  eDate: string;    // ISO date string
  note: string;
}
export interface ProcessManagersOfDepartmentsDto {
  stsIds: string[];
  mgrOfDeptIds: number[];
  everyone: number; // 0 or 1
  sDate: string;    // ISO date string
  eDate: string;    // ISO date string
  note: string;
}
export interface ProcessDepartmentDto {
  stsIds: string[];
  deptIds: number[];
  everyone: number; // 0 or 1
  sDate: string;    // ISO date string
  eDate: string;    // ISO date string
  note: string;
}
export interface ProcessManagersOfBranchesDto {
  stsIds: string[];
  mgrOfBranchIds: number[];
  everyone: number; // 0 or 1
  sDate: string;    // ISO date string
  eDate: string;    // ISO date string
  note: string;
}
export interface ProcessBranchesDto {
  stsIds: string[];
  branchIds: number[];
  everyone: number; // 0 or 1
  sDate: string;    // ISO date string
  eDate: string;    // ISO date string
  note: string;
}
export interface ProcessRolesDto {
  stsIds: string[];
  roleIds: number[];
  everyone: number; // 0 or 1
  sDate: string;    // ISO date string
  eDate: string;    // ISO date string
  note: string;
}
export interface ProcessEveryOneDto {
  stsIds: string[];
  everyone: number; // 0 or 1
  sDate: string;    // ISO date string
  eDate: string;    // ISO date string
  note: string;
}