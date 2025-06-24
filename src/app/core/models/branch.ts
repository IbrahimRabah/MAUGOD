import { ApiResponse } from "./apiResponse";

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

export interface BranchResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    branches: Branch[];
    totalCount: number;
  };
}