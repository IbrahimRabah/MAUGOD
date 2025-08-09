export interface BranchesPermissionsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    items: BranchPermission[];
  };
}

export interface BranchPermission {
  branchId: number;
  branchName: string;
  mgrId: number;
  mgrLabel: string;
  mgrAccessPermission: number;
  mgrAccessPermissionLabel: string;
  accessBranchChildren: boolean;
  accessBranchChildrenLabel: string;
  branchSel: string;
  cannotView: boolean;
  canView: boolean;
  canModify: boolean;
  accessChild: boolean;
}
