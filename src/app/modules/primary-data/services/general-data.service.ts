import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../../../core/models/branch';
@Injectable({
  providedIn: 'root'
})
export class GeneralDataService {
    private apiUrl = `${environment.apiUrl}/Branches`  ;
   
  constructor(private http:HttpClient) { }
  getBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl);
  }
}
