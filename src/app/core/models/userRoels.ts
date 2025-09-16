export interface RoleResponse {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: RoleData[];
}

export interface RoleData {
  roleId: number;
  ar: string;          // Arabic description
  en: string;          // English description
  isVirtual: boolean;  // Whether the role is virtual
  note?: string | null; // Optional note
}
export interface createUserRoleRequest {
  ar: string;          // Arabic description
  en: string;          // English description
  isVirtual: boolean;  // Whether the role is virtual
  note?: string | null; // Optional note
}
export interface UpdateUserRoleRequest {
  roleId: number;
  ar: string;          // Arabic description
  en: string;          // English description
  isVirtual: boolean;  // Whether the role is virtual
  note?: string | null; // Optional note
}