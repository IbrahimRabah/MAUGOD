
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface UpdateEmployeeHandleBalanceRequest {
  recId: number;
  allEmployee: boolean;
  empId: number;
  deptId: number;
  branchId: number;
  roleId: number;
  stsId: string;
  allSts: boolean;
  maxPerWeek: number;
  maxPerMonth: number;
  maxPerYear: number;
  forwardBalance: boolean;
  countBaseContractStart: boolean;
  fractionFloorCeil: boolean;
  includeWeekendInBetween: boolean;
  note: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeHandlesBalanceService {
  private apiUrl = `${environment.apiUrl}/api/EmployeeHandlesBalance`;

  constructor(private http: HttpClient) { }
  getEmployeeHandlesBalance(lang: string, pageNumber: number, pageSize: number) {
    const headers = {
      'lang': lang, // Use the passed language parameter directly
    };

    const params = {
      pageIndex: pageNumber,
      pageSize: pageSize
    }
    return this.http.get(`${this.apiUrl}/index`, { headers, params });
  }
  getEmployeeHandleBalanceById(id: number, lang: string) {
    const headers = { 'lang': lang }; // Use the passed language parameter directly
    return this.http.get(`${this.apiUrl}/GetEmployeeHandleBalanceById/${id}`, { headers });
  }
  addEmployeeHandleBalance(employeeHandleBalance: any) {
    return this.http.post(`${this.apiUrl}/AddEmployeeHandleBalance`, employeeHandleBalance);
  }
  updateEmployeeHandleBalance(body: UpdateEmployeeHandleBalanceRequest) {
    return this.http.put(`${this.apiUrl}`, body);
  }
  deleteEmployeeHandleBalance(id: number) {
    return this.http.delete(`${this.apiUrl}/DeleteEmployeeHandleBalanceById/${id}`);
  }

  processEmployee(processData: any, lang: number) {
    const headers = {
      'lang': lang.toString()
    };

    return this.http.post(`${this.apiUrl}/process-employees`, processData, { headers });
  }
  processDepartments(processData: any, lang: number) {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };

    return this.http.post(`${this.apiUrl}/process-depts`, processData, { headers });
  }
  processBranches(processData: any, lang: number) {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };

    return this.http.post(`${this.apiUrl}/process-branches`, processData, { headers });
  }
  processRoles(processData: any, lang: number) {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.post(`${this.apiUrl}/process-roles`, processData, { headers });
  }
}
