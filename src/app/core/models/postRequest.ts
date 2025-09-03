export interface GetPostRequestsPayload {
  empId: number;
  pageNumber: number;
  pageSize: number;
  sDate?: string;
  eDate?: string;
  searchColumn?: string;
  searchText?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: T;
}

export interface PostRequestsData {
  postRequests: PostRequest[];
  totalCount: number;
}

export interface PostRequest {
  reqId: number;
  empId: number;
  empName: string;
  requestByEmpId: number;
  requestByEmpName: string;
  stsId: string;
  stsName: string;
  part: number;
  partName: string;
  reqStsId: number;
  reqStsName: string;
  sDate: string; // "YYYY-MM-DD"
  eDate: string; // "YYYY-MM-DD"
  hsDate: string; // may be empty
  heDate: string; // may be empty
  note: string;
}

export interface CreatePostRequestBody {
  postRequestCreateDto: {
    empId: number;
    reqByEmpId: number;
    statusId: string;
    partId: number;
    sDate: string;     // "YYYY-MM-DD"
    eDate: string;     // "YYYY-MM-DD"
    note: string;
    file: string;
    fileType: string;
    filePath: string;
    noteAttach: string;
  };
}

// New models
export interface GetPartsDropdownListPayload {
  empId: number;
}

export interface DropdownItemForPostRequest {
  label: string;
  value: string; // API returns "0" as a string
}

export interface dropdownResponseData {
  dropdownListForPostRequest: DropdownItemForPostRequest[];
}
export interface GetEmployeesDropdownListPayload {
  apexEmpId: number;
}

// New models
export interface GetRequestTransactionsParams {
  reqId: number;
  pageNumber: number;
  pageSize: number;
}

export interface RequestTransactionDetails {
  rec_ID: number;
  req_ID: number;
  curlLevel: number;
  flag: number;
  flagName: string;
  updatedByEmpId: number;
  updatedByEmpName: string;
  replyDate: string; // "YYYY-MM-DD"
  note: string;
}

export interface RequestTransactionsDetailsData {
  requestTransactionsForPostRequestDetails: RequestTransactionDetails[];
  totalCount: number;
}

// New models
export interface GetRequestRoadMapParams {
  reqId: number;
  pageNumber: number;
  pageSize: number;
}

export interface RequestRoadMapDetail {
  recId: number;
  curl_Level: number;
  curLevelName: string;
  mgrId: number;
  mgrName: string;
}

export interface RequestRoadMapDetailsData {
  requestRoadMapForPostRequestDetails: RequestRoadMapDetail[];
  totalCount: number;
}

// New models
export interface UploadPostRequestAttachmentBody {
  uploadPostRequestAttachmentDto: {
    reqType: number;
    reqId: number;
    file: string;     // base64 encoded string
    fileType: string; // e.g. "pdf", "jpg", "png"
    filePath: string; // optional: server path if required
    note: string;
  };
}
// New models
export interface GetPostRequestAttachmentsParams {
  reqId: number;
  pageNumber: number;
  pageSize: number;
}

export interface PostRequestAttachment {
  attchs_ID: number;
  req_ID: number;
  m_File: string; // base64
  m_File_Size: number;
  m_File_Type: string;
  m_File_Path: string;
  note: string;
  seq: number;
  del: string;
}

export interface PostRequestAttachmentsData {
  postRequestAttachments: PostRequestAttachment[];
  totalCount: number;
}
export interface DeletePostRequestAttachmentParams {
  attachId: number;
}
export interface DeletePostRequestParams {
  requestId: number;
}