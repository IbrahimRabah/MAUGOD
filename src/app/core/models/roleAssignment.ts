export interface UserRoleAssignment {
  recId: number;
  fromEmployeeName: string;
  fromDepartmentName: string | null;
  fromManagerOfDepartmentName: string | null;
  fromBranchName: string | null;
  fromManagerOfBranchName: string | null;
  fromRoleName: string;
  startDate: string | null;
  startHijriDate: string | null;
  endDate: string | null;
  endHijriDate: string | null;
  delegateId: number | null;
  note: string | null;
  del: string;
  sel: string; // this is HTML string for a checkbox
}

// src/app/core/models/role-assignment.request.ts
export interface AssignUserRolesRequest {
  assignedRoles: number[];
  empIds: number[];
  mgrOfDeptIds: number[];
  deptIds: number[];
  mgrOfBranchIds: number[];
  branchIds: number[];
  roleIds: number[];
  fromDate: string;   // ISO string: new Date().toISOString()
  toDate: string;     // ISO string
  notes: string;
  currentEmpId: number;
}


export interface UserRoleAssignmentsData {
  userRoleAssignments: UserRoleAssignment[];
  totalCount: number;
}

export interface UserRoleAssignmentsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: UserRoleAssignmentsData;
}
