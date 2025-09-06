import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, CreateTimeTransactionApprovalRequestPayload, CreateTimeTransactionApprovalRequestResponse, RequestRoadMapForAttendanceTimeChangeRequestDetailsData, RequestTransactionsForAttendanceTimeChangeRequestDetailsData, TimeTransactionApprovalData, TimeTransactionApprovalRequestAttachmentsData, TimeTransactionApprovalRequestBody, TimeTransactionApprovalRequestCreateDto, UploadTimeTransactionApprovalRequestAttachmentBody } from '../../../core/models/TimeTransactionApprovalData';

@Injectable({
  providedIn: 'root'
})
export class AttendanceTimeService {
  private apiUrl = `${environment.apiUrl}/RequestsAndApprovals`;
  constructor(private http: HttpClient) { }
  GetTimeTransactionApprovalRequests(lang:number,empId:number,pageNumber:number,pageSize:number,sDate?:string,eDate?:string):Observable<ApiResponse<TimeTransactionApprovalData>> {
    const url = `${this.apiUrl}/GetTimeTransactionApprovalRequests`;
        const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      'Content-Type': 'application/json',
    });
      const body: TimeTransactionApprovalRequestBody = {
      empId,
      sDate,
      eDate,
      pageNumber,
      pageSize,
    };
    return this.http.post<ApiResponse<TimeTransactionApprovalData>>(url, body, { headers });
  }
  DeleteTimeTransactionApprovalRequest(lang:number, requestId:number):Observable<ApiResponse<boolean>>{
    const url = `${this.apiUrl}/DeleteTimeTransactionApprovalRequest`;
    const headers = new HttpHeaders({
      accept: '*/*',
      lang: lang.toString(),
      requestId: requestId.toString(),
      'Content-Type': 'application/json',
    });
    return this.http.delete<ApiResponse<boolean>>(url, { headers });
  }  

GetRequestTransactionsForAttendanceTimeChangeRequestDetailsByReqId(
  lang: number,
  reqId: number,
  pageNumber: number,
  pageSize: number
): Observable<ApiResponse<RequestTransactionsForAttendanceTimeChangeRequestDetailsData>> {
  const url = `${this.apiUrl}/GetRequestTransactionsForAttendanceTimeChangeRequestDetailsByReqId`;

  const headers = new HttpHeaders({
    accept: '*/*',
    lang: lang.toString(),
    ReqId: reqId.toString(),
    pageNumer: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  return this.http.get<ApiResponse<RequestTransactionsForAttendanceTimeChangeRequestDetailsData>>(url, { headers });
}

GetRequestRoadMapForAttendanceTimeChangeRequestDetailsByReqId(
  lang: number,
  reqId: number,
  pageNumber: number,
  pageSize: number
): Observable<ApiResponse<RequestRoadMapForAttendanceTimeChangeRequestDetailsData>> {
  const url = `${this.apiUrl}/GetRequestRoadMapForAttendanceTimeChangeRequestDetailsByReqId`;

  const headers = new HttpHeaders({
    accept: '*/*',
    lang: lang.toString(),
    ReqId: reqId.toString(),
    pageNumer: pageNumber.toString(), // note: API uses 'pageNumer' (one 'm')
    pageSize: pageSize.toString(),
  });

  return this.http.get<ApiResponse<RequestRoadMapForAttendanceTimeChangeRequestDetailsData>>(url, { headers });
}
GetTimeTransactionApprovalRequestAttachmentsByReqID(
  lang: number,
  reqId: number,
  pageNumber: number,
  pageSize: number
): Observable<ApiResponse<TimeTransactionApprovalRequestAttachmentsData>> {
  const url = `${this.apiUrl}/GetTimeTransactionApprovalRequestAttachmentsByReqID`;

  const headers = new HttpHeaders({
    accept: '*/*',
    lang: lang.toString(),
    reqId: reqId.toString(),
    pageNumer: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  return this.http.get<ApiResponse<TimeTransactionApprovalRequestAttachmentsData>>(url, { headers });
}

UploadTimeTransactionApprovalRequestAttachment(
  lang: number,
  reqId: number,
  base64File: string,     // pure base64 (no "data:...;base64," prefix)
  fileName: string,
  fileType: string,
  note: string | null = null
): Observable<ApiResponse<any>> {
  const url = `${this.apiUrl}/UploadTimeTransactionApprovalRequestAttachment`;

  const headers = new HttpHeaders({
    accept: '*/*',
    lang: lang.toString(),
    'Content-Type': 'application/json',
  });

  const body: UploadTimeTransactionApprovalRequestAttachmentBody = {
    UploadTimeTransactionApprovalRequestAttachmentDto: {
      ReqType: 2,                    // static as requested
      ReqId: reqId,
      File: base64File,
      FileType: fileType,
      FilePath: fileName,
      Note: note,
    },
  };

  return this.http.post<ApiResponse<any>>(url, body, { headers });
}

DeleteTimeTransactionApprovalRequestAttachment(
  lang: number,
  attchId: number
): Observable<ApiResponse<boolean>> {
  console.log('Service: DeleteTimeTransactionApprovalRequestAttachment called with:', { lang, attchId });
  
  // Validate parameters
  if (attchId === undefined || attchId === null || isNaN(attchId)) {
    console.error('Service: Invalid attchId provided:', attchId);
    throw new Error('Invalid attachment ID provided');
  }
  
  const url = `${this.apiUrl}/DeleteTimeTransactionApprovalRequestAttachment`;

  const headers = new HttpHeaders({
    accept: '*/*',
    lang: lang.toString(),
    attchId: attchId.toString(),
    'Content-Type': 'application/json',
  });

  console.log('Service: Sending DELETE request to:', url, 'with headers:', headers);
  return this.http.delete<ApiResponse<boolean>>(url, { headers });
}

  createTimeTransactionApprovalRequest(
    dto: TimeTransactionApprovalRequestCreateDto,
    lang: number = 1
  ): Observable<CreateTimeTransactionApprovalRequestResponse> {
    const headers = new HttpHeaders({
      'accept': '*/*',
      'Content-Type': 'application/json',
      'lang': String(lang),
    });

    // Normalize file to raw base64 (no data:...;base64, prefix)
    const normalizedDto: TimeTransactionApprovalRequestCreateDto = {
      ...dto,
      file: this.asPureBase64(dto.file),
      // optional: normalize/standardize fileType (keep as-is if you prefer)
      fileType: (dto.fileType || '').toLowerCase(),
    };

    const body: CreateTimeTransactionApprovalRequestPayload = {
      timeTransactionApprovalRequestCreateDto: normalizedDto,
    };

    return this.http.post<CreateTimeTransactionApprovalRequestResponse>(
      `${this.apiUrl}/CreateTimeTransactionApproval` ,
      body,
      { headers }
    );
  }

  /** Utility: strip data URL prefix, keep raw base64 only */
  private asPureBase64(input: string): string {
    if (!input) return '';
    if (input.startsWith('data:')) {
      const parts = input.split(',');
      return parts.length > 1 ? parts[1] : '';
    }
    return input;
  }

/*

  // ... add other methods as needed, e.g., for fetching
  
  attendance by depaertment 
  GetDepartmentAttendanceForAttendanceTimeChangeRequest

  ... create manual attendance
  CreateManualAttendance

  
  */
}
