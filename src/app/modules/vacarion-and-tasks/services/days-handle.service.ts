import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DaysHandleResponse, ProcessBranchesRequest, ProcessDepartmentsRequest, ProcessEmployeesRequest, ProcessRolesRequest, UpdateDayHandleRequest } from '../../../core/models/daysHandle';

@Injectable({
  providedIn: 'root'
})

export class DaysHandleService {

  private apiUrl = `${environment.apiUrl}/DaysHandle`;

  constructor(private http: HttpClient) { }
  
  getDaysHandle(lang: number,
                empId: number,
                pageSize: number,
                pageIndex: number,
                colunmSearchName : string | null,
                colunmSearchValue : string|null,
                startDate : string | null,
                endDate : string | null): Observable<DaysHandleResponse> {

    let params = new HttpParams()
                  .set('currentEmpId', empId.toString())
                  .set('pageSize', pageSize.toString())
                  .set('pageIndex', pageIndex.toString());
      
      if(colunmSearchName && colunmSearchValue){
        params = params.set(colunmSearchName, colunmSearchValue);
      }

      if(startDate && endDate){
        params = params.set('startDate', startDate.toString());
        params = params.set('endDate', endDate.toString());
      }

    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.get<DaysHandleResponse>(`${this.apiUrl}/Index`, { headers, params });
  }

  deleteDaysHandle(lang: number, id: number): Observable<any> {
    const url = `${this.apiUrl}/Delete/${id}`;
    const headers = new HttpHeaders()
      .set('accept', 'text/plain')
      .set('lang', lang.toString())
      .set('Content-Type', 'application/json');

    return this.http.delete<any>(url, { headers });
  }

  deleteDaysHandleSelected(lang: number, recIds: number[],): Observable<any> {
    const url = `${this.apiUrl}/DeleteMultiple`;
    const headers = new HttpHeaders()
      .set('accept', 'text/plain')
      .set('lang', lang.toString())
      .set('Content-Type', 'application/json');
  
    const body = { recIds }; // wrap the array in an object

      return this.http.post<any>(url, body, { headers });
  }


  createEmployeeAssignment(lang: number, body: ProcessEmployeesRequest): Observable<any> {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<any>(`${this.apiUrl}/ProcessEmployees`, body, { headers });
  }

  createDepartmentAssignment(lang: number, body: ProcessDepartmentsRequest) {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<any>(`${this.apiUrl}/ProcessDepartments`, body, { headers });
  }

  createBranchAssignment(lang: number, body: ProcessBranchesRequest) {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<any>(`${this.apiUrl}/ProcessBranches`, body, { headers });
  }

  createRoleAssignment(lang: number, body: ProcessRolesRequest) {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<any>(`${this.apiUrl}/ProcessRoles`, body, { headers });
  }

  updateAssignment(lang: number, body: UpdateDayHandleRequest) {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.put<any>(`${this.apiUrl}/Update`, body, { headers });
  }

}
