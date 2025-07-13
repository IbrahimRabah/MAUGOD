export interface Bank {
  bankId: number;
  ar_Name?: string;
  en_Name?: string;
  en: string;
  ar: string;
  bankData: string;
  note: string;
  del: string;
}
export interface BankResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    banks: Bank[];
    totalCount: number;
  };
}