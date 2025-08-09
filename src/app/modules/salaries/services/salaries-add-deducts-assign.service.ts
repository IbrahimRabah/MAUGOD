import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { EmployeeAssignData, SalariesAssignResponse, AddEmployeeSalaryRequest } from '../../../core/models/salariesAssign';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalariesAddDeductsAssignService {
  private apiUrl = `${environment.apiUrl}/api/SalariesDetails`;
  constructor(private http: HttpClient) { }

  getAllEmployeeSalaries(lang:number , pageIndex: number, pageSize: number): Observable<SalariesAssignResponse> {
    const headers = {
      'accept': 'text/plain',
      'lang': lang.toString()
    };
    return this.http.get<SalariesAssignResponse>(`${this.apiUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}`, { headers });
  }
  
  addEmployeeSalary(detail: AddEmployeeSalaryRequest, lang: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.post(`${this.apiUrl}`, detail, { headers });
  }
  deleteEmployeeSalary(recId : number, lang: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.delete(`${this.apiUrl}/${recId}`, { headers });
  }
}
