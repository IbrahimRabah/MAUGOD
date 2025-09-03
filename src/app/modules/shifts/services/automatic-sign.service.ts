import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutoSign, AutoSignDeleteResponse, AutoSignRequest, AutoSignsResponse } from '../../../core/models/AutoSign';
import { ShiftsResponse } from '../../../core/models/shifts';
import {PaginationCommonRequest } from '../../../core/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class AutomaticSignService {
 private apiUrl = `${environment.apiUrl}`;
  
    constructor(private http: HttpClient) {}

    // Generic method to get paginated shifts
    GetAutomaticSign(lang: number, pageNumber: number, pageSize: number,selectedColumn?:string,
    searchTerm?:string): Observable<AutoSignsResponse> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString(),
      };
      const paginationRequest: PaginationCommonRequest = {
              pageNumber: pageNumber,
              pageSize: pageSize,
              searchColumn: selectedColumn,
              searchText: searchTerm
            };

      return this.http.post<AutoSignsResponse>(`${this.apiUrl}/AutomaticSign/GetAutomaticSign`,paginationRequest, { headers });
    }

    insertAutomaticSign(automaticSign: AutoSignRequest, lang: number): Observable<any> {
      const headers = {
        'accept': 'application/json',
        'lang': lang.toString(),
        'Content-Type': 'application/json'
      };

      return this.http.post(`${this.apiUrl}/Attendance/InsertAutomaticSign`, automaticSign, { headers });
    }
   deleteAutoSign(lang: number, id: number): Observable<AutoSignDeleteResponse> {
    const url = `${this.apiUrl}/AutomaticSign/Delete/${id}`;
    const headers = new HttpHeaders()
      .set('accept', 'text/plain')
      .set('lang', lang.toString());

    return this.http.delete<AutoSignDeleteResponse>(url, { headers });
  }
  updateAutoSign(lang: number, data: any): Observable<AutoSignRequest> {
    const headers = new HttpHeaders()
      .set('accept', 'text/plain')
      .set('lang', lang.toString())
      .set('Content-Type', 'application/json');

    return this.http.put<AutoSignRequest>(`${this.apiUrl}/AutomaticSign/Update`, data, { headers });
  }
  }