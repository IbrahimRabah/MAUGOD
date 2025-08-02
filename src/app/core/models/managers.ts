export interface Manager {
  label: string;
  value: number;
}

export interface DataPayload {
  managers: Manager[];
}

export interface ManagerResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: DataPayload;
}
