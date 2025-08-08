import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ManagerResponse } from '../../core/models/managers';
import { DirectManagerResponse } from '../../core/models/directManagers';
import { LocationResponse } from '../../core/models/location';
import { ParentBranchResponse } from '../../core/models/parentBranches';
import { BankResponse } from '../../core/models/bank';

@Injectable({
  providedIn: 'root'
})
export class DropdownlistsService {

  constructor(private http: HttpClient) { }
  private apiUrl = environment.apiUrl;


  /**
   * Get Managers Dropdown List
   * @param lang - Language number for header
   * @returns Observable<ManagerResponse>
   */
  getManagersDropdownList(lang: number): Observable<ManagerResponse> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling managers API:', `${this.apiUrl}/Departments/GetManagersDropdownList`);
    return this.http.get<ManagerResponse>(
      `${this.apiUrl}/Departments/GetManagersDropdownList`,
      { headers }
    );
  }

  /**
   * Get Direct Managers Dropdown List
   * @param lang - Language number for header
   * @returns Observable<DirectManagerResponse>
   */
  getDirectManagersDropdownList(lang: number): Observable<DirectManagerResponse> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    return this.http.get<DirectManagerResponse>(
      `${this.apiUrl}/Employees/GetDirectManagersDropdownList`,
      { headers }
    );
  }

  /**
   * Get Locations Dropdown List
   * @param lang - Language number for header
   * @returns Observable<LocationResponse>
   */
  getLocationsDropdownList(lang: number): Observable<LocationResponse> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling locations API:', `${this.apiUrl}/Branches/GetLocationsDropdownList`);
    return this.http.get<LocationResponse>(
      `${this.apiUrl}/Branches/GetLocationsDropdownList`,
      { headers }
    );
  }

  /**
   * Get Parent Branches Dropdown List
   * @param lang - Language number for header
   * @returns Observable<ParentBranchResponse>
   */
  getParentBranchesDropdownList(lang: number): Observable<ParentBranchResponse> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling parent branches API:', `${this.apiUrl}/Branches/GetParentBranchesDropdownList`);
    return this.http.get<ParentBranchResponse>(
      `${this.apiUrl}/Branches/GetParentBranchesDropdownList`,
      { headers }
    );
  }
  getEmpsDropdownList(lang: number, empId: number ): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString(),
      'empId': empId.toString()
    });

    console.log('Calling employees API:', `${this.apiUrl}/Employees/GetEmpsDropdownList`);
    return this.http.get<any>(
      `${this.apiUrl}/Employees/GetEmpsDropdownList`,
      { headers }
    );
  }
  getDepartmentsDropdownList(lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling departments API:', `${this.apiUrl}/Employees/GetDepartmentsDropdownList`);
    return this.http.get<any>(
      `${this.apiUrl}/Employees/GetDepartmentsDropdownList`,
      { headers }
    );
  }
  getBranchesDropdownList(lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling branches API:', `${this.apiUrl}/Branches/GetParentBranchesDropdownList`);
    return this.http.get<any>(
      `${this.apiUrl}/Branches/GetParentBranchesDropdownList`,
      { headers }
    );
  }
  getEmployeeStatusesDropdownList(lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling employee statuses API:', `${this.apiUrl}/Employees/GetStatusesDropdownList`);
    return this.http.get<any>(
      `${this.apiUrl}/Employees/GetStatusesDropdownList`,
      { headers }
    );
  }
  getEmployeeRolesDropdownList(lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling employee roles API:', `${this.apiUrl}/SystemPermissions/GetSourceRolesDropdownListForRoleModuleRights`);
    return this.http.get<any>(
      `${this.apiUrl}/SystemPermissions/GetSourceRolesDropdownListForRoleModuleRights`,
      { headers }
    );
  }
  getBanksDropdownList(lang: number): Observable<BankResponse> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling banks API:', `${this.apiUrl}/Banks/GetBanksDropdownList`);
    return this.http.get<BankResponse>(
      `${this.apiUrl}/api/Salary/GetBanksDropdownList`,
      { headers }
    );
  }

}