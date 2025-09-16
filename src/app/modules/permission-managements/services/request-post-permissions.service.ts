import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProcessBranchesDto, ProcessDepartmentDto, ProcessEmployeeDto, ProcessEveryOneDto, ProcessManagersOfBranchesDto, ProcessManagersOfDepartmentsDto, ProcessRolesDto, RequestPostPermissionResponse } from '../../../core/models/RequestPostPermission ';

interface DeleteSelectedPayload {
  recIds: number[];
}

@Injectable({
  providedIn: 'root'
})
export class RequestPostPermissionsService {
    private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  getRequestPostPermissions(lang: number, pageSize: number, pageIndex: number, colunmSearchName : string | null, colunmSearchValue : string|null ): Observable<RequestPostPermissionResponse> {
    let params = new HttpParams()
                  .set('pageSize', pageSize.toString())
                  .set('pageIndex', pageIndex.toString());
      
      if(colunmSearchName && colunmSearchValue){
        params = params.set(colunmSearchName, colunmSearchValue);
      }

    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.get<RequestPostPermissionResponse>(`${this.apiUrl}/RequestPostPermissions`, { headers, params });
  }
  deleteStatusPermission(lang: number, id: number): Observable<void> {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.delete<void>(
      `${this.apiUrl}/RequestPostPermissions/status-permission/${id}`,
      { headers }
    );
  }
  deleteSelectedPermissions(recIds: number[], lang: number): Observable<any> {
    const payload: DeleteSelectedPayload = { recIds };
    const headers = new HttpHeaders().set('lang', lang.toString());
    return this.http.request<any>(
      'DELETE',
      `${this.apiUrl}/RequestPostPermissions/selected-permissions`,
      { body: payload, headers }
    );
  }
  processEmployee(payload: ProcessEmployeeDto, lang: number): Observable<ProcessEmployeeDto> {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<ProcessEmployeeDto>(
      `${this.apiUrl}/RequestPostPermissions/process-employee`,
      payload,
      { headers }
    );
  }
  processManagersOfDepartments(payload: ProcessManagersOfDepartmentsDto, lang: number): Observable<ProcessManagersOfDepartmentsDto> {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<ProcessManagersOfDepartmentsDto>(
      `${this.apiUrl}/RequestPostPermissions/process-dept-mgr`,
      payload,
      { headers }
    );
  }
  processDepartment(payload: ProcessDepartmentDto, lang: number): Observable<ProcessDepartmentDto> {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<ProcessDepartmentDto>(
      `${this.apiUrl}/RequestPostPermissions/process-department`,
      payload,
      { headers }
    );
  }
  processManagersOfBranches(payload: ProcessManagersOfBranchesDto, lang: number): Observable<ProcessManagersOfBranchesDto> {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<ProcessManagersOfBranchesDto>(
      `${this.apiUrl}/RequestPostPermissions/process-branch-mgr`,
      payload,
      { headers }
    );
  }
  processBranches(payload: ProcessBranchesDto, lang: number): Observable<ProcessBranchesDto> {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<ProcessBranchesDto>(
      `${this.apiUrl}/RequestPostPermissions/process-branch`,
      payload,
      { headers }
    );
  }
  processRoles(payload: ProcessRolesDto, lang: number): Observable<ProcessRolesDto> {
    const headers = new HttpHeaders().set('lang', lang.toString());

    return this.http.post<ProcessRolesDto>(
      `${this.apiUrl}/RequestPostPermissions/process-role`,
      payload,
      { headers }
    );
  }
  processEveryOne(payload: ProcessEveryOneDto, lang: number): Observable<ProcessEveryOneDto> {
    const headers = new HttpHeaders().set('lang', lang.toString());
    return this.http.post<ProcessEveryOneDto>(
      `${this.apiUrl}/RequestPostPermissions/process-everyone`,
      payload,
      { headers }
    );
  }
}
