import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChartDropdownResponse, DeleteMultipleRoleChartRightsRequest, RoleChartRightsRequest, RoleChartRightsResponse, Roles } from '../../../core/models/roleCharts';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleChartsService {

private apiUrl = `${environment.apiUrl}/RoleChartRights`  ;
   
  constructor(private http:HttpClient) { }
    getChartDropdown(roleId: number,lang:number): Observable<ChartDropdownResponse> {
    const headers = new HttpHeaders({ 'Accept': 'text/plain', 'lang': lang.toString() });
    return this.http.get<ChartDropdownResponse>(`${this.apiUrl}/charts-dropdown/${roleId}`, { headers });
  }
  getRoleDropdown(lang: number): Observable<Roles> {
    const headers = new HttpHeaders({ 'Accept': 'text/plain', 'lang': lang.toString() });
    return this.http.get<Roles>(`${this.apiUrl}/roles-dropdown`, { headers });
  }
  getRoleChartRights(pageSize: number, pageIndex: number, lang: number, colunmSearchName : string | null, colunmSearchValue : string|null ): Observable<RoleChartRightsResponse> {
    let params = new HttpParams()
                      .set('pageSize', pageSize.toString())
                      .set('pageIndex', pageIndex.toString());
    if(colunmSearchName && colunmSearchValue){
        params = params.set(colunmSearchName, colunmSearchValue);
      }
    const headers = new HttpHeaders({ 'Accept': 'text/plain', 'lang': lang.toString() });
    return this.http.get<RoleChartRightsResponse>(`${this.apiUrl}`, { headers, params });
  }
  createRoleChartRights(payload: RoleChartRightsRequest, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'text/plain',
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });

    return this.http.post<any>(this.apiUrl, payload, { headers });
  }
  deleteRoleChartRights(id: number, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'text/plain',
      'lang': lang.toString()
    });

    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
  deleteMultipleRoleChartRights(payload: DeleteMultipleRoleChartRightsRequest, lang: number): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'text/plain',
      'Content-Type': 'application/json',
      'lang': lang.toString()
    });

    return this.http.delete<any>(`${this.apiUrl}/multiple`, {
      headers,
      body: payload // Pass the payload as the request body
    });
  }
}
