import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MobileSignLocationAssignCreateRequest, MobileSignLocationsAssignResponse } from '../../../core/models/mobileSignLocationAssign';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileSignLocationAssignService {
  private apiUrl = `${environment.apiUrl}/MobileAndApp`;
  constructor(private http: HttpClient) { }

  getMobileSignLocationAssign(
  lang: number,
  empId: number,
  pageNumber: number,
  pageSize: number,
  searchColumn: string | null = null,
  searchText: string | null = null
): Observable<MobileSignLocationsAssignResponse> {

  const headers = new HttpHeaders()
    .set('accept', 'text/plain')
    .set('lang', lang.toString())
    .set('empId', empId.toString());

  const body = {
    pageNumber: pageNumber,
    pageSize: pageSize,
    searchColumn: searchColumn,
    searchText: searchText
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
