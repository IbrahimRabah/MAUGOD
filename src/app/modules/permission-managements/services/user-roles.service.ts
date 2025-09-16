import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { createUserRoleRequest, RoleResponse, UpdateUserRoleRequest } from '../../../core/models/userRoels';

@Injectable({
  providedIn: 'root'
})
export class UserRolesService {
  private apiUrl = `${environment.apiUrl}/UserRoles`;
  constructor(private http: HttpClient) { }
  getAllUserRoles(lang:number,pageSize:number,pageIndex:number):Observable<RoleResponse>{
   const params = {
      pageSize: pageSize.toString(),
      pageIndex: pageIndex.toString() 
  }
    const headers = new HttpHeaders({
      'Accept': 'text/plain',
      'lang': lang.toString()
    });
    const url = `${this.apiUrl}/Index`; // Base URL
    return this.http.get<RoleResponse>(url, { headers, params });
  }
  createUserRole(payload: createUserRoleRequest, lang: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'lang': lang.toString() });
    return this.http.post<any>(`${this.apiUrl}/Create`, payload, { headers });
  }
  updateUserRole(payload: UpdateUserRoleRequest, lang: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'lang': lang.toString() });
    return this.http.put<any>(`${this.apiUrl}/Update`, payload, { headers });
  }
  deleteUserRole(roleId: number, lang: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'lang': lang.toString() });
    return this.http.delete<any>(`${this.apiUrl}/Delete/${roleId}`, { headers });
  }
}
