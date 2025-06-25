import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaginationRequest } from '../../../core/models/pagination';
import { Observable } from 'rxjs';
import { Employee, EmployeeResponse } from '../../../core/models/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
private apiUrl = `${environment.apiUrl}/Employees`;  ;
   
  constructor(private http:HttpClient) { }
  getEmployees(pagination:PaginationRequest): Observable<EmployeeResponse> {
    const headers  =  new HttpHeaders({
      'lang': pagination.lang,
      'pageNumber': pagination.pageNumber,
      'pageSize': pagination.pageSize,
      'empId': pagination.empId ?? ''
      
    });

    return this.http.get<EmployeeResponse>(`${this.apiUrl}/GetEmployees`, { headers });
  }
  getEmployeeById(id: number, lang: number): Observable<Employee> {
    const params = { lang: lang.toString() };
    return this.http.get<Employee>(`${this.apiUrl}/GetEmployeeById/${id}`, { params });
  }
  addEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/AddEmployee`, employee);
  }
  updateEmployee(employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/UpdateEmployee`, employee);
  }
  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteEmployee/${id}`);
  }
}
