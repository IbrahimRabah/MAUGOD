import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse, DeleteTranLocksRequest, GetTimtranLockResponse, InsertTimtranLockInputFormRequest } from '../../../core/models/TimtranLock';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimtranService {
  private apiUrl = `${environment.apiUrl}/Attendance`;
  constructor(private http: HttpClient) { }
  getTimtranLock(pageNumber: number, pageSize: number, lang: number): Observable<GetTimtranLockResponse> {
    const headers = new HttpHeaders()
      .set('accept', '*/*')
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString())
      .set('lang', lang.toString());

    return this.http.get<GetTimtranLockResponse>(
      `${this.apiUrl}/GetTimtranLock`,
      { headers }
    );
  }
deleteTranLocksSelected(ids: number[], lang: number): Observable<any> {
    const headers = new HttpHeaders()
      .set('accept', '*/*')
      .set('lang', lang.toString())
      .set('Content-Type', 'application/json');

    const body: DeleteTranLocksRequest = { ids, lang };

    return this.http.delete(
      `${this.apiUrl}/TranLocksDeleteSelected`,
      { headers, body }
    );
  }
   insertTimtranLockInputForm(payload: InsertTimtranLockInputFormRequest, headerLang: number): Observable<ApiResponse> {
    const headers = new HttpHeaders()
      .set('accept', '*/*')
      .set('lang', headerLang.toString())
      .set('Content-Type', 'application/json');

    return this.http.post<ApiResponse>(
      `${this.apiUrl}/InsertTimtranLockInputForm`,
      payload,
      { headers }
    );
  }
}

