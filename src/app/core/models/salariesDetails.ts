export interface SalariesDetailsData {
  empId: number;
  empName: string;
  contractStart: string;
  hsDate: string;
  salType: number;
  salary: number;
  freeLate: number;
  includeFreeLateAfterExceedLimit: boolean;
  minutes2Days: number;
  countParialLate: boolean;
  separateOvertime: boolean;
  overtimeHrCost: number;
  maxOvertime: number;
  absentPerMY: number;
  noSignoutPerMY: number;
  bankId: number;
  bankName: string;
  contractFileSize: number;
  note: string;
  del: string;
}

export interface SalariesDetailsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: SalariesDetailsData[];
  totalCount: number;
  pageSize: number;
  pageIndex: number;
}
export interface EmployeeContractDetails {
  empId: number;
  contractStart: string;
  salType: number;
  monthSal: number;
  hourSal: number;
  freeLate: number;
  includeFreeLateAfterExceedLimit: boolean;
  minutes2Days: number;
  countParialLate: boolean;
  separateOvertime: boolean;
  overtimeHrCost: number;
  maxOvertime: number;
  absentPerMY: number;
  absent1Day: number;
  absent2Day: number;
  absent3Day: number;
  absent4Day: number;
  absent5Day: number;
  absent6Day: number;
  absent7Day: number;
  absentMoreDay: number;
  noSignoutPerMY: number;
  noSignout1Day: number;
  noSignout2Day: number;
  noSignout3Day: number;
  noSignout4Day: number;
  noSignout5Day: number;
  noSignout6Day: number;
  noSignout7Day: number;
  noSignoutMoreDay: number;
  bankId: number;
  accountNumber: string;
  accountIban: string;
  contractType: string;
  contractUrl: string;
  note: string;
}

