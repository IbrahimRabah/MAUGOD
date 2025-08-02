export interface Location {
  label: string;
  value: number;
}

export interface DataPayload {
  locations: Location[];
}

export interface LocationResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: DataPayload;
}
