export interface EmployeesPermissionsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    items: EmployeePermission[];
  };
}

export interface EmployeePermission {
  empId: number;
  empName: string;
  directMgr: number;
  directMgrLabel: string;
  directMgrPermission: number;
  directMgrPermissionLabel: string;
  accessEmpChildren: boolean;
  accessEmpChildrenLabel: string;
  empSel: string;
  cannotView: boolean;
  canView: boolean;
  canModify: boolean;
  accessChild: boolean;
}
