import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MySalaryResponse } from '../../../core/models/mySalary';
import { AddOnsApiResponse } from '../../../core/models/addon';
import { SalaryResponse } from '../../../core/models/CalculateSalaryRequest';
import { SalariesDetailsResponse } from '../../../core/models/salariesDetails';

@Injectable({
  providedIn: 'root'
})
export class MysalaryService {
  private apiUrl = `${environment.apiUrl}/api/MySalary`;
  
  constructor(private http: HttpClient) { }

  /**
   * Get employee salary information by employee ID
   * @param empId - Employee ID
   * @param lang - Language preference (1 for Arabic, 2 for English)
   * @returns Observable<MySalaryResponse>
   */
  getMySalaryInfo(empId: number, lang: number): Observable<MySalaryResponse> {
    const headers = new HttpHeaders({
      'accept': 'text/plain',
      'lang': lang.toString()
    });

    return this.http.get<MySalaryResponse>(`${this.apiUrl}/info/${empId}`, { headers });
  }

  /**
   * Get employee salary addons by employee ID
   * @param empId - Employee ID
   * @param lang - Language preference (1 for Arabic, 2 for English)
   * @returns Observable<AddOnsApiResponse>
   */
  getMySalaryAddons(empId: number, lang: number): Observable<AddOnsApiResponse> {
    const headers = new HttpHeaders({
      'accept': 'text/plain',
      'lang': lang.toString()
    });

    return this.http.get<AddOnsApiResponse>(`${this.apiUrl}/addons/${empId}`, { headers });
  }

  /**
   * Get employee salary calculation by employee ID
   * @param empId - Employee ID
   * @param lang - Language preference (1 for Arabic, 2 for English)
   * @returns Observable<SalaryResponse>
   */
  getMySalaryCalculation(empId: number, lang: number): Observable<SalaryResponse> {
    const headers = new HttpHeaders({
      'accept': 'text/plain',
      'lang': lang.toString()
    });

    return this.http.get<SalaryResponse>(`${this.apiUrl}/calculation/${empId}`, { headers });
  }

  /**
   * Get employee salary details by employee ID
   * @param empId - Employee ID
   * @param lang - Language preference (1 for Arabic, 2 for English)
   * @returns Observable<SalariesDetailsResponse>
   */
  getMySalaryDetails(empId: number, lang: number): Observable<SalariesDetailsResponse> {
    const headers = new HttpHeaders({
      'accept': 'text/plain',
      'lang': lang.toString()
    });

    return this.http.get<SalariesDetailsResponse>(`${this.apiUrl}/details/${empId}`, { headers });
  }
}
