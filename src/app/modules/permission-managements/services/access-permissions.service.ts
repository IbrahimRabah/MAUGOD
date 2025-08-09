import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { SalariesAssignResponse } from '../../../core/models/salariesAssign';
import { Observable } from 'rxjs';
import { DataPermissionsResponse } from '../../../core/models/dataPermissions';
import { EmployeesPermissionsResponse } from '../../../core/models/EmployeePermissions';
import { DepartmentsPermissionsResponse } from '../../../core/models/DepartmentsPermissions';
import { BranchesPermissionsResponse } from '../../../core/models/BranchesPermissions';
import { BranchManagerPermissionRequest, BranchPermissionRequest, DataPermissionRequestToEmployee, DepartmentManagerPermissionRequest, DepartmentPermissionRequest, RolePermissionRequest, SaveEmployeeManagerPermissionsRequest, SaveDepartmentManagerPermissionsRequest, SaveBranchManagerPermissionsRequest } from '../../../core/models/DataPermissionRequests';

@Injectable({
  providedIn: 'root'
})
export class AccessPermissionsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPermissions(lang:number , pageIndex: number, pageSize: number): Observable<DataPermissionsResponse> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.get<DataPermissionsResponse>(`${this.apiUrl}/DataPermissions/GetAccessPermission?pageIndex=${pageIndex}&pageSize=${pageSize}`, { headers });
    }
    getDirectManagersPermissions(lang:number , pageIndex: number, pageSize: number): Observable<EmployeesPermissionsResponse> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.get<EmployeesPermissionsResponse>(`${this.apiUrl}/DataPermissions/GetDirectManagerPermissions?pageIndex=${pageIndex}&pageSize=${pageSize}`, { headers });
    }
    getDepartmentsManagerPermissions(lang:number , pageIndex: number, pageSize: number): Observable<DepartmentsPermissionsResponse> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.get<DepartmentsPermissionsResponse>(`${this.apiUrl}/DataPermissions/GetDepartmentManagerPermissions?pageIndex=${pageIndex}&pageSize=${pageSize}`, { headers });
    }
    getBranchesManagerPermissions(lang:number , pageIndex: number, pageSize: number): Observable<BranchesPermissionsResponse> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.get<BranchesPermissionsResponse>(`${this.apiUrl}/DataPermissions/GetBranchManagerPermissions?pageIndex=${pageIndex}&pageSize=${pageSize}`, { headers });
    }
    deleteAccessPermission(permissionId : number, lang: number): Observable<any> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.delete(`${this.apiUrl}/AccessPermissions/DeleteAccessPermission/${permissionId}`, { headers });
    }
    deleteSelectedAccessPermissions(permissionIds: number[], lang: number): Observable<any> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      const selectedPermissions = { "permissionIds": permissionIds };
      return this.http.delete(`${this.apiUrl}/AccessPermissions/DeleteMultipleAccessPermissions`, { headers, body: selectedPermissions });
    }
    processPermissionsToEmployees(permissions: DataPermissionRequestToEmployee[], lang: number): Observable<any> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.post(`${this.apiUrl}/AccessPermissionsInputForm/ProcessPermissionsToEmployee`, permissions, { headers });
    }
    processPermissionsToDepartmentManagers(permissions: DepartmentManagerPermissionRequest[], lang: number): Observable<any> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.post(`${this.apiUrl}/AccessPermissionsInputForm/ProcessPermissionsToDeptMgr`, permissions, { headers });
    }
    processPermissionsToDepartments(permissions: DepartmentPermissionRequest[], lang: number): Observable<any> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.post(`${this.apiUrl}/AccessPermissionsInputForm/ProcessPermissionsToDepartment`, permissions, { headers });
    }
    processPermissionsToBranchManagers(permissions: BranchManagerPermissionRequest[], lang: number): Observable<any> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.post(`${this.apiUrl}/AccessPermissionsInputForm/ProcessPermissionsToBranchMgr`, permissions, { headers });
    }
    processPermissionsToBranches(permissions: BranchPermissionRequest[], lang: number): Observable<any> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.post(`${this.apiUrl}/AccessPermissionsInputForm/ProcessPermissionsToBranch`, permissions, { headers });
    }
    processPermissionsToRoles(permissions: RolePermissionRequest[], lang: number): Observable<any> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString()
      };
      return this.http.post(`${this.apiUrl}/AccessPermissionsInputForm/ProcessPermissionsToRole`, permissions, { headers });
    }
    
    saveEmployeeManagerPermissions(permissions: SaveEmployeeManagerPermissionsRequest, lang: number): Observable<any> {
      const headers = {
        'accept': '*/*',
        'lang': lang.toString(),
        'Content-Type': 'application/json'
      };
      return this.http.post(`${this.apiUrl}/AccessPermissions/SaveEmployeeManagerPermissions`, permissions, { headers });
    }
    
    saveDepartmentManagerPermissions(permissions: SaveDepartmentManagerPermissionsRequest, lang: number): Observable<any> {
      const headers = {
        'accept': '*/*',
        'lang': lang.toString(),
        'Content-Type': 'application/json'
      };
      return this.http.post(`${this.apiUrl}/AccessPermissions/SaveDepartmentManagerPermissions`, permissions, { headers });
    }
    
    saveBranchManagerPermissions(permissions: SaveBranchManagerPermissionsRequest, lang: number): Observable<any> {
      const headers = {
        'accept': '*/*',
        'lang': lang.toString(),
        'Content-Type': 'application/json'
      };
      return this.http.post(`${this.apiUrl}/AccessPermissions/SaveBranchManagerPermissions`, permissions, { headers });
    }
  }