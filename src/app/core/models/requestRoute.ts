export interface GetRequestApprovalRoutesRequest {
  pageNumber: number;
  pageSize: number;
  searchColumn?: string;
  searchText?: string;
}

export interface RequestApprovalRoute {
  routeId: number;
  empId: number;
  empName: string;
  deptIdMgr: number | null;
  deptMgrName: string;
  branchIdMgr: number | null;
  branchMgrName: string;
  deptId: number | null;
  deptName: string;
  branchId: number | null;
  branchName: string;
  roleId: number | null;
  roleName: string;
  forEveryoneId: number;
  forEveryoneName: string;
  reqLevelId: number;
  reqLevelName: string;
  isActive: boolean;
  isActiveText: string;
  stsId: string;
  stsName: string;
  note: string;
  det: string;
  str: string;
  del: string;
}

export interface GetRequestApprovalRoutesResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    requestApprovalRoutes: RequestApprovalRoute[];
    totalCount: number;
  };
}
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: T;
}

export interface DropdownItem {
  label: string;
  value: string; // API returns it as string (e.g., "-1")
}

export interface EmployeesDropdownData {
  dropdownListsForTimeTransactionApprovals: DropdownItem[];
}
export interface ManagersDropdownData {
  managersDropdownListForTimeTransactionApproval: DropdownItem[];
}

export interface DepartmentsOrMgrDropdownData {
  departmentsOrMgrOfDeptsDropdownListForTimeTransactionApproval: DropdownItem[];
}

export interface BranchesOrMgrDropdownData {
  // Keeping API spelling "Branchs" to match the endpoint family
  branchsOrMgrOfBranchsDropdownListForTimeTransactionApproval: DropdownItem[];
}

export interface RolesDropdownData {
  rolesDropdownListForTimeTransactionApproval: DropdownItem[];
}

export interface StatuesDropdownData {
  // Keeping "Statues" as in the API name you provided
  statuesDropdownListForRequestApprovalRoute: DropdownItem[];
}

export interface RequestLevelsDropdownData {
  requestLevelsDropdownListForTimeTransactionApproval: DropdownItem[];
}
export interface AfterLimitActionsDropdownData {
  afterLimitActionsDropdownListForTimeTransactionApproval: DropdownItem[];
}
export interface LevelsDropdownData {
  levelsDropdownListForTimeTransactionApproval: DropdownItem[];
}
export interface DeleteRequestApprovalRouteResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: boolean;
}
export interface RoadMapDetail {
  routeId: number;
  level: number;
  levelName: string;
  details: string;
}

export interface RoadMapDetailsData {
  roadMapDetailsForRequestApprovalRoutes: RoadMapDetail[];
  totalCount: number;
}

export interface GetRoadMapDetailsForRequestApprovalRouteResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: RoadMapDetailsData;
}
export interface RouteDetailsLevel {
  dynDirectMgr: number;
  dynDirectMgrLevel: number;
  dynDirectMgrDaysLimits: number;
  dynDirectMgrAfterLimitAction: number;
  dynMgrOfDept: number;
  dynMgrOfDeptLevel: number;
  dynMgrOfDeptDaysLimits: number;
  dynMgrOfDeptAfterLimitAction: number;
  dynMgrOfBranch: number;
  dynMgrOfBranchLevel: number;
  dynMgrOfBranchDaysLimits: number;
  dynMgrOfBranchAfterLimitAction: number;
  mgrId: number;
  mgrIdDaysLimits: number;
  mgrIdAfterLimitAction: number;
  mgrOfDeptId: number;
  mgrOfDeptIdDaysLimits: number;
  mgrOfDeptIdAfterLimitAction: number;
  mgrOfBranchId: number;
  mgrOfBranchIdDaysLimits: number;
  mgrOfBranchIdAfterLimitAction: number;
  deptId: number;
  deptIdDaysLimits: number;
  deptIdAfterLimitAction: number;
  branchId: number;
  branchIdDaysLimits: number;
  branchIdAfterLimitAction: number;
  roleId: number;
  roleIdDaysLimits: number;
  roleIdAfterLimitAction: number;
  noteDetails: string;
}

export interface RequestApprovalRouteCreateDto {
  empId: number;
  mgrOfDeptId: number;
  mgrOfBranchId: number;
  deptId: number;
  branchId: number;
  roleId: number;
  statusId: string;
  forEveryone: number;
  reqLevels: number;
  isActive: boolean;
  note: string;
  detailsLevel1?: RouteDetailsLevel;
  detailsLevel2?: RouteDetailsLevel;
  detailsLevel3?: RouteDetailsLevel;
  detailsLevel4?: RouteDetailsLevel;
  detailsLevel5?: RouteDetailsLevel;
  detailsLevel6?: RouteDetailsLevel;
  detailsLevel7?: RouteDetailsLevel;
  detailsLevel8?: RouteDetailsLevel;
  detailsLevel9?: RouteDetailsLevel;
}

export interface CreateRequestApprovalRouteRequest {
  requestApprovalRouteCreateDto: RequestApprovalRouteCreateDto;
}

export interface CreateRequestApprovalRouteResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: boolean;
}
