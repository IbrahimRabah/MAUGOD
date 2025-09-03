import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppEmployeesResponse } from '../../../core/models/appQR';
import { PaginationRequest } from '../../../core/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class AppQRCodeService {
  private apiUrl = `${environment.apiUrl}/MobileAndApp`;
  constructor(private http: HttpClient) { }


  getEmployeesForSendAppQRCode(
  pagination:PaginationRequest,
  empId: number,
): Observable<AppEmployeesResponse> {

  const headers = new HttpHeaders()
    .set('accept', 'text/plain')
    .set('lang', pagination.lang.toString())
    .set('empId', empId.toString());

  const body = {
    pageNumber: pagination.pageNumber,
    pageSize: pagination.pageSize,
    searchColumn: pagination.searchColumn,        
    searchText: pagination.searchText
  };

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
