import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AcceptApprovalRequestQuery, AttendanceAdjustmentRequest, RequestApprovalVacationAttendanceAdjustmentResponse, RequestApprovalVacationTimeTransactionApprovalResponse, TimeTransactionApprovalRequest, TimtranApprovalRoadmapVacationsDetailsData, TimtranApprovalTransactionsVacationsDetailsData } from '../../../core/models/requestApprovalVacations';
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

  GetTimtranApprovalTransactionsForRequestVacationsDetailsByReqId(
    lang: number,
    reqId: number,
    pageNumber: number,
    pageSize: number
  ): Observable<ApiResponse<TimtranApprovalTransactionsVacationsDetailsData>> {
    const url = `${this.apiUrl}/GetTimtranApprovalTransactions`;
  
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      ReqId: reqId.toString(),
      pageNumer: pageNumber.toString(), // note: API uses 'pageNumer' (one 'm')
      pageSize: pageSize.toString(),
    });
  
    return this.http.get<ApiResponse<TimtranApprovalTransactionsVacationsDetailsData>>(url, { headers });
  }

   GetTimtranApprovalRoadmapForRequestVacationsDetailsByReqId(
    lang: number,
    reqId: number,
    pageNumber: number,
    pageSize: number
  ): Observable<ApiResponse<TimtranApprovalRoadmapVacationsDetailsData>> {
    const url = `${this.apiUrl}/GetTimtranApprovalRoadmap`;
  
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      ReqId: reqId.toString(),
      pageNumer: pageNumber.toString(), // note: API uses 'pageNumer' (one 'm')
      pageSize: pageSize.toString(),
    });
  
    return this.http.get<ApiResponse<TimtranApprovalRoadmapVacationsDetailsData>>(url, { headers });
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
