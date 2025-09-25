// Generic API envelope
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  isSuccess: boolean;
  data: T;
}

// Data wrapper with pagination
export interface TimeTransactionApprovalData {
  timeTransactionApprovalRequests: TimeTransactionApprovalRequest[];
  totalRecords?: number;
  totalCount: number; // Added to match actual API response
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
}

// Item shape
export interface TimeTransactionApprovalRequest {
  reqId: number;
  empId: number;
  empName: string;
  requestByEmpId: number;
  requestByEmpName: string;
  signDate: string;   // e.g. "2021-06-01"
  hsDate: string;     // e.g. "1442-10-20"
  in: string;         // e.g. "09:00:00"  (access as obj.in or obj["in"])
  out: string;        // e.g. "14:00:00"
  reqSts: number;     // e.g. 1
  reqStsName: string; // e.g. "Accept"
  note: string;
  routeId: number | null;
  det: string;        // "Det"
  graph: string;      // "GRAPH"
  attch: string;      // "Attch"
  del: string;        // "Del"
}

export interface TimeTransactionApprovalRequestBody {
  empId: number;
  sDate?: string;
  eDate?: string;
  pageNumber: number;
  pageSize: number;
  searchColumn?: string;
  searchText?: string;
}
// Response wrapper
export interface RequestTransactionsForAttendanceTimeChangeRequestDetailsData {
  requestTransactionsForAttendanceTimeChangeRequestDetails: RequestTransactionForAttendanceTimeChangeRequestDetail[];
  totalCount: number;
}

// Item shape
export interface RequestTransactionForAttendanceTimeChangeRequestDetail {
  rec_ID: number;
  req_ID: number;
  empCode: string;
  empName: string;
  previous_In_Time: string;
  previous_Out_Time: string;
  requested_In_Time: string;
  requested_Out_Time: string;
  reason: string;
  curlLevel: number;
  flag: number;
  flagName: string;
  updatedByEmpId: number;
  updatedByEmpName: string;
  replyDate: string; // ISO date string, e.g. "2021-12-07"
  note: string;
}
// RoadMap response wrapper
export interface RequestRoadMapForAttendanceTimeChangeRequestDetailsData {
  requestRoadMapForAttendanceTimeChangeRequestDetails: RequestRoadMapForAttendanceTimeChangeRequestDetail[];
  totalCount: number;
}

// RoadMap item
export interface RequestRoadMapForAttendanceTimeChangeRequestDetail {
  recId: number;
  curl_Level: number;   // keeping API casing as-is
  curLevelName: string;
  mgrId: number;
  mgrName: string;
  approvalFlag: number;
  approvalFlagName: string;
  approvalDate: string;
  notes: string;
}

// Attachments response wrapper
export interface TimeTransactionApprovalRequestAttachmentsData {
  timeTransactionApprovalRequestAttachments: TimeTransactionApprovalRequestAttachment[];
  totalCount: number;
}

// Single attachment
export interface TimeTransactionApprovalRequestAttachment {
  id: number;
  req_ID?: number;
  reqId: number;
  fileName: string;
  filePath: string;
  uploadedByEmpId: number;
  uploadedByEmpName: string;
  uploadedDate: string; // e.g. "2021-12-07"
  note: string; // Note field for the attachment
  attchs_ID: number;
  m_File: string; // base64
  m_File_Size: number;
  m_File_Type: string;
  m_File_Path: string;

  seq: number;
  del: string;
}
export interface UploadTimeTransactionApprovalRequestAttachmentDto {
  ReqType: number;        // always 2
  ReqId: number;          // the recordId
  File: string;           // base64 string (no data: prefix)
  FileType: string;       // e.g. "application/pdf"
  FilePath: string;       // e.g. "test.pdf"
  Note: string | null;
}

export interface UploadTimeTransactionApprovalRequestAttachmentBody {
  UploadTimeTransactionApprovalRequestAttachmentDto: UploadTimeTransactionApprovalRequestAttachmentDto;
}

export interface TimeTransactionApprovalRequestCreateDto {
  empId: number;
  reqByEmpId: number;

  // Send as ISO string e.g. "2025-09-06T19:29:35.538Z"
  signDate: string;
  in: string;
  out: string;

  note: string;

  /** Base64 of the file (raw base64; data URL prefix is okay too — we’ll strip it) */
  file: string;

  /** File type (e.g. "application/pdf" or "pdf") */
  fileType: string;

  /** Optional server-side relative path if you use it; can be empty */
  filePath: string;

  /** Optional note for the attachment */
  noteAttach: string;
}

// Full request payload wrapper
export interface CreateTimeTransactionApprovalRequestPayload {
  timeTransactionApprovalRequestCreateDto: TimeTransactionApprovalRequestCreateDto;
}

// Response (adjust the inner type if your API returns a specific object/id)
export type CreateTimeTransactionApprovalRequestResponse =
  ApiResponse<boolean | { requestId?: number; reqId?: number }>;

export interface HandleApprovalTransactionsData {
  transactions: Transaction[];
  totalCount: number;
}
export interface Transaction {
  curlLevel: string;
  flag: number;
  updatedByEmpId: number;
  updatedBy: string;
  status: string;
  updatedByEmpName: string;
  replyDate: string; // ISO date string, e.g. "2021-12-07"
  note: string;
}

export interface HandleApprovalRoadMapData {
  roadmaps: RoadMap[];
  totalCount: number;
}

// RoadMap item
export interface RoadMap {
  curl_Level: number;
  curLevelName: string;
  mgrId: number;
  mgrName: string;
}

export interface HandleApprovalAttachmentsData {
  attachments: Attachment[];
  totalCount: number;
}

// Single attachment
export interface Attachment {
  attchId: number;
  reqId: number;
  fileLength: number;
  fileType: string;
  filePath: string;
  note: string; // Note field for the attachment
  seq: number;
  del: string;
  
}
