export interface MySalaryInfo {
  empId: number;
  empName: string;
  salary: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  paymentDate?: string;
  payrollPeriod?: string;
  overtimeHours?: number;
  overtimeAmount?: number;
  bonuses?: number;
  allowances?: number;
  taxes?: number;
  socialSecurity?: number;
  otherDeductions?: number;
}

export interface MySalaryResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: MySalaryInfo;
}
