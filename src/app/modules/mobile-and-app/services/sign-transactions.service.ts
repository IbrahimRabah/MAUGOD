import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MobileSignTransactionRequest, MobileSignTransactionResponse, RecalculateRequest, RecalculateResponse } from '../../../core/models/MobileSignTransaction';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignTransactionsService {
  private apiUrl = `${environment.apiUrl}/MobileAndApp`;
  constructor(private http: HttpClient) { }

  GetMobileSignTransactions(lang: number, request?: MobileSignTransactionRequest):Observable<MobileSignTransactionResponse> {
    const headers: any = {
      'accept': 'text/plain',
      'lang': lang.toString()
    };
    return this.http.post<MobileSignTransactionResponse>(`${this.apiUrl}/GetMobileSignTransactions`, request, { headers });
  }
  recalculateSelected(lang:number, request: RecalculateRequest): Observable<RecalculateResponse> {
    const headers: any = {
      'accept': 'text/plain',
      'lang': lang.toString()
    };

    const url = `${this.apiUrl}/RecalculateSelectedMobileSignTransaction`;
    return this.http.post<RecalculateResponse>(url, request, { headers });
  }
}

