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
  getJobs(pagination: PaginationRequest, searchTerm?: string): Observable<JobResponse> {
    let headers = new HttpHeaders({
      'lang': pagination.lang.toString()
    });

    let url = `${this.apiUrl}/GetJobs`;
    
    // Add search parameter if provided
    if (searchTerm && searchTerm.trim()) {
      url += `?search=${encodeURIComponent(searchTerm.trim())}`;
    }

    return this.http.post<JobResponse>(url,pagination, { headers });
  }
  getJobById(id: number, lang: number): Observable<Job> {
    const params = { lang: lang.toString() };
    return this.http.get<Job>(`${this.apiUrl}/GetJobById/${id}`, { params });
  }
  addJob(job: Job): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/AddEmpJob`, job);
  }
  updateJob(job: Job): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/UpdateEmpJob`, job);
  }
  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteJobById/${id}`);
  }

}
