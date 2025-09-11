import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MobileSignLocationAssignCreateRequest, MobileSignLocationsAssignResponse } from '../../../core/models/mobileSignLocationAssign';
import { Observable } from 'rxjs';
import { PaginationRequest } from '../../../core/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class MobileSignLocationAssignService {
  private apiUrl = `${environment.apiUrl}/MobileAndApp`;
  constructor(private http: HttpClient) { }


  getEmpsDropdownList(lang: number, empId: number ): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString(),
      'empId': empId.toString()
    });

    console.log('Calling employees API:', `${this.apiUrl}/GetEmployeesDropdownListForMobileSignLocationsAssign`);
    return this.http.get<any>(
      `${this.apiUrl}/GetEmployeesDropdownListForMobileSignLocationsAssign`,
      { headers }
    );
  }

  getDepartmentsOrMgrOfDeptsDropdownList(lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling departments API:', `${this.apiUrl}/GetDepartmentsDropdownListForMobileSignLocationsAssign`);
    return this.http.get<any>(
      `${this.apiUrl}/GetDepartmentsDropdownListForMobileSignLocationsAssign`,
      { headers }
    );
  }

  getBranchesOrMgrOfBranchsDropdownList(lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling branches API:', `${this.apiUrl}/GetBranchesDropdownListForMobileSignLocationsAssign`);
    return this.http.get<any>(
      `${this.apiUrl}/GetBranchesDropdownListForMobileSignLocationsAssign`,
      { headers }
    );
  }

  getRolesDropdownList(lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString()
    });

    console.log('Calling employee roles API:', `${this.apiUrl}/GetRolesDropdownListForMobileSignLocationsAssign`);
    return this.http.get<any>(
      `${this.apiUrl}/GetRolesDropdownListForMobileSignLocationsAssign`,
      { headers }
    );
  }

   getLocationsDropdownList(lang: number): Observable<any> {
      const headers = new HttpHeaders({
        'lang': lang.toString()
      });
  
      console.log('Calling locations API:', `${this.apiUrl}/GetLocationsDropdownListForMobileSignLocationsAssign`);
      return this.http.get<any>(
        `${this.apiUrl}/GetLocationsDropdownListForMobileSignLocationsAssign`,
        { headers }
      );
    }

  getMobileSignLocationAssign(
  paginationRequest: PaginationRequest,
  empId: number,
): Observable<MobileSignLocationsAssignResponse> {

  const headers = new HttpHeaders()
    .set('accept', 'text/plain')
    .set('lang', paginationRequest.lang.toString())
    .set('empId', empId.toString());

  const body = {
    pageNumber: paginationRequest.pageNumber,
    pageSize: paginationRequest.pageSize,
    searchColumn: paginationRequest.searchColumn,
    searchText: paginationRequest.searchText
  };

  return this.http.post<MobileSignLocationsAssignResponse>(
    `${this.apiUrl}/GetMobileSignLocationsAssign`,
    body,
    { headers }
  );
}

  getMobileSignLocationAssignById(lang: number, empId: number, recId: number): Observable<MobileSignLocationsAssignResponse> {
    const headers: any = {
      'accept': 'text/plain',
      'lang': lang.toString(),
      'empId': empId.toString(),
      'recId': recId.toString()
    };

    return this.http.get<MobileSignLocationsAssignResponse >(`${this.apiUrl}/GetMobileSignLocationAssignById`, { headers });
  }
  createMobileSignLocationAssign(lang: number, mobileSignLocationAssignCreateDto: MobileSignLocationAssignCreateRequest): Observable<any> {
    const headers: any = {
      'accept': 'text/plain',
      'lang': lang.toString()
    };

    return this.http.post(`${this.apiUrl}/CreateMobileSignLocationAssign`, mobileSignLocationAssignCreateDto, { headers });
  }
  updateMobileSignLocationAssign(lang: number, mobileSignLocationAssignCreateDto: MobileSignLocationAssignCreateRequest): Observable<any> {
    const headers: any = {
      'accept': 'text/plain',
      'lang': lang.toString()
    };

    return this.http.post(`${this.apiUrl}/UpdateMobileSignLocationAssign`, mobileSignLocationAssignCreateDto, { headers });
  }
  deleteMobileSignLocationAssign(lang: number, recId: number): Observable<any> {
    const headers: any = {
      'accept': 'text/plain',
      'lang': lang.toString(),
      'recId': recId.toString()
    };

    return this.http.delete(`${this.apiUrl}/DeleteMobileSignLocationAssign`, { headers });
  }
  deleteSelectedMobileSignLocationAssign(lang: number, recIds: number[]): Observable<any> {
    const headers: any = {
      'accept': 'text/plain',
      'lang': lang.toString()
    };
    const body = { "recIds": recIds };

    return this.http.delete(`${this.apiUrl}/DeleteSelectedMobileSignLocationsAssign`, { headers, body });
  }
}
