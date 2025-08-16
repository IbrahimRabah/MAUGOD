import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MobileSignLocationAssignCreateRequest, MobileSignLocationsAssignResponse } from '../../../core/models/mobileSignLocationAssign';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileSignLocationAssignService {
  private apiUrl = `${environment.apiUrl}/MobileAndApp`;
  constructor(private http: HttpClient) { }

  getMobileSignLocationAssign(lang: number, empId: number, pageNumber: number, pageSize: number):Observable<MobileSignLocationsAssignResponse > {
    const headers: any = {
      'accept': 'text/plain',
      'lang': lang.toString(),
      'pageSize': pageSize.toString(),
      'pageIndex': pageNumber.toString(),
      'empId': empId.toString()
    };
    
    return this.http.get<MobileSignLocationsAssignResponse >(`${this.apiUrl}/GetMobileSignLocationsAssign`, { headers });
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
