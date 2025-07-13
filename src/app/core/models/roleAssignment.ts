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
