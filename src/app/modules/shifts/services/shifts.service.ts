import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CreatShift, GetShiftByIdResponse, ShiftDetailsResponse, ShiftsResponse } from '../../../core/models/shifts';
import { Observable } from 'rxjs';
import { PaginationRequest } from '../../../core/models/pagination';


@Injectable({
  providedIn: 'root'
})
export class ShiftsService {
    private apiUrl = `${environment.apiUrl}/Shifts`;
  
    constructor(private http: HttpClient) {}

    // Generic method to get paginated shifts
    GetShiftsToShow(lang: number, pageNumber: number, pageSize: number,selectedColumn:string,searchTerm:string): Observable<ShiftsResponse> {
      const headers = {
        'accept': 'text/plain',
        'lang': lang.toString(),

      };
      const paginationRequest: PaginationRequest = {
          pageNumber: pageNumber,
          pageSize: pageSize,
          lang:lang,
          searchColumn: selectedColumn, 
          searchText:searchTerm,

        };
      return this.http.post<ShiftsResponse>(`${this.apiUrl}/GetShifts`, paginationRequest,{ headers });
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
  getShiftDtailsShow(lang: number, shiftId: number, withDetails: number): Observable<ShiftDetailsResponse> {
  const headers = new HttpHeaders({
    'accept': 'text/plain',
    'lang': lang.toString(),
    'shiftId':shiftId,
    'withDetails':withDetails
  });
  return this.http.get<ShiftDetailsResponse>(`${this.apiUrl}/GetShiftDetails`, { headers});
}

  getShiftByIdShow(lang: number, shiftId: number): Observable<GetShiftByIdResponse> {
  const headers = new HttpHeaders({
    'accept': 'text/plain',
    'lang': lang.toString(),
    'shiftId':shiftId,
  });
  return this.http.get<GetShiftByIdResponse>(`${this.apiUrl}/GetShiftToUpdate`, { headers});
}

}
