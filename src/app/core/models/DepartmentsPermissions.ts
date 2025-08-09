export interface DepartmentsPermissionsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    items: DepartmentPermission[];
  };
}

export interface DepartmentPermission {
  deptId: number;
  deptName: string;
  mgrId: number | null;
  mgrLabel: string;
  mgrAccessPermission: number;
  mgrAccessPermissionLabel: string;
  accessDeptChildren: boolean;
  accessDeptChildrenLabel: string;
  deptSel: string;
  cannotView: boolean;
  canView: boolean;
  canModify: boolean;
  accessChild: boolean;
}
