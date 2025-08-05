import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Addon, AddOnsApiResponse } from '../../../core/models/addon';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalaryAddOnsService {
  private apiUrl = `${environment.apiUrl}/api/SalaryAddon`;
  
  constructor(private http: HttpClient) { }
  
  // Method to get all salary add-ons
  getAllSalaryAddOns(lang: number, pageIndex: number, pageSize: number): Observable<AddOnsApiResponse> {
    const headers = {
      'accept': 'text/plain',
      'lang': lang.toString()
    };
    return this.http.get<AddOnsApiResponse>(`${this.apiUrl}?pageIndex=${pageIndex}&pageSize=${pageSize}`, { headers });
  }

  // Method to add a new salary add-on
  addSalaryAddOn(addon: Addon, lang: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.post(`${this.apiUrl}`, addon, { headers });
  }

  // Method to update an existing salary add-on
  updateSalaryAddOn(addon: Addon, lang: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.put(`${this.apiUrl}`, addon, { headers });
  }

  // Method to delete a salary add-on
  deleteSalaryAddOn(addonId: number, lang: number): Observable<any> {
    const headers = {
      'Content-Type': 'application/json',
      'lang': lang.toString()
    };
    return this.http.delete(`${this.apiUrl}/${addonId}`, { headers });
  }
}
