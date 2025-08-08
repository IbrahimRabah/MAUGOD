import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeContractDetails, SalariesDetailsResponse } from '../../../core/models/salariesDetails';

@Injectable({
  providedIn: 'root'
})
export class SalariesDetailsService {
  private apiUrl = `${environment.apiUrl}/api/Salary`;

  constructor(private http: HttpClient) { }
  
  getAllSalaryDetails(lang: number, mgrId: number, pageIndex: number, pageSize: number): Observable<SalariesDetailsResponse> {
    const headers = new HttpHeaders({
      'accept': 'text/plain',
      'lang': lang.toString()
    });

    // Log the full URL being called for debugging
    const url = `${this.apiUrl}/index?mgrId=${mgrId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

    return this.http.get<SalariesDetailsResponse>(url, { headers });
  }
  addSalaryDetail(detail: EmployeeContractDetails, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
    return this.http.post(this.apiUrl, detail, { headers });
  }
  updateSalaryDetail(empId: number, detail: EmployeeContractDetails, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
    return this.http.put(`${this.apiUrl}/${empId}`, detail, { headers });
  }
  deleteSalaryDetail(empId: number, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
    return this.http.delete(`${this.apiUrl}/${empId}`, { headers });
  }
}
