export interface SalariesAssignResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: EmployeeAssignData[];
  totalCount: number;
  pageSize: number;
  pageIndex: number;
}

export interface EmployeeAssignData {
  recId: number;
  empId: number;
  employeeName: string;
  addonId: number;
  addonName: string;
  amnt: number;
  sdate: string;  // You can use Date type if you parse the string into Date
  hsdate: string;
  edate: string;  // Same as above, consider Date type
  hedate: string;
  note: string;
}

export interface AddEmployeeSalaryRequest {
  empIds: number[];
  addonId: number;
  amnt: number;
  sdate: string;
  edate: string;
  note: string;
}
