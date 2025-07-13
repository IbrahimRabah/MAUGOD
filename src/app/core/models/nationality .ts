export interface Nationality {
  natId: string;
  ar_Name?: string;
  ar: string;
  en: string;
  en_Name?: string;
  note: string;
  del: string;
}



export interface NationalityResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    nationalities: Nationality[];
    totalCount: number;
  };
}
