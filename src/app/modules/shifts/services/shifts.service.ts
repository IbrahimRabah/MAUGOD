import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CreatShift, ShiftsResponse } from '../../../core/models/shifts';
import { Observable } from 'rxjs';
import { SalaryResponse } from '../../../core/models/CalculateSalaryRequest';

@Injectable({
  providedIn: 'root'
})
export class ShiftsService {
    private apiUrl = `${environment.apiUrl}/Shifts`;
  
    constructor(private http: HttpClient) {}

    // Generic method to get paginated shifts
    GetShiftsToShow(lang: number, pageNumber: number, pageSize: number): Observable<ShiftsResponse> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString(),
        'pageSize': pageSize.toString(),
        'pageIndex': pageNumber.toString()
      };

      return this.http.get<ShiftsResponse>(`${this.apiUrl}/GetShifts`, { headers });
    }

 deleteShift(lang: number, shiftID: number): Observable<any> {
  const headers = {
    'accept': '*/*',
    'lang': lang.toString(),
    'Content-Type': 'application/json'
  };

  const body = { "shiftID": shiftID, "lang": lang };

  return this.http.delete(`${this.apiUrl}/DeleteShift`, { headers, body });
}
  createShift(lang: number, shift: CreatShift): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'text/plain',
      'lang': lang.toString()
    });
    const url = `${this.apiUrl}/CreateShift`;
    return this.http.post(url, shift, { headers });
  }
  updateShift(lang: number, shift: CreatShift): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'text/plain',
      'lang': lang.toString()
    });
    const url = `${this.apiUrl}/UpdateShift`;
    return this.http.put(url, shift, { headers });
  }
}
