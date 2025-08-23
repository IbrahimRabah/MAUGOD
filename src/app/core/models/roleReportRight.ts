export interface RoleReportRight {
  recId: bigint;
  reportId: number;
  reportName?: string;
  roleId: number;
  roleName?: string;
  delegateId?: bigint;
  sel: boolean;
  del: string;
}



export interface RoleReportRightResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    userRoleReportRights: RoleReportRight[];
    totalCount: number;
  };
}
