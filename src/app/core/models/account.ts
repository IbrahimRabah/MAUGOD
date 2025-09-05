export interface Account {
  userName: string;
  password: string;
}
export interface MenuItem {
  levelValue: number;
  labelValue: string;
  targetValue: string;
  isCurrent: boolean | null;
  imageValue: string;
}

export interface LoginResponse {
  statusCode: number;
    message: string;
    isSuccess: boolean;
    data: {
      empId: number;
      lang: number;
      empName: string | null;
      loginId: string | null;
      token: string;
      menuList: MenuItem[];
    };
  
}
