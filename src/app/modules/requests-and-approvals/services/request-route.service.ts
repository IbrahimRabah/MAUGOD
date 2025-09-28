import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  GetRequestApprovalRoutesRequest, 
  GetRequestApprovalRoutesResponse,
  DeleteRequestApprovalRouteResponse,
  GetRoadMapDetailsForRequestApprovalRouteResponse,
  ApiResponse,
  EmployeesDropdownData,
  DepartmentsOrMgrDropdownData,
  BranchesOrMgrDropdownData,
  RolesDropdownData,
  StatuesDropdownData,
  RequestLevelsDropdownData,
  CreateRequestApprovalRouteResponse,
  CreateRequestApprovalRouteRequest,
  AfterLimitActionsDropdownData,
  LevelsDropdownData,
  ManagersDropdownData,
  GetRequestApprovalRouteByIdResponse,
  GetRequestApprovalRouteByIdRequest,
  UpdateRequestApprovalRouteRequest
} from '../../../core/models/requestRoute';

@Injectable({
  providedIn: 'root'
})
export class RequestRouteService {
  private apiUrl = `${environment.apiUrl}/RequestsAndApprovals`;
  constructor(private http: HttpClient) { }
  getRequestApprovalRoutes(
    request: GetRequestApprovalRoutesRequest,
    lang: number
  ): Observable<GetRequestApprovalRoutesResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': lang.toString(),
      'Content-Type': 'application/json'
    });

    return this.http.post<GetRequestApprovalRoutesResponse>(
      `${this.apiUrl}/GetRequestApprovalRoutes`,
      request,
      { headers }
    );
  }
  createRequestApprovalRoute(
  body: CreateRequestApprovalRouteRequest,
  lang: number
) {
  return this.http.post<CreateRequestApprovalRouteResponse>(
    `${this.apiUrl}/CreateRequestApprovalRoute`,
    body,
    {
      headers: {
        accept: '*/*',
        lang: lang.toString(),
        'Content-Type': 'application/json'
      }
    }
  );
}

  deleteRequestApprovalRoute(routeId: number, lang: number ) {
  return this.http.delete<DeleteRequestApprovalRouteResponse>(
    `${this.apiUrl}/DeleteRequestApprovalRoute`,
    {
      headers: {
        accept: '*/*',
        lang: String(lang),
        routeId: String(routeId)
      }
    }
  );
}
getRoadMapDetailsForRequestApprovalRoute(
  routeId: number,
  pageNumber: number,
  pageSize: number,
  lang: number
) {
  return this.http.get<GetRoadMapDetailsForRequestApprovalRouteResponse>(
    `${this.apiUrl}/GetRoadMapDetailsForRequestApprovalRoute`,
    {
      headers: {
        accept: '*/*',
        lang: lang.toString(),
        routeId: routeId.toString(),
        pageNumer: pageNumber.toString(), // API uses "pageNumer" typo
        pageSize: pageSize.toString()
      }
    }
  );
}
 getRequestApprovalRouteById(
    req: GetRequestApprovalRouteByIdRequest
  ): Observable<GetRequestApprovalRouteByIdResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'lang': String(req.lang ?? 1),
      'routeId': String(req.routeId),
    });

    return this.http.get<GetRequestApprovalRouteByIdResponse>(
      `${this.apiUrl}/GetRequestApprovalRouteById`,
      { headers }
    );
  }
  
  updateRequestApprovalRoute(
  body: UpdateRequestApprovalRouteRequest,
  lang: number
) {
  return this.http.post<CreateRequestApprovalRouteResponse>(
    `${this.apiUrl}/UpdateRequestApprovalRoute`,
    body,
    {
      headers: {
        accept: '*/*',
        lang: lang.toString(),
        'Content-Type': 'application/json'
      }
    }
  );
}


  // 1) Employees
getEmployeesDropdownListForTimeTransactionApproval(lang: number) {
  return this.http.get<ApiResponse<EmployeesDropdownData>>(
    `${this.apiUrl}/GetEmployeesDropdownListForTimeTransactionApproval`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}

// 2) Departments or Managers of Departments
getDepartmentsOrMgrOfDeptsDropdownListForTimeTransactionApproval(lang: number) {
  return this.http.get<ApiResponse<DepartmentsOrMgrDropdownData>>(
    `${this.apiUrl}/GetDepartmentsOrMgrOfDeptsDropdownListForTimeTransactionApproval`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}

// 3) Branches or Managers of Branches
getBranchsOrMgrOfBranchsDropdownListForTimeTransactionApproval(lang: number ) {
  return this.http.get<ApiResponse<BranchesOrMgrDropdownData>>(
    `${this.apiUrl}/GetBranchsOrMgrOfBranchsDropdownListForTimeTransactionApproval`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}

// 4) Roles
getRolesDropdownListForTimeTransactionApproval(lang: number) {
  return this.http.get<ApiResponse<RolesDropdownData>>(
    `${this.apiUrl}/GetRolesDropdownListForTimeTransactionApproval`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}

// 5) Statuses (Statues)
getStatuesDropdownListForRequestApprovalRoute(lang: number) {
  return this.http.get<ApiResponse<StatuesDropdownData>>(
    `${this.apiUrl}/GetStatuesDropdownListForRequestApprovalRoute`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}

// 6) Request Levels
getRequestLevelsDropdownListForTimeTransactionApproval(lang: number ) {
  return this.http.get<ApiResponse<RequestLevelsDropdownData>>(
    `${this.apiUrl}/GetRequestLevelsDropdownListForTimeTransactionApproval`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}

// 7) Managers
getManagersDropdownListForTimeTransactionApproval(lang: number) {
  return this.http.get<ApiResponse<ManagersDropdownData>>(
    `${this.apiUrl}/GetManagersDropdownListForTimeTransactionApproval`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}

getAfterLimitActionsDropdownListForTimeTransactionApproval(lang: number) {
  return this.http.get<ApiResponse<AfterLimitActionsDropdownData>>(
    `${this.apiUrl}/GetAfterLimitActionsDropdownListForTimeTransactionApproval`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}
getLevelsDropdownListForTimeTransactionApproval(lang: number) {
  return this.http.get<ApiResponse<LevelsDropdownData>>(
    `${this.apiUrl}/GetLevelsDropdownListForTimeTransactionApproval`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}
getLevelsDropdownListForTimeTransactionApprovalForLevel(lang: number) {
  return this.http.get<ApiResponse<LevelsDropdownData>>(
    `${this.apiUrl}/GetLevelsDropdownListForTimeTransactionApproval`,
    { headers: { accept: '*/*', lang: lang.toString() } }
  );
}
}