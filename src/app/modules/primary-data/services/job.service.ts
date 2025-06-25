import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PaginationRequest } from '../../../core/models/pagination';
import { Observable } from 'rxjs';
import { Job, JobResponse } from '../../../core/models/jobs';

@Injectable({
  providedIn: 'root'
})
export class JobService {

private apiUrl = `${environment.apiUrl}/Jobs`  ;
   
  constructor(private http:HttpClient) { }
  getJobs(pagination:PaginationRequest): Observable<JobResponse> {
     const headers  =  new HttpHeaders({
      'lang': pagination.lang,
      'pageNumber': pagination.pageNumber,
      'pageSize': pagination.pageSize
    });

    return this.http.get<JobResponse>(`${this.apiUrl}/GetJobs`, { headers });
  }
  getJobById(id: number, lang: number): Observable<Job> {
    const params = { lang: lang.toString() };
    return this.http.get<Job>(`${this.apiUrl}/GetJobById/${id}`, { params });
  }
  addJob(job: Job): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/AddJob`, job);
  }
  updateJob(job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/UpdateJob`, job);
  }
  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteJob/${id}`);
  }

}
