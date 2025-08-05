export interface ApiResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any;
}