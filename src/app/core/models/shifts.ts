
export interface Shift {
  shiftId: number;
  shiftNameEn: string;
  shiftNameAr: string;
  shiftName: string;
  startTime: string | null;
  endTime: string | null;
  isActive: number | string;
  isActiveLabel:string;
  sun: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sunStyle: string;
  monStyle: string;
  tueStyle: string;
  wedStyle: string;
  thuStyle: string;
  friStyle: string;
  satStyle: string;
  sunId: number;
  monId: number;
  tueId: number;
  wedId: number;
  thuId: number;
  friId: number;
  satId: number;
}


export interface ShiftsResponse {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: Shift[];
}

export interface ShiftDetailsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: ShiftDetails[];
}
export interface ShiftDetails {
  style: string;
  ord: number;
  dayName: string;
  shiftId: number;
  part: number;
  openShift: string;
  earlyIn: number;
  in: string;
  allowIn: number;
  maxIn: number;
  overtimeIn: number;
  earlyOut: number;
  out: string;
  allowOut: number;
  maxOut: number;
  overtimeOut: number;
  shiftName:string
}

export interface GetShiftByIdResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: CreatShift[];
}
export interface CreatShift {
  shiftId: number;
  ar: string;
  en: string;

  openShift1: number;
  twoDays1: number;
  perActualWork1: number;
  earlyIn1: number;
  in1?: string; // ISO Date string
  inAllowMin1: number;
  maxIn1: number;
  makeupIn1: number;
  earlyOut1: number;
  out1?: string|null; // ISO Date string
  outAllowMin1: number;
  maxOut1: number;
  makeupOut1: number;

  openShift2?: number;
  twoDays2?: number;
  perActualWork2?: number;
  earlyIn2?: number;
  in2?: string|null;
  inAllowMin2?: number;
  maxIn2?: number;
  makeupIn2?: number;
  earlyOut2?: number;
  out2?: string|null;
  outAllowMin2?: number;
  maxOut2?: number;
  makeupOut2?: number;

  sat: number;
  sun: number;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;

  isActive: boolean;
}

export interface DaysShifts {
  label: string;
  value: number;
}
