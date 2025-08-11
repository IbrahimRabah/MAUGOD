export interface Shift {
  shiftId: string;
  shiftName: string;
  sunday: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunStyle: string;
  monStyle: string;
  tueStyle: string;
  wedStyle: string;
  thuStyle: string;
  friStyle: string;
  satStyle: string;
  isActive: string;
  det: string;
  del: string;
  shiftDay: string;
}

export interface ShiftsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    shifts: Shift[];
  };
}
