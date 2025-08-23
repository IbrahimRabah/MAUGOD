export interface ReportDropdownListForRoleReportRight {
  label: string;
  value: string;
}



export interface ReportDropdownListForRoleReportRightResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    dropdownListsForRoleReportRights: ReportDropdownListForRoleReportRight[];
  };
}
