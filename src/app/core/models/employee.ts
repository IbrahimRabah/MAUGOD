export interface Employee {
  rowId: string;
  empId: number;
  empName: string;
  directMgrName: string;
  deptName: string;
  activeFlag: string;
  statusId: number;
  statusStr: string;
  deptId: number;
  directMgr: string | null;
  natId: string;
  govId: string;
  gender: string;
  email: string;
  smsPhone: string;
  maritalStatus: string;
  jobTypId: number ;
  lang: string;
  note: string;
  reset: string;
  updatePk: string;
}
export interface EmployeeResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    employees: Employee[];
    totalCount: number;
  };
}
