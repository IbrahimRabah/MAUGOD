import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AcceptApprovalRequestQuery, AttendanceAdjustmentRequest, RequestApprovalVacationAttendanceAdjustmentResponse, RequestApprovalVacationTimeTransactionApprovalResponse, TimeTransactionApprovalRequest } from '../../../core/models/requestApprovalVacations';
import { ApiResponse } from '../../../core/models/TimtranLock';

@Injectable({
  providedIn: 'root'
})

export class RequestApprovalVacationsService {

  private apiUrl = `${environment.apiUrl}/RequestsAndApprovals`;

  constructor(private http: HttpClient) { }


  getTimeTransactionApprovalRequests(request: TimeTransactionApprovalRequest, lang: number): Observable<RequestApprovalVacationTimeTransactionApprovalResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<RequestApprovalVacationTimeTransactionApprovalResponse>(
      `${this.apiUrl}/GetApprovalLeaveandAssignmentRequests`,
      request,
      { headers }
    );
  }

  acceptHandleApproval(request: AcceptApprovalRequestQuery, lang: number): Observable<ApiResponse<boolean>> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/AcceptHandleApprovalRequest`,
      request,
      { headers }
    );
  }

  rejectHandleApprovalRequest(request: AcceptApprovalRequestQuery, lang: number): Observable<ApiResponse<boolean>> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/RejectHandleApprovalRequest`,
      request,
      { headers }
    );
  }

  getApproveAttendanceAdjustmentRequests(request: AttendanceAdjustmentRequest, lang: number): Observable<RequestApprovalVacationAttendanceAdjustmentResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<RequestApprovalVacationAttendanceAdjustmentResponse>(
      `${this.apiUrl}/GetApproveAttendanceAdjustmentRequests`,
      request,
      { headers }
    );
  }

  acceptTimetranRequest(request: AcceptApprovalRequestQuery, lang: number): Observable<ApiResponse<boolean>> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/AcceptTimetranRequest`,
      request,
      { headers }
    );
  }


  rejectTimetranRequest(request: AcceptApprovalRequestQuery, lang: number): Observable<ApiResponse<boolean>> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/RejectTimetranRequest`,
      request,
      { headers }
    );
  }

}
