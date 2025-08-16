export interface AppEmployee {
  empId: number;
  empName: string;
  deptId: number;
  deptName: string;
  branchId: number;
  branchName: string;
  directMgrId: number | null;
  directMgrName: string;
  natId: number;
  natName: string;
  gender: number;
  genderName: string;
  email: string;
  jobTypId: number | null;
  jobTypeName: string;
  sel: boolean;
}

export interface AppEmployeesResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    employees: AppEmployee[];
  };
}
