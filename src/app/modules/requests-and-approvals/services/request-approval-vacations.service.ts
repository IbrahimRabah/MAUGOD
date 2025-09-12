import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceAdjustmentRequest, RequestApprovalVacationAttendanceAdjustmentResponse, RequestApprovalVacationTimeTransactionApprovalResponse, TimeTransactionApprovalRequest } from '../../../core/models/requestApprovalVacations';

@Injectable({
  providedIn: 'root'
})

export class RequestApprovalVacationsService {

  private apiUrl = `${environment.apiUrl}/RequestsAndApprovals`;

  constructor(private http: HttpClient) { }

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

  
  getTimeTransactionApprovalRequests(request: TimeTransactionApprovalRequest, lang: number): Observable<RequestApprovalVacationTimeTransactionApprovalResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<RequestApprovalVacationTimeTransactionApprovalResponse>(
      `${this.apiUrl}/GetTimeTransactionApprovalRequests`,
      request,
      { headers }
    );
  }

}