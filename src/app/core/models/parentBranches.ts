export interface ParentBranch {
  label: string;
  value: number;
}

export interface DataPayload {
  parentBranches: ParentBranch[];
}

export interface ParentBranchResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: DataPayload;
}

// Keep the old interface for backward compatibility
export interface DirectManagerResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: DataPayload;
}
