export interface ShiftAssign {
  rec_Id: number;
  emp_Id: number;
  emp_Name: string;
  shift_Id: string;
  shift_Label: string;
  sdate: string;    // ISO date string
  hsdate: string;
  edate: string;
  hedate: string;
  assign_Sts: string;
  active: number;
  del: string;
  sel: boolean;
}

export interface GetShiftsAssignResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
      records: ShiftAssign[];
      totalCount: number;
    };
}

export interface DeleteShiftsAssignRequest {
  ids: number[];
  lang: number;
}

export interface CreateShiftsAssignRequest {

  empId: number | null;
  deptId: number | null;
  branchId: number | null;
  roleId: number | null;
  shiftId: number;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  lang: number;
}
