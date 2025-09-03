import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CreateMobileSignLocationRequest, CreateMobileSignLocationResponse, MobileSignLocationsResponse, UpdateMobileSignLocationRequest, UpdateMobileSignLocationResponse } from '../../../core/models/signLocation';
import { Observable } from 'rxjs';
import { PaginationRequest } from '../../../core/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class SignLocationsService {
  private apiUrl = `${environment.apiUrl}/MobileAndApp`;
  constructor(private http: HttpClient) { }

getMobileSignLocations(
  paginationRequest: PaginationRequest,
  lang: number,
): Observable<MobileSignLocationsResponse> {

  const headers = new HttpHeaders()
    .set('accept', '*/*')
    .set('lang', lang.toString());

  const body = {
    pageNumber: paginationRequest.pageNumber,
    pageSize: paginationRequest.pageSize,
    searchColumn: paginationRequest.searchColumn,
    searchText: paginationRequest.searchText
  };

  return this.http.post<MobileSignLocationsResponse>(
    `${this.apiUrl}/GetMobileSignLocations`,
    body,
    { headers }
  );
}


  deleteMobileSignLocation(lang: number, locId: number): Observable<any> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      locId: locId.toString()
    });

    const url = `${this.apiUrl}/DeleteMobileSignLocation`;
    return this.http.delete(url, { headers });
  }
  getMobileSignLocationById(lang: number, locId: number): Observable<any> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      locId: locId.toString()
    });

    const url = `${this.apiUrl}/GetMobileSignLocationById`;
    return this.http.get(url, { headers });
  }
  createMobileSignLocation(
  request: CreateMobileSignLocationRequest,
  lang: number
): Observable<CreateMobileSignLocationResponse> {
  const url = `${this.apiUrl}/CreateMobileSignLocation`;
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
    });

  return this.http.post<CreateMobileSignLocationResponse>(url, request, { headers });
}
updateMobileSignLocation(
  request: UpdateMobileSignLocationRequest,
  lang: number
): Observable<UpdateMobileSignLocationResponse> {
  const url = `${this.apiUrl}/UpdateMobileSignLocation`;
  const headers = new HttpHeaders({
    accept: '*/*',
    'Content-Type': 'application/json',
    lang: lang.toString()
  });

  return this.http.post<UpdateMobileSignLocationResponse>(url, request, { headers });
}

   
}
