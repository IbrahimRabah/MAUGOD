import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ManagerResponse } from '../../core/models/managers';
import { DirectManagerResponse } from '../../core/models/directManagers';
import { LocationResponse } from '../../core/models/location';
import { ParentBranchResponse } from '../../core/models/parentBranches';

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
}
