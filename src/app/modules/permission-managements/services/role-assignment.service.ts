import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaginationRequest } from '../../../core/models/pagination';
import { Observable } from 'rxjs';
import { UserRoleAssignment, UserRoleAssignmentsResponse } from '../../../core/models/roleAssignment';

@Injectable({
  providedIn: 'root'
})
export class RoleAssignmentService {
private apiUrl = `${environment.apiUrl}/SystemPermissions`  ;
   
  constructor(private http:HttpClient) { }
  getAllUserRoleAssignments(pagination:PaginationRequest): Observable<UserRoleAssignmentsResponse> {
    const headers  =  new HttpHeaders({
      'lang': pagination.lang,
      'pageNumber': pagination.pageNumber,
      'pageSize': pagination.pageSize,
      'empId': pagination.empId ? pagination.empId: ''
    });

    return this.http.get<UserRoleAssignmentsResponse>(`${this.apiUrl}/GetUserRoleAssignment`, { headers });
  }
  getUserRoleAssignmentById(id: number): Observable<UserRoleAssignmentsResponse> {
    const headers = new HttpHeaders({
      'lang': 'en',
      'id': id.toString()
    });

    return this.http.get<UserRoleAssignmentsResponse>(`${this.apiUrl}/GetUserRoleAssignmentById`, { headers });
  }
  addUserRoleAssignment(userRoleAssignment: UserRoleAssignment): Observable<UserRoleAssignment> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': 'en'
    });

    return this.http.post<UserRoleAssignment>(`${this.apiUrl}/AddUserRoleAssignment`, userRoleAssignment, { headers });
  }
  updateUserRoleAssignment(userRoleAssignment: UserRoleAssignment): Observable<UserRoleAssignment> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': 'en'
    });

    return this.http.put<UserRoleAssignment>(`${this.apiUrl}/UpdateUserRoleAssignment`, userRoleAssignment, { headers });
  }
  deleteUserRoleAssignment(id: number): Observable<UserRoleAssignmentsResponse> {
    const headers = new HttpHeaders({
      'lang': 'en',
      'id': id.toString()
    });

    return this.http.delete<UserRoleAssignmentsResponse>(`${this.apiUrl}/DeleteUserRoleAssignment`, { headers });
  }

  
}
