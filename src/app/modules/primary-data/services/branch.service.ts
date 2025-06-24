import { Injectable } from '@angular/core';
import { Branch, BranchResponse } from '../../../core/models/branch';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PaginationRequest } from '../../../core/models/pagination';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
 private apiUrl = `${environment.apiUrl}/Branches`  ;
   
  constructor(private http:HttpClient) { }
  getBranches(pagination:PaginationRequest): Observable<BranchResponse> {
    const params = {
      'lang': pagination.lang,
      'pageNumber': pagination.pageNumber,
      'pageSize': pagination.pageSize
    };

    return this.http.get<BranchResponse>(`${this.apiUrl}/GetBranches`, { params });
  }
  getBranchById(id: number, lang: number): Observable<Branch> {
    const params = { lang: lang.toString() };
    return this.http.get<Branch>(`${this.apiUrl}/GetBranchById/${id}`, { params });
  }
  addBranch(branch: Branch): Observable<Branch> {
    return this.http.post<Branch>(`${this.apiUrl}/AddBranch`, branch);
  }
  updateBranch(branch: Branch): Observable<Branch> {
    return this.http.put<Branch>(`${this.apiUrl}/UpdateBranch`, branch);
  }
  deleteBranch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteBranch/${id}`);
  }
}
