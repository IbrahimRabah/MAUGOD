import { Injectable } from '@angular/core';
import { Department, DepartmentResponse } from '../../../core/models/department';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaginationRequest } from '../../../core/models/pagination';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
private apiUrl = `${environment.apiUrl}/Departments`  ;
   
  constructor(private http:HttpClient) { }
  getDepartments(pagination:PaginationRequest): Observable<DepartmentResponse> {
     const headers  =  new HttpHeaders({
      'lang': pagination.lang,
      'pageNumber': pagination.pageNumber,
      'pageSize': pagination.pageSize
    });

    return this.http.get<DepartmentResponse>(`${this.apiUrl}/GetDepartments`, { headers });
  }
  getDepartmentById(id: number, lang: number): Observable<Department> {
    const params = { lang: lang.toString() };
    return this.http.get<Department>(`${this.apiUrl}/GetDepartmentById/${id}`, { params });
  }
  addDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(`${this.apiUrl}/AddDepartment`, department);
  }
  updateDepartment(department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/UpdateDepartment`, department);
  }
  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteDepartment/${id}`);
  }
}
