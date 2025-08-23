export interface RoleDropdownListForRoleReportRight {
  label: string;
  value: string;
}



export interface RoleDropdownListForRoleReportRightResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    dropdownListsForRoleReportRights: RoleDropdownListForRoleReportRight[];
  };
}
