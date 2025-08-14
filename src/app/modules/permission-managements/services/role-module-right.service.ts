import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse, CreateUserRoleModuleRightsRequest, CreateUserRoleModuleRightsResponse, CustomUserRoleModuleRightsCopyRequest, CustomUserRoleModuleRightsCopyResponse, DeleteSelectedUserRoleModuleRightsRequest, DeleteSelectedUserRoleModuleRightsResponse, DeleteUserRoleModuleRightResponse, GetModulesDropdownListRequest, GetModulesDropdownListResponse, GetRolesDropdownListResponse, GetUserRoleModuleRightByIdResponse, GetUserRoleModuleRightsBySrcRoleResponse, TypicalUserRoleModuleRightsCopyRequest, TypicalUserRoleModuleRightsCopyResponse, UpdateUserRoleModuleRightRequest, UpdateUserRoleModuleRightResponse, UserRoleModuleRightsData } from '../../../core/models/UserRoleModuleRight ';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleModuleRightService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getUserRoleModuleRights(lang: number, pageSize: number, pageIndex: number): Observable<ApiResponse<UserRoleModuleRightsData>> {
    const headers = new HttpHeaders()
      .set('lang', lang.toString())
      .set('pageSize', pageSize.toString())
      .set('pageIndex', pageIndex.toString());
    return this.http.get<ApiResponse<UserRoleModuleRightsData>>(`${this.apiUrl}/SystemPermissions/GetUserRoleModuleRights`, { headers });
  }
  deleteOneUserRoleModuleRight(
    recId: number,
    lang: number
  ): Observable<DeleteUserRoleModuleRightResponse> {
    const headers = new HttpHeaders()
      .set('recId', recId.toString())
      .set('lang', lang.toString());

    return this.http.delete<DeleteUserRoleModuleRightResponse>(
      `${this.apiUrl}/SystemPermissions/DeleteOneUserRoleModuleRight`,
      { headers }
    );
  }
  deleteSelectedUserRoleModuleRights(
    request: DeleteSelectedUserRoleModuleRightsRequest,
    lang: number
  ): Observable<DeleteSelectedUserRoleModuleRightsResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.request<DeleteSelectedUserRoleModuleRightsResponse>(
      'DELETE',
      `${this.apiUrl}/SystemPermissions/DeleteSelectedUserRoleModuleRights`,
      {
        headers,
        body: request
      }
    );
  }
  getModulesDropdownListForRoleModuleRightsCreateForm(
    request: GetModulesDropdownListRequest = {},
    lang: number
  ): Observable<GetModulesDropdownListResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<GetModulesDropdownListResponse>(
      `${this.apiUrl}/SystemPermissions/GetModulesDropdownListForRoleModuleRightsCreateForm`,
      request,
      { headers }
    );
  }
  createUserRoleModuleRights(
    request: CreateUserRoleModuleRightsRequest,
    lang: number
  ): Observable<CreateUserRoleModuleRightsResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<CreateUserRoleModuleRightsResponse>(
      `${this.apiUrl}/SystemPermissions/CreateUserRoleModuleRights`,
      request,
      { headers }
    );
  }
  getSourceRolesDropdownListForRoleModuleRights(
    lang: number
  ): Observable<GetRolesDropdownListResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
    });

    return this.http.get<GetRolesDropdownListResponse>(
      `${this.apiUrl}/SystemPermissions/GetSourceRolesDropdownListForRoleModuleRights`,
      { headers }
    );
  }
  getDestinationRolesDropdownListForRoleModuleRights(
    lang: number
  ): Observable<GetRolesDropdownListResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
    });

    return this.http.get<GetRolesDropdownListResponse>(
      `${this.apiUrl}/SystemPermissions/GetDestinationRolesDropdownListForRoleModuleRights`,
      { headers }
    );
  }
  getUserRoleModuleRightsBySrcRoleForCustomChkBox(
    srcRole: number,
    lang: number
  ): Observable<GetUserRoleModuleRightsBySrcRoleResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      srcRole: srcRole.toString()
    });

    return this.http.get<GetUserRoleModuleRightsBySrcRoleResponse>(
      `${this.apiUrl}/SystemPermissions/GetUserRoleModuleRightsBySrcRoleForCustomChkBox`,
      { headers }
    );
  }
  customUserRoleModuleRightsCopy(
    request: CustomUserRoleModuleRightsCopyRequest,
    lang: number
  ): Observable<CustomUserRoleModuleRightsCopyResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<CustomUserRoleModuleRightsCopyResponse>(
      `${this.apiUrl}/SystemPermissions/CustomUserRoleModuleRightsCopy`,
      request,
      { headers }
    );
  }
  typicalUserRoleModuleRightsCopy(
    request: TypicalUserRoleModuleRightsCopyRequest,
    lang: number = 1
  ): Observable<TypicalUserRoleModuleRightsCopyResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<TypicalUserRoleModuleRightsCopyResponse>(
      `${this.apiUrl}/SystemPermissions/TypicalUserRoleModuleRightsCopy`,
      request,
      { headers }
    );
  }
  getUserRoleModuleRightById(
    recId: number,
    lang: number
  ): Observable<GetUserRoleModuleRightByIdResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      recId: recId.toString()
    });

    return this.http.get<GetUserRoleModuleRightByIdResponse>(
      `${this.apiUrl}/SystemPermissions/GetUserRoleModuleRightById`,
      { headers }
    );
  }
  updateUserRoleModuleRight(
    request: UpdateUserRoleModuleRightRequest,
    lang: number = 1
  ): Observable<UpdateUserRoleModuleRightResponse> {
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: String(lang),
      'Content-Type': 'application/json'
    });

    return this.http.post<UpdateUserRoleModuleRightResponse>(
      `${this.apiUrl}/SystemPermissions/UpdateUserRoleModuleRight`,
      request,
      { headers }
    );
  }

}




