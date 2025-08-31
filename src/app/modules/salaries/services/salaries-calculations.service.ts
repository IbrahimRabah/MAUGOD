import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalculateSalaryRequest, SalaryResponse } from '../../../core/models/CalculateSalaryRequest';
import { ApiResponse } from '../../../core/models/apiResponse';



@Injectable({
  providedIn: 'root',
})
export class SalariesCalculationsService {
  private apiUrl = `${environment.apiUrl}/api/SalariesCalculation`;

  constructor(private http: HttpClient) {}

  // Generic method to get paginated salaries calculations
  getSalariesCalculations(lang: string, pageNumber: number, pageSize: number, colunmSearchName: string | null, colunmSearchValue: string | null): Observable<SalaryResponse> {
    const headers = {
      'accept': 'text/plain',
      'lang': lang
    };

    let params = new HttpParams()
                  .set('pageSize', pageSize.toString())
                  .set('pageIndex', pageNumber.toString());

    if(colunmSearchName && colunmSearchValue){
        params = params.set(colunmSearchName, colunmSearchValue);
      }
    
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
  deleteSalaryCalculation(id: number, lang: number): Observable<ApiResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${id}`, { headers });
  }
  deleteSelectedSalaryCalculations(ids: number[], lang: number): Observable<ApiResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.post<ApiResponse>(`${this.apiUrl}/delete-selected`, ids, { headers });
  }
}
