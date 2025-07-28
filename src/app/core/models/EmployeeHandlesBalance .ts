export interface EmployeeHandlesBalanceResponse {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: EmployeeHandleBalance[];
}

export interface EmployeeHandleBalance {
  recId: number;
  allEmployee: boolean;
  empId: number;
  employeeName: string;
  deptId: number | null;
  departmentName: string | null;
  branchId: number | null;
  branchName: string | null;
  roleId: number | null;
  roleName: string | null;
  stsId: string;
  statusName: string;
  allSts: boolean;
  maxPerWeek: number | null;
  maxPerMonth: number;
  maxPerYear: number;
  forwardBalance: boolean;
  countBaseContractStart: boolean;
  fractionFloorCeil: boolean;
  includeWeekendInBetween: boolean;
  note: string | null;
  del: string;
}
