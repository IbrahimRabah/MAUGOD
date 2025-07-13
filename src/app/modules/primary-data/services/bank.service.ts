import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PaginationRequest } from '../../../core/models/pagination';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Bank, BankResponse } from '../../../core/models/bank';

@Injectable({
  providedIn: 'root'
})
export class BankService {

private apiUrl = `${environment.apiUrl}/Banks`  ;
   
  constructor(private http:HttpClient) { }
  getBanks(pagination:PaginationRequest): Observable<BankResponse> {
    const headers  =  new HttpHeaders({
      'lang': pagination.lang,
      'pageNumber': pagination.pageNumber,
      'pageSize': pagination.pageSize
    });

    return this.http.get<BankResponse>(`${this.apiUrl}/GetBanks`, { headers });
  }
  getBankById(id: number, lang: number): Observable<Bank> {
    const params = { lang: lang.toString() };
    return this.http.get<Bank>(`${this.apiUrl}/GetBankInfoById/${id}`, { params });
  }
  addBank(bank: Bank): Observable<Bank> {
    return this.http.post<Bank>(`${this.apiUrl}/AddBankInfo`, bank);
  }
  updateBank(bank: Bank): Observable<Bank> {
    return this.http.post<Bank>(`${this.apiUrl}/UpdateBankInfo`, bank);
  }
  deleteBank(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteBankById/${id}`);
  }
}
