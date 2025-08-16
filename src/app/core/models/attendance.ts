
export interface Attendance {
  timId: number;
  empId: number;
  empName: string;
  deptId: number;
  deptName: string;
  signDate: string; // ISO string, e.g. "2025-08-13"
  hijriDate: string;
  dayName: string;
  shiftId: string;
  shiftName: string;
  part: number;
  stsId: string;
  stsName: string;
  stsIdStyle?: string;
  in1?: string;
  lateIn?: number;
  lateInStyle?: string;
  overtimeIn?: number;
  overtimeInStyle?: string;
  out1?: string;
  earlyOut?: number;
  earlyOutStyle?: string;
  overtimeOut?: number;
  overtimeOutStyle?: string;
  dfltMin: string;
  realMin: string;
  countedMin: string;
  manualFlag?: boolean;
  note?: string;
  details?: string;
  del?: string;
  sel?: number;
}

export interface AttendanceResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    attendance: Attendance[];
    totalCount: number;
  };
}


export interface PunchTransaction {
  recId: number;
  empId: number;
  signDate: string;
  hdate: string;
  recDate: string |null;
  dataSource: string;
  dataSourceLabel: string;
  tranSourceId: string;
  del: string;
  sel: number;
  empName: string;
}



export interface PunchTransactionsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    tenter: PunchTransaction[];
    totalCount: number;
  };
}
