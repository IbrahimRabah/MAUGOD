import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppEmployeesResponse } from '../../../core/models/appQR';

@Injectable({
  providedIn: 'root'
})
export class AppQRCodeService {
  private apiUrl = `${environment.apiUrl}/MobileAndApp`;
  constructor(private http: HttpClient) { }


  getEmployeesForSendAppQRCode(
  lang: number,
  empId: number,
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Observable<AppEmployeesResponse> {

  const headers = new HttpHeaders()
    .set('accept', 'text/plain')
    .set('lang', lang.toString())
    .set('empId', empId.toString());

  const body = {
    pageNumber: pageNumber,
    pageSize: pageSize,
    searchColumn: null,        
    searchText: null
  };

  // Add search term if provided
  /*  if (searchTerm && searchTerm.trim()) {
      headers['searchTerm'] = searchTerm.trim();
    }*/

  return this.http.post<AppEmployeesResponse>(
    `${this.apiUrl}/GetEmployeesForSendAppQRCode`,
    body,
    { headers }
  );
}

  sendAppQRCodeForEmployees(empIds: number[], lang: number): Observable<any> {
    const headers = {
      'accept': 'text/plain',
      'lang': lang.toString()
    };
    const body = { empIds: empIds };
    return this.http.post(`${this.apiUrl}/SendAppQRCodeForEmployees`, body, { headers });
  }
}
