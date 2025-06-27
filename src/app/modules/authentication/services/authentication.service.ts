import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account, LoginResponse } from '../../../core/models/account';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = `${environment.apiUrl}/Account`  ;

  constructor(private http: HttpClient,private router: Router) { }

  login(account: Account): Observable<any> {
    return this.http.post(`${this.apiUrl}/Login`, account);
  }

  register(account: Account): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Register`, account);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    if (localStorage.getItem('token') == null) {
      console.log('User is not authenticated');
      return false;
    }else{
      console.log('User is authenticated');
      return true;
    }
  }
  getAuthToken() {
    let token = localStorage.getItem('token') || '';
    return token;
  }
}
