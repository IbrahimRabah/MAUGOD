import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account, LoginResponse } from '../../../core/models/account';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = `${environment.apiUrl}/Account`  ;

  constructor(private http: HttpClient) { }

  login(account: Account): Observable<any> {
    return this.http.post(`${this.apiUrl}/Login`, account);
  }

  register(account: Account): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Register`, account);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/Logout`, {});
  }

  isAuthenticated(): boolean {
    if (!localStorage.getItem('token')) {
      return true;
    }else{
    return true;
    }
  }
  getAuthToken() {
    let token = localStorage.getItem('token') || '';
    return token;
  }
}
