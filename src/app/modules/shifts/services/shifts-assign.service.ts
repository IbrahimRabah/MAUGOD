import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CreateShiftsAssignRequest, GetShiftsAssignResponse } from '../../../core/models/shiftsAssign';
import { Observable } from 'rxjs';
import { PaginationShiftsAssignRequest } from '../../../core/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class ShiftsAssignService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }
  getShiftsAssign(
    pageNumber: number,
    pageSize: number,
    empID:number,
    lang: number,
    sDate?: string,
    eDate?: string,
    selectedColumn?:string,
    searchTerm?:string
  ): Observable<GetShiftsAssignResponse> {

    let headers = new HttpHeaders()
      .set('accept', '*/*')
      .set('lang', lang.toString());

    // Add optional date headers if provided
    if (sDate) {
      headers = headers.set('sDate', sDate);
    }
    if (eDate) {
      headers = headers.set('eDate', eDate);
    }

    const paginationRequest: PaginationShiftsAssignRequest = {
        pageNumber: pageNumber,
        pageSize: pageSize,
        empId: empID,
        sDate:sDate,
        eDate:eDate,
        searchColumn: selectedColumn,
        searchText: searchTerm
      };
    return this.http.post<GetShiftsAssignResponse>(
      `${this.apiUrl}/Attendance/GetGetShiftsAssign`,
      paginationRequest,
      { headers }
    );
  }

  deleteShiftsAssignSelected(ids: number[], lang: number): Observable<any> {
    const headers = new HttpHeaders()
      .set('accept', '*/*')
      .set('lang', lang.toString())
      .set('Content-Type', 'application/json');

    const body = {
      ids,
      lang
    };

    return this.http.delete(
      `${this.apiUrl}/Attendance/ShiftsAssignDeleteSelected`,
      { headers, body }
    );
  }
  createShiftsAssign(payload: CreateShiftsAssignRequest, lang: number): Observable<any> {
    const headers = new HttpHeaders()
      .set('accept', '*/*')
      .set('lang', lang.toString())
      .set('Content-Type', 'application/json');

    return this.http.post(
      `${this.apiUrl}/Attendance/CreateShiftsAssign`,
      payload,
      { headers }
    );
  }
}
