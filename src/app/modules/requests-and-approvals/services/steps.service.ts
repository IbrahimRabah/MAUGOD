import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CreateTimeTransactionApprovalRequest, CreateTimeTransactionApprovalResponse, GetRequestRoadMapDetailsForRequestApprovalRouteResponse, GetTimeTransactionApprovalByIdResponse, GetTimeTransactionApprovals, GetTimeTransactionApprovalsResponse, TimeTransactionApprovalCreateDto } from '../../../core/models/steps';
import { Observable } from 'rxjs';
import { DeleteRequestApprovalRouteResponse } from '../../../core/models/requestRoute';

@Injectable({
  providedIn: 'root'
})
export class StepsService {
  private apiUrl = `${environment.apiUrl}/RequestsAndApprovals`;
  constructor(private http: HttpClient) { }

  getRequestApprovalRoutes(
    request: GetTimeTransactionApprovals,
    lang: number
  ): Observable<GetTimeTransactionApprovalsResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<GetTimeTransactionApprovalsResponse>(
      `${this.apiUrl}/GetTimeTransactionApprovals`,
      request,
      { headers }
    );
  }
  getRequestRoadMapDetailsForRequestApprovalRoute(
    routeId: number,
    pageNumber: number,
    pageSize: number,
    lang: number
  ) {
    return this.http.get<GetRequestRoadMapDetailsForRequestApprovalRouteResponse>(
      `${this.apiUrl}/GetRequestRoadMapForTimeTransactionApprovalDetails`,
      {
        headers: {
          accept: '*/*',
          lang: lang.toString(),
          routeId: routeId.toString(),
          pageNumer: pageNumber.toString(), // API uses "pageNumer" typo
          pageSize: pageSize.toString()
        }
      }
    );
  }

  deleteRequesrTimeTransactionApproval(routeId: number, lang: number) {
    return this.http.delete<DeleteRequestApprovalRouteResponse>(
      `${this.apiUrl}/DeleteTimeTransactionApproval`,
      {
        headers: {
          accept: '*/*',
          lang: String(lang),
          routeId: String(routeId)
        }
      }
    );
  }

  createTimeTransactionApproval(
    dto: TimeTransactionApprovalCreateDto,
    lang: number
  ): Observable<CreateTimeTransactionApprovalResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'Content-Type': 'application/json',
      'lang': String(lang),
    });

    const body: CreateTimeTransactionApprovalRequest = {
      timeTransactionApprovalCreateDto: dto,
    };

    return this.http.post<CreateTimeTransactionApprovalResponse>(
      `${this.apiUrl}/CreateTimeTransactionApproval`,
      body,
      { headers }
    );
  }

  getTimeTransactionApprovalById(
    routeId: number,
    lang: number 
  ): Observable<GetTimeTransactionApprovalByIdResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': String(lang),
      'routeId': String(routeId),
    });

    return this.http.get<GetTimeTransactionApprovalByIdResponse>(
      `${this.apiUrl}/GetTimeTransactionApprovalById`,
      { headers }
    );
  }

    updateTimeTransactionApproval(
    dto: TimeTransactionApprovalCreateDto,
    lang: number
  ): Observable<CreateTimeTransactionApprovalResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'Content-Type': 'application/json',
      'lang': String(lang),
    });

    const body: CreateTimeTransactionApprovalRequest = {
      timeTransactionApprovalCreateDto: dto,
    };

    return this.http.post<CreateTimeTransactionApprovalResponse>(
      `${this.apiUrl}/UpdateTimeTransactionApproval`,
      body,
      { headers }
    );
  }
}