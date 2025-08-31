import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeContractDetails, SalariesDetailsResponse } from '../../../core/models/salariesDetails';

@Injectable({
  providedIn: 'root'
})
export class SalariesDetailsService {
  private apiUrl = `${environment.apiUrl}/api/Salary`;

  constructor(private http: HttpClient) { }
  
  getAllSalaryDetails(lang: number, mgrId: number, pageIndex: number, pageSize: number, colunmSearchName: string | null, colunmSearchValue: string | null): Observable<SalariesDetailsResponse> {
      let params = new HttpParams()
                  .set('pageSize', pageSize.toString())
                  .set('pageIndex', pageIndex.toString());
      
      if(colunmSearchName && colunmSearchValue){
        params = params.set(colunmSearchName, colunmSearchValue);
      }

    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.get<SalariesDetailsResponse>(`${this.apiUrl}/index`, { headers, params });

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
