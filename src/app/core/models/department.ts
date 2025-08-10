export interface Departments {
  label: string;
  value: number;
}

export interface ParentDepartment {
  label: string;
  value: number;
}

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
    totalCount: number;

  };
}

export interface DepartmentLevel {
  label: string;
  value: number;
}

export interface DepartmentCreateUpdateRequest {
  ar: string;
  en: string;
  mgrId: number;
  parentDeptId: number;
  branchId: number;
  deptLevel: number;
  locId: number;
  locDesc: string;
  note: string;
}

