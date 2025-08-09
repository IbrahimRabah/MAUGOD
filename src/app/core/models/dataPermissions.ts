export interface DataPermissionsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    dataPermissions: DataPermission[];
  };
}

export interface DataPermission {
  recId: number;
  fromEmployeeName: string;
  fromDepartmentName: string;
  fromManagerOfDepartmentName: string;
  fromBranchName: string;
  fromManagerOfBranchName: string;
  fromRoleName: string;
  toEmployeeName: string;
  toDepartmentName: string;
  toManagerOfDepartmentName: string;
  toBranchName: string;
  toManagerOfBranchName: string;
  toRoleName: string;
  startDate: string | null;       // ISO string or null
  startHijriDate: string;
  endDate: string | null;         // ISO string or null
  endHijriDate: string;
  changeData: string;
  delegateId: number | null;
  sourceId: number;
  note: string;
  del: string;
  sel: string;
}
