import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AutoSign, AutoSignRequest, AutoSignsResponse } from '../../../core/models/AutoSign';
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

      return this.http.get<AutoSignsResponse>(`${this.apiUrl}/Shifts/GetAutomaticSign`, { headers });
    }

    insertAutomaticSign(automaticSign: AutoSignRequest, lang: number): Observable<any> {
      const headers = {
        'accept': 'application/json',
        'lang': lang.toString(),
        'Content-Type': 'application/json'
      };

      return this.http.post(`${this.apiUrl}/Attendance/InsertAutomaticSign`, automaticSign, { headers });
    }
  }