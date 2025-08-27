import { Injectable } from '@angular/core';
import { Branch, BranchResponse, BranchCreateUpdateRequest, BranchEditResponse } from '../../../core/models/branch';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PaginationRequest } from '../../../core/models/pagination';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
 private apiUrl = `${environment.apiUrl}/Branches`  ;
   
  constructor(private http:HttpClient) { }
  getBranches(pagination: PaginationRequest): Observable<BranchResponse> {
    const headers = new HttpHeaders({
      'lang': pagination.lang.toString()
    });

    return this.http.post<BranchResponse>(`${this.apiUrl}/GetBranches`, pagination,{ headers });
  }
  getBranchById(branchId: number, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'lang': lang.toString(),
      'branchId': branchId.toString()
    });
    return this.http.get<BranchEditResponse>(`${this.apiUrl}/GetEditBranch`, { headers })
      .pipe(
        map(response => {
          console.log('API Response:', response);
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to get branch');
        })
      );
  }
  
  addBranch(branch: BranchCreateUpdateRequest, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
    return this.http.post<any>(`${this.apiUrl}/CreateBranch`, branch, { headers });
  }
  
  updateBranch(id: number, branch: BranchCreateUpdateRequest, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString(),
      'branchId': id.toString() // Include branchId in the headers if required by the API
    });
    
    // Include branchId in the request body as required by the API
    const branchData = {
      branchId: id,
      ar: branch.ar,
      en: branch.en,
      mgrId: branch.mgrId,
      locDesc: branch.locDesc,
      parentBranchId: branch.parentBranchId,
      locId: branch.locId,
      note: branch.note
    };
    
    return this.http.post<any>(`${this.apiUrl}/UpdateBranch`, branchData, { headers });
  }

  
  deleteBranch(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/DeleteBranchById/${id}`);
  }
  
  changeBranchId(oldBranchId: number, newBranchId: number, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });
    
    const requestBody = {
      tableName: "BRANCHES",
      oldBranchId: oldBranchId,
      newBranchId: newBranchId,
      
    };

    return this.http.post<any>(`${this.apiUrl}/UpdateBranchPrimaryKey`, requestBody, { headers });
  }
}
