import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ShiftsResponse } from '../../../core/models/shifts';
import { Observable } from 'rxjs';
import { SalaryResponse } from '../../../core/models/CalculateSalaryRequest';

@Injectable({
  providedIn: 'root'
})
export class ShiftsService {
    private apiUrl = `${environment.apiUrl}/Attendance`;
  
    constructor(private http: HttpClient) {}

    // Generic method to get paginated shifts
    GetShiftsToShow(lang: number, pageNumber: number, pageSize: number): Observable<ShiftsResponse> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString(),
        'pageSize': pageSize.toString(),
        'pageIndex': pageNumber.toString()
      };

      return this.http.get<ShiftsResponse>(`${this.apiUrl}/GetShiftsToShow`, { headers });
    }

 deleteShift(lang: string, shiftID: number): Observable<any> {
  const headers = {
    'accept': '*/*',
    'lang': lang,
    'Content-Type': 'application/json'
  };

  const body = { "shiftID": shiftID, "lang": lang };

  return this.http.delete(`${this.apiUrl}/DeleteShift`, { headers, body });
}
}
