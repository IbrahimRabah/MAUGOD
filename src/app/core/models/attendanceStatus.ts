export interface AttendanceStatusData {
  sts_id: string;
  sts_name: string | null;

  ar:string|null,

  en:string|null

  count_in: number;
  count_in_desc: string | null;

  insert_default_in: number;
  insert_default_in_desc: string | null;

  count_out: number;
  count_out_desc: string | null;

  insert_default_out: number;
  insert_default_out_desc: string | null;

  is_it_vaction_when_calc_salry: number;
  is_it_vaction_when_calc_salry_desc: string | null;

  is_it_paid_vaction_when_calc_salry: number;
  is_it_paid_vaction_when_calc_salry_desc: string | null;

  is_it_absent_when_calc_salry: number;
  is_it_absent_when_calc_salry_desc: string | null;

  is_it_absent_multibly: number;
  is_it_absent_multibly_desc: string | null;

  is_it_absent_count_per_day: number;
  is_it_absent_count_per_day_desc: string | null;

  include_weekends: number;
  include_weekends_multibly: number;
  include_weekends_count_per_day: number;

  is_it_working_day: number;
  is_it_working_day_desc: string | null;

  created_by: number;
  created_by_desc: string | null;

  app_calssifay_as: number;
  app_calssifay_as_desc: string | null;

  web_calssifay_as: number;
  web_calssifay_as_desc: string | null;

  note: string | null;
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
