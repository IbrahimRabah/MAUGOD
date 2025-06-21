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
  totalCount: number;
}
