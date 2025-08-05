import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalculateSalaryRequest, SalaryResponse } from '../../../core/models/CalculateSalaryRequest';



@Injectable({
  providedIn: 'root',
})
export class SalariesCalculationsService {
  private apiUrl = `${environment.apiUrl}/api/SalariesCalculation`;

  constructor(private http: HttpClient) {}

  // Generic method to get paginated salaries calculations
  getSalariesCalculations(lang: string, pageNumber: number, pageSize: number): Observable<SalaryResponse> {
    const headers = {
      'accept': 'text/plain',
      'lang': lang
    };

    const params = {
      pageSize: pageSize,
      pageIndex: pageNumber
    };
    
    return this.http.get<SalaryResponse>(`${this.apiUrl}`, { headers, params });
  }


  // Specific salary calculation methods
  calculateSalaryByEmployee(body: CalculateSalaryRequest & { empIds: number[] }, lang: number): Observable<any> {
    const headers = {
      'lang': lang.toString()
    };
    return this.http.post(`${this.apiUrl}/calculate-by-employee`, body, { headers });
  }

  calculateSalaryByDepartment(body: CalculateSalaryRequest & { deptIds: number[] }, lang: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.post(`${this.apiUrl}/calculate-by-department`, body, { headers });
  }

  calculateSalaryByBranch(body: CalculateSalaryRequest & { branchIds: number[] }, lang: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.post(`${this.apiUrl}/calculate-by-branch`, body, { headers });
  }

  calculateSalaryByRole(body: CalculateSalaryRequest & { roleIds: number[] }, lang: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.post(`${this.apiUrl}/calculate-by-role`, body, { headers });
  }
}
