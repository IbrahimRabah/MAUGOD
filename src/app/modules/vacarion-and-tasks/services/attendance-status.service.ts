import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AttendanceStatusCreate, AttendanceStatusResponse, AttendanceStatusUpdate } from '../../../core/models/attendanceStatus';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceStatusService {
  private apiUrl = `${environment.apiUrl}/AttendanceStatus`;
  constructor(private http: HttpClient) { }

   getAttendanceStatus(lang:number,pageSize: number, pageIndex: number): Observable<AttendanceStatusResponse> {
    const url = `${this.apiUrl}/Index?pageSize=${pageSize}&pageIndex=${pageIndex}`;
    const headers = new HttpHeaders()
      .set('accept', 'text/plain')
      .set('lang', lang.toString());

    return this.http.get<AttendanceStatusResponse>(url, { headers });
  }
    createAttendanceStatus(lang: number, data: AttendanceStatusCreate): Observable<any> {
          const url = `${this.apiUrl}/Create`;
    const headers = new HttpHeaders()
      .set('accept', 'text/plain')
      .set('lang', lang.toString())
      .set('Content-Type', 'application/json');

    return this.http.post<any>(url, data, { headers });
  }
   updateAttendanceStatus(lang: number, data: AttendanceStatusUpdate): Observable<any> {
    const url = `${this.apiUrl}/Update`;
    const headers = new HttpHeaders()
      .set('accept', 'text/plain')
      .set('lang', lang.toString())
      .set('Content-Type', 'application/json');

    return this.http.put<any>(url, data, { headers });
  }
  deleteAttendanceStatus(lang: number, id: string): Observable<any> {
    const url = `${this.apiUrl}/Delete/${id}`;
    const headers = new HttpHeaders()
      .set('accept', 'text/plain')
      .set('lang', lang.toString())
      .set('Content-Type', 'application/json');

    return this.http.delete<any>(url, { headers });
  }
}