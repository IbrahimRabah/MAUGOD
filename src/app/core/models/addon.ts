export interface Addon {
  addonId?: number;
  ar: string;
  en: string;
  addDed: number;
  perWorkingDay: boolean;
  includeWhenDedAbsent: boolean;
  includeWhenInVaction: boolean;
  includeWhenInPaidVaction: boolean;
  includeInEndOfService: boolean;
  note: string | null;
  del?: string;
}

export interface AddOnsApiResponse {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: Addon[];
}
