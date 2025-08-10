import { Injectable } from '@angular/core';
import { Department, DepartmentCreateUpdateRequest, DepartmentResponse } from '../../../core/models/department';
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
  getDepartmentById(deptId: number, lang: number): Observable<Department> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString(),
      'deptId': deptId.toString()
    });

    return this.http.get<Department>(`${this.apiUrl}/GetEditDept`, { headers });
  }
  addDepartment(department: DepartmentCreateUpdateRequest, lang: number): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'lang': lang.toString()
      });
    return this.http.post<Department>(`${this.apiUrl}/CreateDept`, department,{headers});
  }
  updateDepartment(id: number, department: DepartmentCreateUpdateRequest, lang: number): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'lang': lang.toString(),
        'deptId': id.toString() // Include branchId in the headers if required by the API
      });
      
      // Include branchId in the request body as required by the API
      const deptData = {
        deptId: id,
        ar: department.ar,
        en: department.en,
        mgrId: department.mgrId,
        locDesc: department.locDesc,
        parentDeptId: department.parentDeptId,
        locId: department.locId,
        note: department.note,
        branchId:department.branchId,
        deptLevel:department.deptLevel
      };
    return this.http.post<Department>(`${this.apiUrl}/UpdateDept`, deptData,{headers});
  }
  deleteDepartment(id: number, lang: number): Observable<void> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'lang': lang.toString(),
      });
    return this.http.delete<void>(`${this.apiUrl}/DeleteDepartmentById/${id}`,{headers});
  }

  changeDepartmentId(oldDeptId: number, newDeptId: number, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
    
    const requestBody = {
      tableName: "DEPTS",
      oldDeptId: oldDeptId,
      newDeptId: newDeptId,
      
    };

    return this.http.post<any>(`${this.apiUrl}/UpdateDeptPrimaryKey`, requestBody, { headers });
  }
}
