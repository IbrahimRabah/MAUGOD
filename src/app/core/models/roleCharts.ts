export interface ChartDropdownResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: ChartDropdownData[];
}
export interface Roles {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: RoleDropdownData[];
}
export interface RoleDropdownData {
  label: string;  // Label for the role
  roleId: number; // ID of the role
}

export interface ChartDropdownData {
  label: string;  // Label for the chart
  chartId: number; // ID of the chart
}
export interface RoleChartRightsResponse {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: RoleChartData[];
}

export interface RoleChartData {
  recId: number;
  roleId: number;
  roleNameAr: string; // Arabic role name
  roleNameEn: string; // English role name
  chartId: number;
  chartNameAr: string; // Arabic chart name
  chartNameEn: string; // English chart name
  delegateId: number | null; // Delegate ID (nullable)
  delegateNameAr: string | null; // Delegate Arabic name (nullable)
  delegateNameEn: string | null; // Delegate English name (nullable)
}
export interface RoleChartRightsRequest {
  roleId: number;     // ID of the role
  chartIds: number[]; // Array of chart IDs
}
export interface DeleteMultipleRoleChartRightsRequest {
  recIds: number[]; // Array of resource IDs to delete
}