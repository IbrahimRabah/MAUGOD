import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PaginationRequest } from '../../../core/models/pagination';
import { Observable } from 'rxjs';
import { AssignUserRolesRequest, UserRoleAssignment, UserRoleAssignmentsResponse } from '../../../core/models/roleAssignment';

@Injectable({
  providedIn: 'root'
})
export class RoleAssignmentService {
private apiUrl = `${environment.apiUrl}/SystemPermissions`  ;
   
  constructor(private http:HttpClient) { }
  getAllUserRoleAssignments(pagination:PaginationRequest,
                  colunmSearchName: string | null,
                  colunmSearchValue: string | null): Observable<UserRoleAssignmentsResponse> {
    let params = new HttpParams();
    console.log("before adding columns" + colunmSearchName+ " " + colunmSearchValue)

    if(colunmSearchName && colunmSearchValue){
      console.log("adding columns" + colunmSearchName+ " " + colunmSearchValue)
      params = params.set(colunmSearchName, colunmSearchValue);
    }

    const headers  =  new HttpHeaders({
      'lang': pagination.lang,
      'pageNumber': pagination.pageNumber,
      'pageSize': pagination.pageSize,
      'empId': pagination.empId ? pagination.empId: 0
    });

    return this.http.get<UserRoleAssignmentsResponse>(`${this.apiUrl}/GetUserRoleAssignment`, { headers, params });
  }

  getUserRoleAssignmentById(id: number,lang:number): Observable<UserRoleAssignmentsResponse> {
    const headers = new HttpHeaders({
      'lang': lang.toString(),
      'id': id.toString()
    });

    return this.http.get<UserRoleAssignmentsResponse>(`${this.apiUrl}/GetUserRoleAssignmentById`, { headers });
  }
  addUserRoleAssignment(userRoleAssignment: UserRoleAssignment, lang:number): Observable<UserRoleAssignmentsResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });

    return this.http.post<UserRoleAssignmentsResponse>(`${environment.apiUrl}/UserRoleAssignmentInputForm/AssignUserRoles`, userRoleAssignment, { headers });
  }
  updateUserRoleAssignment(userRoleAssignment: UserRoleAssignment, lang:number): Observable<UserRoleAssignmentsResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });

    return this.http.put<UserRoleAssignmentsResponse>(`${this.apiUrl}/UpdateUserRoleAssignment`, userRoleAssignment, { headers });
  }
  deleteUserRoleAssignment(lang:number,id: number): Observable<UserRoleAssignmentsResponse> {
    const headers = new HttpHeaders({
      'lang': lang,
      'id': id
    });

    return this.http.delete<UserRoleAssignmentsResponse>(`${this.apiUrl}/DeleteRoleByID`, { headers });
  }

  assignUserRoles( lang: number, payload: AssignUserRolesRequest): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
    // Endpoint base here is NOT /SystemPermissions; it’s the input form controller
    const url = `${environment.apiUrl}/UserRoleAssignmentInputForm/AssignUserRoles`;
    return this.http.post<string>(url, payload, {headers});
  }  
}
