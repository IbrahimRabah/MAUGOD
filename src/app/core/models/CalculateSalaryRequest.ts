export interface CalculateSalaryRequest {
  sDate: string;
  eDate: string;
  note: string;
  paidAmount: number;
  outReference: string;
}
export interface SalaryData {
  recId: number;
  empId: number;
  empName: string;
  sDate: string; // ISO string or Date type
  hsDate: string; // Hijri date as string
  eDate: string; // ISO string or Date type
  heDate: string; // Hijri date as string
  sal: number;
  addonTot: number;
  minusTot: number;
  overtimeTot: number;
  lateDed: number;
  absentDed: number;
  noSignoutDed: number;
  totalAmount: number;
  paidAmount: number;
  calcTime: string; // ISO string or Date type
  calcByEmpId: number;
  calcByEmpName: string;
  outReference: string | null;
  note: string | null;
}

export interface SalaryResponse {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: SalaryData[];
}
