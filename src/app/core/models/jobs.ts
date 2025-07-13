export interface Job {
  jobTypId: number;
  jobId: number;
  arTitle: string;
  enTitle: string;
  arJobDesc: string;
  enJobDesc: string;
  note: string;
  del: string;
}
export interface JobResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    jobs: Job[];
    totalCount: number;
  };
}