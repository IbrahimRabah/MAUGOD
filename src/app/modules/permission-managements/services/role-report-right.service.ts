import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaginationRequest } from '../../../core/models/pagination';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/models/apiResponse';
import { RoleReportRightResponse } from '../../../core/models/roleReportRight';
import { RoleReportRightCreate } from '../../../core/models/roleReportRightCreate';
import { RoleDropdownListForRoleReportRightResponse } from '../../../core/models/roleDropdownListForRoleReportRight';
import { ReportDropdownListForRoleReportRightResponse } from '../../../core/models/reportDropdownListForRoleReportRight';

@Injectable({
  providedIn: 'root'
})
export class RoleReportRightService {

private apiUrl = `${environment.apiUrl}/SystemPermissions`  ;
   
  constructor(private http:HttpClient) { }
  getRoleReportRights(pagination:PaginationRequest): Observable<RoleReportRightResponse> {
     const headers  =  new HttpHeaders({
      'lang': pagination.lang,
      'pageNumber': pagination.pageNumber,
      'pageSize': pagination.pageSize
    });

    return this.http.get<RoleReportRightResponse>(`${this.apiUrl}/GetUserRoleReportRights`, { headers });
  }
  getRolesDropdownListForRoleReportRight(lang: number): Observable<RoleDropdownListForRoleReportRightResponse> {
    const params = { lang: lang.toString() };
    return this.http.get<RoleDropdownListForRoleReportRightResponse>(`${this.apiUrl}/GetRolesDropdownListForRoleReportRights`, { params });
  }
  getReportsDropdownListForRoleReportRight(lang: number, roleId: number): Observable<ReportDropdownListForRoleReportRightResponse> {
    const headers  =  new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString(),
    }); 

    const body = { roleId: roleId };

    return this.http.post<ReportDropdownListForRoleReportRightResponse>(`${this.apiUrl}/GetReportsDropdownListForRoleReportRights`, {body, headers});
  }
  addRoleReportRight(roleReportRightCreate: RoleReportRightCreate, lang: number): Observable<ApiResponse> {
    const headers  =  new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString(),
    }); 

    const body = { roleId: roleReportRightCreate.roleId , repIdsString: roleReportRightCreate.repIdsString};
    return this.http.post<ApiResponse>(`${this.apiUrl}/CreateUserRoleReportRights`, {body, headers});
  }
  deleteRoleReportRight(recId: bigint, lang: number): Observable<void> {
    const headers  =  new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString(),
      'recId': recId.toString()
    });
    return this.http.delete<void>(`${this.apiUrl}/DeleteOneUserRoleReportRight`, { headers});
  }
  deleteSelectedRoleReportRights(recIds: bigint[], lang: number): Observable<any> {
  const headers  =  new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString(),
    });

  const body = { recIds: recIds.map(id => Number(id)) };

  return this.http.delete(`${this.apiUrl}/DeleteSelectedUserRoleReportRights`, {body, headers});
}
}