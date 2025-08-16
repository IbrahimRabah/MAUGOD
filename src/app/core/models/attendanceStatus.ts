export interface AttendanceStatusData {
  sts_id: string;
  sts_name: string;
  ar: string;
  en: string;
  count_in: number;
  insert_default_in: number;
  count_out: number;
  insert_default_out: number;
  is_it_vaction_when_calc_salry: number;
  is_it_paid_vaction_when_calc_salry: number;
  is_it_absent_when_calc_salry: number;
  is_it_absent_multibly: number;
  is_it_absent_count_per_day: number;
  include_weekends: number;
  include_weekends_multibly: number;
  include_weekends_count_per_day: number;
  is_it_working_day: number;
  created_by: number;
  app_calssifay_as: number;
  web_calssifay_as: number;
  note: string;
}

export interface AttendanceStatusResponse {
  totalCount: number;
  pageSize: number;
  pageIndex: number;
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: AttendanceStatusData[];
}

export interface AttendanceStatusCreate {
  ar: string;
  en: string;
  countIn: number;
  insertDefaultIn: number;
  countOut: number;
  insertDefaultOut: number;
  isVacationWhenCalcSalary: number;
  isPaidVacationWhenCalcSalary: number;
  isAbsentWhenCalcSalary: number;
  isAbsentMultiply: number;
  isAbsentCountPerDay: number;
  includeWeekends: number;
  includeWeekendsMultiply: number;
  includeWeekendsCountPerDay: number;
  isWorkingDay: number;
  appClassifyAs: number;
  webClassifyAs: number;
  note: string;
}
export interface AttendanceStatusUpdate {
  stsId: string;
  ar: string;
  en: string;
  countIn: number;
  insertDefaultIn: number;
  countOut: number;
  insertDefaultOut: number;
  isVacationWhenCalcSalary: number;
  isPaidVacationWhenCalcSalary: number;
  isAbsentWhenCalcSalary: number;
  isAbsentMultiply: number;
  isAbsentCountPerDay: number;
  includeWeekends: number;
  includeWeekendsMultiply: number;
  includeWeekendsCountPerDay: number;
  isWorkingDay: number;
  appClassifyAs: number;
  webClassifyAs: number;
  note: string;
}
