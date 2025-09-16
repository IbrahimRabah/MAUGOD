import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDelegationRequest, CreateDelegationResponse, DelegationResponse } from '../../../core/models/delegations';

@Injectable({
  providedIn: 'root'
})
export class DelegationService {
  private apiUrl = `${environment.apiUrl}/PermissionsDelegation`;

  constructor(private http:HttpClient) { }
  getALlPermissionDelegations(lang:number,empId:number,pageIndex:number,pageSize:number):Observable<DelegationResponse>{
    const params = {
      pageSize: pageSize.toString(),
      pageIndex: pageIndex.toString()
    };
    const headers = new HttpHeaders({
      'Accept': 'text/plain',
      'lang': lang.toString()
    });
    const url = `${this.apiUrl}/index/${empId}`; // Complete URL with empId
    return this.http.get<DelegationResponse>(url, { headers, params });
  }
    createDelegation(payload: CreateDelegationRequest, lang: number): Observable<CreateDelegationResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json', 'lang': lang.toString() });
    return this.http.post<CreateDelegationResponse>(`${this.apiUrl}/Create`, payload, { headers });
  }
}
