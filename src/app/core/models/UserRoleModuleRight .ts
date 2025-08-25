// models/system-permissions.models.ts
export interface UserRoleModuleRight {
  recId: number;
  modId: number;
  modName: string;

  roleId: number;
  roleName: string;

  canView: boolean;
  canViewTrans: string;

  canCreate: boolean;
  canCreateTrans: string;

  canEdit: boolean;
  canEditTrans: string;

  canDelete: boolean;
  canDeleteTrans: string;

  canAddPublicRep: boolean;
  canAddPublicRepTrans: string;

  del: string;   // server returns "Del"
  sel: boolean;  // selection flag
}

export interface UserRoleModuleRightsData {
  userRoleModuleRights: UserRoleModuleRight[];
  totalCount : number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: T;
}
export interface DeleteUserRoleModuleRightResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any; // optional, adjust type if API returns specific payload
}
// models/delete-selected-user-role-module-rights.models.ts
export interface DeleteSelectedUserRoleModuleRightsRequest {
  recIds: number[];
}

export interface DeleteSelectedUserRoleModuleRightsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any; // optional if API sends additional payload
}

// models/modules-dropdown.models.ts
export interface GetModulesDropdownListRequest {
  roleId?: number; // optional
}

export interface ModuleDropdownItem {
  value: string;
  label: string;
  // add any extra fields returned by the API
}

export interface GetModulesDropdownListResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    dropdownListsForRoleModuleRights: ModuleDropdownItem[];
  };
}

// models/create-user-role-module-rights.models.ts
export interface CreateUserRoleModuleRightsRequest {
  roleId: number;
  modIdsString: string;
  canView: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canAddPublicRep: boolean;
}

export interface CreateUserRoleModuleRightsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any; // Optional, adjust if there's a payload
}
// models/source-roles-dropdown.models.ts
export interface DropdownItem {
  label: string;
  value: string; // can be number if it's expected as a numeric ID
}

export interface GetRolesDropdownListResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    dropdownListsForRoleModuleRights: DropdownItem[];
  };
}


export interface GetUserRoleModuleRightsBySrcRoleResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    userRoleModuleRights: any[];
    totalCount: number;
  };
}

// models/custom-user-role-module-rights-copy.models.ts
export interface CustomUserRoleModuleRightsCopyRequest {
  destinationRoleId: number;
  selectedRecIds: number[]; // array of recIds to copy
}

export interface CustomUserRoleModuleRightsCopyResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any; // Optional, adjust if there's a payload in the response
}


// models/typical-user-role-module-rights-copy.models.ts
export interface TypicalUserRoleModuleRightsCopyRequest {
  sourceRoleId: number;
  destinationRoleId: number;
}

export interface TypicalUserRoleModuleRightsCopyResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any; // Optional, adjust if there's a payload in the response
}
// models/user-role-module-right-by-id.models.ts
export interface UserRoleModuleRight {
  recId: number;
  modId: number;
  modName: string;
  roleId: number;
  roleName: string;
  canView: boolean;
  canViewTrans: string;
  canCreate: boolean;
  canCreateTrans: string;
  canEdit: boolean;
  canEditTrans: string;
  canDelete: boolean;
  canDeleteTrans: string;
  canAddPublicRep: boolean;
  canAddPublicRepTrans: string;
  del: string;
  sel: boolean;
}

export interface GetUserRoleModuleRightByIdResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    userRoleModuleRights: UserRoleModuleRight[];
  };
}
// models/update-user-role-module-right.models.ts
export interface UpdateUserRoleModuleRightRequest {
  rec_ID: number;
  roleId: number;
  mod_ID: number;
  canView: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canAddPublicRep: boolean;
}

export interface UpdateUserRoleModuleRightResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any; // Optional, adjust if there's a payload in the response
}
