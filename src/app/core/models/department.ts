export interface Department {
  deptId: number;
  deptName: string;
  mgrId: number | null;
  mgrName: string;
  locId: number | null;
  locName: string;
  locDesc: string;
  parentDeptId: number | null;
  parentDeptName: string;
  branchId: number;
  branchName: string;
  deptLevel: number;
  note: string;
  updatePk: string;
  del: string;
}


export interface DepartmentResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    departments: Department[];
  };
}
