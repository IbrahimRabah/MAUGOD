export interface MobileSignLocation {
  locId: number;
  ar: string;
  en: string;
  x: number;          // latitude
  y: number;          // longitude
  radius: number;     // meters
  status: string;     // comes as "1" | "0" from backend
  statusName: string; // e.g., "Active"
  note: string;
}

export interface MobileSignLocationsResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: {
    mobileSignLocations: MobileSignLocation[];
  };
}
export interface MobileSignLocationCreateDto {
  ar: string;
  en: string;
  x: number;
  y: number;
  radius: number;
  status: number;   // backend expects int (e.g., 0/1)
  note: string;
}

export interface CreateMobileSignLocationRequest {
  mobileSignLocationCreateDto: MobileSignLocationCreateDto;
}

export interface CreateMobileSignLocationResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any; // adjust type if backend sends created entity back
}
export interface MobileSignLocationUpdateDto {
  loc_Id: number;   // the ID of the location to update
  ar: string;
  en: string;
  x: number;
  y: number;
  radius: number;
  note: string;
}

export interface UpdateMobileSignLocationRequest {
  mobileSignLocationUpdateDto: MobileSignLocationUpdateDto;
}

export interface UpdateMobileSignLocationResponse {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data?: any; // adjust if API returns the updated record
}
