export type YesNoFlag = 0 | 1;
export type YesNoDesc = 'Yes' | 'No';

export interface AutoSign {
  recId: number;
  empId: number;
  empName: string;

  deptId: number;
  deptName: string;
  mgrOfDeptId: number | null;
  mgrOfDeptName: string;

  branchId: number;
  branchName: string;
  mgrOfBranchId: number | null;
  mgrOfBranchName: string;

  roleId: number | null;
  roleName: string;

  sDate: string;   // ISO: "2022-01-30T00:00:00"
  hsDate: string;  // Hijri as string
  eDate: string;
  heDate: string;

  shiftPart: number;
  shiftPartName: string;

  autoIn: YesNoFlag;
  autoInDesc: YesNoDesc;
  autoOut: YesNoFlag;
  autoOutDesc: YesNoDesc;

  sat: YesNoFlag;
  satDesc: YesNoDesc;
  sun: YesNoFlag;
  sunDesc: YesNoDesc;
  mon: YesNoFlag;
  monDesc: YesNoDesc;
  tue: YesNoFlag;
  tueDesc: YesNoDesc;
  wed: YesNoFlag;
  wedDesc: YesNoDesc;
  thu: YesNoFlag;
  thuDesc: YesNoDesc;
  fri: YesNoFlag;
  friDesc: YesNoDesc;

  sts: number;        // e.g., 2
  stsDesc: string;    // e.g., "Expired"

  note: string;
  del: string;        // e.g., "Del"
}

export interface AutoSignsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    autoSigns: AutoSign[];
    totalCount:number;
  };
}

export interface AutoSignRequest {
  empId: number;
  deptId: number;
  mgrOfDeptId: number;
  branchId: number;
  mgrOfBranchId: number;
  roleId: number;
  sDate: string; // ISO date string: "YYYY-MM-DDTHH:mm:ss.sssZ"
  eDate: string; // ISO date string
  shiftPart: number;
  autoIn: number;
  inRandomBfor: number;
  inRandomAftr: number;
  autoOut: number;
  outRandomBfor: number;
  outRandomAftr: number;
  sts: number;
  sat: number;
  sun: number;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  note: string;
  lang: number;
}

export interface AutoSignDeleteResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: boolean;
}
