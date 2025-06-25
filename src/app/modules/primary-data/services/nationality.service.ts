import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PaginationRequest } from '../../../core/models/pagination';
import { Observable } from 'rxjs';
import { Nationality, NationalityResponse } from '../../../core/models/nationality ';

@Injectable({
  providedIn: 'root'
})
export class NationalityService {

private apiUrl = `${environment.apiUrl}/Nationalities`  ;
   
  constructor(private http:HttpClient) { }
  getNationalities(pagination:PaginationRequest): Observable<NationalityResponse> {
    const params = {
      'lang': pagination.lang,
      'pageNumber': pagination.pageNumber,
      'pageSize': pagination.pageSize
    };

    return this.http.get<NationalityResponse>(`${this.apiUrl}/GetNationalities`, { params });
  }
  getNationalityById(id: number, lang: number): Observable<Nationality> {
    const params = { lang: lang.toString() };
    return this.http.get<Nationality>(`${this.apiUrl}/GetNationalityById/${id}`, { params });
  }
  addNationality(nationality: Nationality): Observable<Nationality> {
    return this.http.post<Nationality>(`${this.apiUrl}/AddNationality`, nationality);
  }
  updateNationality(nationality: Nationality): Observable<Nationality> {
    return this.http.put<Nationality>(`${this.apiUrl}/UpdateNationality`, nationality);
  }
  deleteNationality(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteNationality/${id}`);
  }
}
