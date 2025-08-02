export interface DirectManager {
  label: string;
  value: number;
}

export interface DataPayload {
  directManagers: DirectManager[];
}

export interface DirectManagerResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: DataPayload;
}
