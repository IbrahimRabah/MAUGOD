import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse, CreatePostRequestBody, DeletePostRequestAttachmentParams, DeletePostRequestParams, dropdownResponseData, GetEmployeesDropdownListPayload, GetPartsDropdownListPayload, GetPostRequestAttachmentsParams, GetPostRequestsPayload, GetRequestRoadMapParams, GetRequestTransactionsParams, PostRequestAttachmentsData, PostRequestsData, RequestRoadMapDetailsData, RequestTransactionsDetailsData, UploadPostRequestAttachmentBody } from '../../../core/models/postRequest';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostRequestService {
  private apiUrl = `${environment.apiUrl}/RequestsAndApprovals`
  constructor(private http: HttpClient) { }
  getPostRequests(
    payload: GetPostRequestsPayload,
    lang: number
  ): Observable<ApiResponse<PostRequestsData>> {
    const headers = new HttpHeaders({ lang: lang.toString() });
    return this.http.post<ApiResponse<PostRequestsData>>(
      `${this.apiUrl}/GetPostRequests`,
      payload,
      { headers }
    );
  }

    /** Create a new post request */
  createPostRequest(
    payload: CreatePostRequestBody,
    lang: number
  ): Observable<ApiResponse<any>> {
    const headers = new HttpHeaders().set('lang', lang.toString());
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/CreatePostRequest`, // ✅ adjust if backend route differs
      payload,
      { headers }
    );
  }







































  // dropdowns
  getPartsDropdownListForPostRequest(
  payload: GetPartsDropdownListPayload,
  lang: number
): Observable<ApiResponse<dropdownResponseData>> {
  const headers = new HttpHeaders().set('lang', lang.toString());
  return this.http.post<ApiResponse<dropdownResponseData>>(
    `${this.apiUrl}/GetPartsDropdownListForPostRequest`,
    payload,
    { headers }
  );
}
getEmployeeDropdownListForPostRequest(
  payload: GetEmployeesDropdownListPayload,
  lang: number
): Observable<ApiResponse<dropdownResponseData>> {
  const headers = new HttpHeaders()
  .set('lang', lang.toString())
  .set('apexEmpId', payload.apexEmpId.toString());
  return this.http.get<ApiResponse<dropdownResponseData>>(
    `${this.apiUrl}/GetEmployeesDropdownListForPostRequest`,
    { headers }
  );
}
getStatusDropdownListForPostRequest(
  payload: GetEmployeesDropdownListPayload,
  lang: number
): Observable<ApiResponse<dropdownResponseData>> {
  const headers = new HttpHeaders()
  .set('lang', lang.toString())
  .set('apexEmpId', payload.apexEmpId.toString());
  return this.http.get<ApiResponse<dropdownResponseData>>(
    `${this.apiUrl}/GetStatusesDropdownListForPostRequest`,
    { headers }
  );
}
getRequestTransactionsForPostRequestDetailsByReqId(
  params: GetRequestTransactionsParams,
  lang: number
): Observable<ApiResponse<RequestTransactionsDetailsData>> {
  const headers = new HttpHeaders()
    .set('lang', lang.toString())
    .set('ReqId', params.reqId.toString())
    // NOTE: API expects header name exactly as shown in cURL: "pageNumer"
    .set('pageNumer', params.pageNumber.toString())
    .set('pageSize', params.pageSize.toString());

  return this.http.get<ApiResponse<RequestTransactionsDetailsData>>(
    `${this.apiUrl}/GetRequestTransactionsForPostRequestDetailsByReqId`,
    { headers }
  );
}

getRequestRoadMapForPostRequestDetailsByReqId(
  params: GetRequestRoadMapParams,
  lang: number = 1
): Observable<ApiResponse<RequestRoadMapDetailsData>> {
  const headers = new HttpHeaders()
    .set('lang', lang.toString())
    .set('ReqId', params.reqId.toString())
    // API header spelling: "pageNumer"
    .set('pageNumer', params.pageNumber.toString())
    .set('pageSize', params.pageSize.toString());

  return this.http.get<ApiResponse<RequestRoadMapDetailsData>>(
    `${this.apiUrl}/GetRequestRoadMapForPostRequestDetailsByReqId`,
    { headers }
  );
}
uploadPostRequestAttachment(
  payload: UploadPostRequestAttachmentBody,
  lang: number
): Observable<ApiResponse<any>> {
  const headers = new HttpHeaders().set('lang', lang.toString());
  return this.http.post<ApiResponse<any>>(
    `${this.apiUrl}/UploadPostRequestAttachment`,
    payload,
    { headers }
  );
}
// Method (add inside PostRequestService)
getPostRequestAttachmentsByReqId(
  params: GetPostRequestAttachmentsParams,
  lang: number
): Observable<ApiResponse<PostRequestAttachmentsData>> {
  const headers = new HttpHeaders()
    .set('lang', lang.toString())
    .set('reqId', params.reqId.toString())
    // backend expects "pageNumer" (typo kept from API contract)
    .set('pageNumer', params.pageNumber.toString())
    .set('pageSize', params.pageSize.toString());

  return this.http.get<ApiResponse<PostRequestAttachmentsData>>(
    `${this.apiUrl}/GetPostRequestAttachmentsByReqID`,
    { headers }
  );
}
deletePostRequestAttachment(
  params: DeletePostRequestAttachmentParams,
  lang: number 
): Observable<ApiResponse<any>> {
  const headers = new HttpHeaders()
    .set('lang', lang.toString())
    .set('attachId', params.attachId.toString());

  return this.http.delete<ApiResponse<any>>(
    `${this.apiUrl}/DeletePostRequestAttachment`,
    { headers }
  );
}
deletePostRequest(
  params: DeletePostRequestParams,
  lang: number 
): Observable<ApiResponse<any>> {
  const headers = new HttpHeaders()
    .set('lang', lang.toString())
    .set('requestId', params.requestId.toString());

  return this.http.delete<ApiResponse<any>>(
    `${this.apiUrl}/DeletePostRequest`,
    { headers }
  );
}

}