import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account, LoginResponse } from '../../../core/models/account';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = `${environment.apiUrl}/Account`;
  private authStatusSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(account: Account): Observable<any> {
    return this.http.post(`${this.apiUrl}/Login`, account);
  }

  register(account: Account): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Register`, account);
  }

  logout(): void {
    localStorage.clear();
    this.authStatusSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    const isAuth = this.hasValidToken();
    this.authStatusSubject.next(isAuth);
    return isAuth;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    if (token == null) {
      console.log('User is not authenticated');
      return false;
    } else {
      console.log('User is authenticated');
      return true;
    }
  }

  getAuthToken() {
    let token = localStorage.getItem('token') || '';
    return token;
  }

  getEmpId(): string {
    return localStorage.getItem('empId') || '';
  }
getEmpName(): string {
  const empName = localStorage.getItem('empName')?.trim(); // remove spaces

  if (empName) {
    return empName;  // non-null, non-empty, not just spaces
  }

  return 'User Name';
}


  getEmpIdAsNumber(): number | null {
    const empId = localStorage.getItem('empId');
    return empId ? parseInt(empId, 10) : null;
  }

  // Call this method when login is successful
  setAuthenticated(token: string): void {
    localStorage.setItem('token', token);
    this.authStatusSubject.next(true);
    this.router.navigate(['/home']);
  }
}
