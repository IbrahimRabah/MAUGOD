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

export interface EmployeeCreateUpdateRequest {
  rowId: number;
  empId?: number;
  ar?: string;
  en?: string;
  activeFlag: number;
  statusId: number;
  fpid?: string;
  deptId: number;
  natId: number;
  gender: number;
  email?: string;
  smsPhone?: string;
  phone?: string;
  physicalAddress?: string;
  maritalStatus: number;
  birthDate?: string; // ISO string format for DateTime
  hireSDate?: string;
  hireEDate?: string;
  jobId?: string;
  jobTypId?: number;
  jobdesc?:string
  empVatInfo?: string;
  govId?: string;
  govIdExpiration?: string;
  employeeCardNo?: string;
  employeeCardExpiration?: string;
  driverLicenceNo?: string;
  driverLicenceExpiration?: string;
  healthCardNo?: string;
  healthCardExpiration?: string;
  insuranceCardInfo?: string;
  insuranceCardExpiration?: string;
  passportNo?: string;
  passportExpiration?: string;
  userName?: string;
  passwd?: string;
  lang: number;
  note?: string;
}
