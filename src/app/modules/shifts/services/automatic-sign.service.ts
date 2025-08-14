import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutoSign, AutoSignDeleteResponse, AutoSignRequest, AutoSignsResponse } from '../../../core/models/AutoSign';
import { ShiftsResponse } from '../../../core/models/shifts';

@Injectable({
  providedIn: 'root'
})
export class AutomaticSignService {
 private apiUrl = `${environment.apiUrl}`;
  
    constructor(private http: HttpClient) {}

    // Generic method to get paginated shifts
    GetAutomaticSign(lang: number, pageNumber: number, pageSize: number): Observable<AutoSignsResponse> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString(),
        'pageSize': pageSize.toString(),
        'pageIndex': pageNumber.toString()
      };

      return this.http.get<AutoSignsResponse>(`${this.apiUrl}/AutomaticSign/GetAutomaticSign`, { headers });
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