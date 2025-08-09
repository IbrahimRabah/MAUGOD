export interface DataPermissionRequestToEmployee {
  fromEmpId: number;
  fromMgrOfDeptId: number;
  fromDeptId: number;
  fromMgrOfBranchId: number;
  fromBranchId: number;
  fromRoleId: number;
  toEmpId: number[];
  changeDataEmp: number;
  sDate: string; // ISO date string
  eDate: string; // ISO date string
  note: string;
}

export interface DepartmentManagerPermissionRequest {
  fromEmpId: number;
  fromMgrOfDeptId: number;
  fromDeptId: number;
  fromMgrOfBranchId: number;
  fromBranchId: number;
  fromRoleId: number;
  toMgrOfDeptId: number[];
  changeDataDeptMgr: number;
  sDate: string; // ISO date string
  eDate: string; // ISO date string
  note: string;
}

export interface DepartmentPermissionRequest {
  fromEmpId: number;
  fromMgrOfDeptId: number;
  fromDeptId: number;
  fromMgrOfBranchId: number;
  fromBranchId: number;
  fromRoleId: number;
  toDeptId: number[];
  changeDataDept: number;
  sDate: string; // ISO date string
  eDate: string; // ISO date string
  note: string;
}

export interface BranchManagerPermissionRequest {
  fromEmpId: number;
  fromMgrOfDeptId: number;
  fromDeptId: number;
  fromMgrOfBranchId: number;
  fromBranchId: number;
  fromRoleId: number;
  toMgrOfBranchId: number[];
  changeDataBranchMgr: number;
  sDate: string; // ISO date string
  eDate: string; // ISO date string
  note: string;
}

export interface BranchPermissionRequest {
  fromEmpId: number;
  fromMgrOfDeptId: number;
  fromDeptId: number;
  fromMgrOfBranchId: number;
  fromBranchId: number;
  fromRoleId: number;
  toBranchId: number[];
  changeDataBranch: number;
  sDate: string; // ISO date string
  eDate: string; // ISO date string
  note: string;
}

export interface RolePermissionRequest {
  fromEmpId: number;
  fromMgrOfDeptId: number;
  fromDeptId: number;
  fromMgrOfBranchId: number;
  fromBranchId: number;
  fromRoleId: number;
  toRoleId: number[];
  changeDataRole: number;
  sDate: string; // ISO date string
  eDate: string; // ISO date string
  note: string;
}

export interface SaveEmployeeManagerPermissionsRequest {
  noPermissionEmployees: number[];
  viewOnlyEmployees: number[];
  fullAccessEmployees: number[];
  accessEmpChildren: number[];
}

export interface SaveDepartmentManagerPermissionsRequest {
  noPermissionDepartments: number[];
  viewOnlyDepartments: number[];
  fullAccessDepartments: number[];
  accessDeptChildren: number[];
}

export interface SaveBranchManagerPermissionsRequest {
  noPermissionBranches: number[];
  viewOnlyBranches: number[];
  fullAccessBranches: number[];
  accessBranchChildren: number[];
}
