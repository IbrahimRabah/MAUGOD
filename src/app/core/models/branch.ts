
export interface Branch {
  branchId: number;
  branchName: string;
  mgrId: number | null;
  managerName: string;
  parentBranchId: number | null;
  parentBranchName: string;
  locId: number | null;
  locationName: string;
  locDesc: string;
  note: string;
  updatePk: string;
  del: string;
}

export interface BranchCreateUpdateRequest {
  ar: string;
  en: string;
  mgrId: number | null;
  locDesc: string;
  parentBranchId: number | null;
  locId: number | null;
  note: string;
}

export interface BranchResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    branches: Branch[];
    totalCount: number;
  };
}

export interface BranchEditResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    branchId: number;
    ar: string;
    en: string;
  mgrId: number | null;
    locDesc: string;
  parentBranchId: number | null;
    locId: number | null;
    note: string;
  };
}

export interface Branch{
  label: string;
  value: number;
}
