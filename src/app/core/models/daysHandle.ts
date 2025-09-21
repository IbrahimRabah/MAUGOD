export interface DaysHandle {
  recId: number;
  empId: number;
  empName: string;
  deptId: number;
  deptName: string;
  stsId: string;
  stsName: string;
  part: number;
  sDate: string;       // ISO Date (e.g. 2021-06-07T00:00:00)
  hsDate: string;      // Hijri date string
  eDate: string;       // ISO Date
  heDate: string;      // Hijri date string
  createdBy: number;
  createdByName: string;
  reqId?: number | null;
  requestName?: string | null;
  recDate: string;     // ISO Date
  note?: string;
  daysCount: number;
  sel: boolean;

}


export interface DaysHandleResponse {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: DaysHandle[];
}


export interface ProcessEmployeesRequest {
  empIds: number[];     // list of employee IDs
  stsId: string;        // status ID
  part: number;         // part value
  sDate: string;        // start date (ISO string)
  eDate: string;        // end date (ISO string)
  note: string;         // additional note
}

export interface ProcessDepartmentsRequest {
  deptIds: number[];    // list of department IDs
  stsId: string;        // status ID
  part: number;         // part value
  sDate: string;        // start date (ISO string)
  eDate: string;        // end date (ISO string)
  note: string;         // additional note
  currentEmpId: number; // employee performing the action
}

export interface ProcessBranchesRequest {
  branchIds: number[];
  stsId: string;
  part: number;
  sDate: string;   // ISO date string
  eDate: string;   // ISO date string
  note: string;
  currentEmpId: number;
}

export interface ProcessRolesRequest {
  roleIds: number[];
  stsId: string;
  part: number;
  sDate: string;   // ISO date string
  eDate: string;   // ISO date string
  note: string;
  currentEmpId: number;
}

export interface UpdateDayHandleRequest {
  recId: number;
  stsId: string;
  part: number;
  sDate: string;   // ISO date string
  eDate: string;   // ISO date string
  note: string;
}

