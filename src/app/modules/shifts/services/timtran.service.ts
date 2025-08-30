import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse, DeleteTranLocksRequest, GetTimtranLockResponse, InsertTimtranLockInputFormRequest } from '../../../core/models/TimtranLock';
import { Observable } from 'rxjs';
import { PaginationCommonRequest } from '../../../core/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class TimtranService {
  private apiUrl = `${environment.apiUrl}/Attendance`;
  constructor(private http: HttpClient) { }
  getTimtranLock(pageNumber: number, pageSize: number, lang: number,selectedColumn?:string,
    searchTerm?:string): Observable<GetTimtranLockResponse> {
    const headers = new HttpHeaders()
      .set('accept', '*/*')
      .set('lang', lang.toString());

      const paginationRequest: PaginationCommonRequest = {
              pageNumber: pageNumber,
              pageSize: pageSize,
              searchColumn: selectedColumn,
              searchText: searchTerm
            };
    return this.http.post<GetTimtranLockResponse>(
      `${this.apiUrl}/GetTimtranLock`,paginationRequest,
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

