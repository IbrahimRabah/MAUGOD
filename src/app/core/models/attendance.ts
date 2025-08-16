
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

export interface ShiftInformation {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: Shift[];
}

export interface Shift{
  shiftId: number;
  partId: number;
  timtranId: number;
  shiftName: string;
  part: string;
  openShift: string;      // looks like time in "HHmm" format
  earlyIn: number;
  in: string;             // "HH:mm:ss"
  inAllow: number;
  maxIn: number;
  makeupIn: number;
  earlyOut: number;
  out: string;            // "HH:mm:ss"
  outAllow: number;
  maxOut: number;
  makeupOut: number;
  twoDays: string;        // "Yes" | "No"
  twoDaysValue: number;
  perActualWork: string;  // "Yes" | "No"
  perActualWorkValue: number;
}


export interface FingerprintInformation {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: Fingerprint[];
}

export interface Fingerprint{
  recId: number;
  empId: number;
  empName?: string;
  signDate?: string; // ISO string (e.g., "2023-05-24T00:00:00")
  dataSource?: number;
  dataSourceName?: string;
}


export interface MobileSignInformation {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: MobileSign[];
}

export interface MobileSign{
  mobTranId: number;        
  empId: number;            
  empName?: string;         
  signDate?: string;        
  sts?: number;             
  stsName?: string;         
  fpTyp?: number;           
  fpTypName?: string;       
}

export interface DaysHandleIformation {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: DaysHandle[];
}

export interface DaysHandle{
   recId: number;   
  empId: number;    
  empName?: string;  
  stsId: number;    
  stsName?: string;   
  part: number;      
  partName?: string;   
  sDate?: string;   
  eDate?: string;    
  note?: string;    
}
export interface ChangedTimesIformation {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: ChangedTime[];
}

export interface ChangedTime{
  timId: number;               
  txt?: string;                
  oldDate?: string;            
  editDateTime?: string;       
  changedByEmp?: number;       
  changedByEmpName?: string;   
}
