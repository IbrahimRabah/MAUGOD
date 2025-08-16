import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaginationAttendanceRequest, PaginationPunchTransactionsRequest} from '../../../core/models/pagination';
import { AttendanceResponse, PunchTransactionsResponse } from '../../../core/models/attendance';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/Attendance`;
  ;
  
  constructor(private http:HttpClient) { }

 getAttendances(lang: number, request: PaginationAttendanceRequest): Observable<AttendanceResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });

    return this.http.post<AttendanceResponse>(
      `${this.apiUrl}/GetAttendances`,
      request,
      { headers }
    );
  }
  deleteAttendSelected(Ids: number[], lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
  
    return this.http.delete<any>(
      `${this.apiUrl}/AttendanceDeleteSelected`,
      {
      headers,
      body: { Ids } // pass Ids inside body property
    });
  }

  deletePunchInTransactionsSelected(Ids: number[], lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
  
    return this.http.delete<any>(
      `${this.apiUrl}/PunchInTransactionsDeleteSelected`,
      {
      headers,
      body: { Ids } // pass Ids inside body property
    });
  }

  getPunchInTransactions(lang: number, request: PaginationPunchTransactionsRequest): Observable<PunchTransactionsResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
    
    return this.http.post<PunchTransactionsResponse>(
      `${this.apiUrl}/GetTenters`,
      request,
      { headers }
    );
  }
}
