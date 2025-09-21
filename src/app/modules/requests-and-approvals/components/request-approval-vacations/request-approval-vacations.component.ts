import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PaginationPunchTransactionsRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { AcceptApprovalRequestQuery, AttendanceAdjustment, AttendanceAdjustmentRequest, RequestApprovalVacationAttendanceAdjustmentResponse, RequestApprovalVacationTimeTransactionApprovalResponse, TimeTransactionApproval, TimeTransactionApprovalRequest } from '../../../../core/models/requestApprovalVacations';
import { RequestApprovalVacationsService } from '../../services/request-approval-vacations.service';
import { ApiResponse } from '../../../../core/models/TimtranLock';

@Component({
  selector: 'app-request-approval-vacations',
  templateUrl: './request-approval-vacations.component.html',
  styleUrl: './request-approval-vacations.component.css',
  providers: [MessageService, ConfirmationService]
})
export class RequestApprovalVacationsComponent {

  attendanceAdjustments: AttendanceAdjustment[] = [];
  timeTransactionApprovals: TimeTransactionApproval[] = [];
  acceptHandleApprovalRequestnotes: { [recId: number]: string } = {};
  attendanceAdjustmentnotes: { [recId: number]: string } = {};

  acceptApprovalRequestQuery: AcceptApprovalRequestQuery = {
    ApprovalRequest: {
      TranId: 0,
      EmpId: this.getStoredEmpId(),
      Note: ''
    }
  };

  timtranRequestDetails : number = 0;
  showtimtranRequestDetails : boolean = false;
  timtranRequestAttachment : number = 0;
  showtimtranRequestAttachment : boolean = false;


  
  ApprovalLeavelDetails : number = 0;
  showApprovalLeavelDetails : boolean = false;

  ApprovalLeavelAttachment : number = 0;
  showApprovalLeavelAttachment : boolean = false;



  loading: boolean = false;
  TimeTransactionloading: boolean = false;
  totalRecordsTimTranRequest: number = 0;
  currentPageTimTranRequest: number = 1;
  totalRecordsHandleRequest: number = 0;
  currentPageHandleRequest: number = 1;
  searchTermTimTranRequest: string = '';
  searchTermHandleRequest: string = '';
  deletingPunchTransactionId: number | null = null;
  hijriDates: { [key: string]: string | null } = {};


  startDate: string | null=null;
  endDate: string | null=null;

  private isInitializedTimTranRequest = false; // Prevent double API calls on init
  private isInitializedHandleRequest = false; // Prevent double API calls on init

  searchColumnsTimTranRequest = [
    { column: '', label: 'All Columns' }, // all columns option
    { column: 'rec_id', label: 'REQUEST_APPROVAL_VACATIONS.TIMTRAN_REQUEST.REC_ID' },
    { column: 'req_id', label: 'REQUEST_APPROVAL_VACATIONS.TIMTRAN_REQUEST.REQ_ID' },
    { column: 'emp_name', label: 'REQUEST_APPROVAL_VACATIONS.TIMTRAN_REQUEST.EMP_NAME' },
    { column: 'request_by_name', label: 'REQUEST_APPROVAL_VACATIONS.TIMTRAN_REQUEST.REQUEST_BY_EMPLOYEE' },
    { column: 'sign_date', label: 'REQUEST_APPROVAL_VACATIONS.TIMTRAN_REQUEST.SIGN_DATE' },
    { column: 'in1', label: 'REQUEST_APPROVAL_VACATIONS.TIMTRAN_REQUEST.IN' },
    { column: 'out1', label: 'REQUEST_APPROVAL_VACATIONS.TIMTRAN_REQUEST.OUT' },
    { column: 'cur_level_label', label: 'REQUEST_APPROVAL_VACATIONS.TIMTRAN_REQUEST.CURENT_LEVEL' },
    { column: 'req_note', label: 'REQUEST_APPROVAL_VACATIONS.TIMTRAN_REQUEST.REQUEST_BY_NOTE' },
  ];

  searchColumnsHandleRequest = [
    { column: '', label: 'All Columns' }, // all columns option
    { column: 'req_id', label: 'REQUEST_APPROVAL_VACATIONS.HANDLE_REQUEST.REQUEST_NO' },
    { column: 'emp_label', label: 'REQUEST_APPROVAL_VACATIONS.HANDLE_REQUEST.EMP_NAME' },
    { column: 'request_by_label', label: 'REQUEST_APPROVAL_VACATIONS.HANDLE_REQUEST.REQUEST_BY_EMPLOYEE' },
    { column: 'sts_label', label: 'REQUEST_APPROVAL_VACATIONS.HANDLE_REQUEST.STATUS' },
    { column: 'part_label', label: 'REQUEST_APPROVAL_VACATIONS.HANDLE_REQUEST.PART' },
    { column: 'sdate', label: 'REQUEST_APPROVAL_VACATIONS.HANDLE_REQUEST.START_DATE' },
    { column: 'edate', label: 'REQUEST_APPROVAL_VACATIONS.HANDLE_REQUEST.END_DATE' },
    { column: 'cur_level_label', label: 'REQUEST_APPROVAL_VACATIONS.HANDLE_REQUEST.CURENT_LEVEL' },
    { column: 'req_note', label: 'REQUEST_APPROVAL_VACATIONS.HANDLE_REQUEST.REQUEST_BY_NOTE' },
  ];

  selectedColumnTimTranRequest: string = '';
  selectedColumnLabelTimTranRequest: string = this.searchColumnsTimTranRequest[0].label;

  selectedColumnHandleRequest: string = '';
  selectedColumnLabelHandleRequest: string = this.searchColumnsHandleRequest[0].label;

  paginationRequestTimTranRequest: PaginationPunchTransactionsRequest = {
    pageNumber: 1,
    pageSize: 10,
    empId: this.getStoredEmpId(),
    startDate:this.startDate,
    endDate:this.endDate,
    searchColumn: this.selectedColumnTimTranRequest, 
    searchText:this.searchTermTimTranRequest 
  };

  paginationRequestHandleRequest: PaginationPunchTransactionsRequest = {
    pageNumber: 1,
    pageSize: 10,
    empId: this.getStoredEmpId(),
    startDate:this.startDate,
    endDate:this.endDate,
    searchColumn: this.selectedColumnHandleRequest, 
    searchText:this.searchTermHandleRequest 
  };

  attendanceAdjustmentRequest: AttendanceAdjustmentRequest = {
    empId: this.getStoredEmpId(),
    sDate: this.formatDate(this.getDateMonthsAgo(10)),
    eDate: this.formatDate(new Date()),
    pageNumber: 1,
    pageSize: 10,
    searchColumn: this.paginationRequestTimTranRequest.searchColumn,
    searchText: this.paginationRequestTimTranRequest.searchText
  }

  TimeTransactionApprovalRequest: TimeTransactionApprovalRequest = {
    empId: this.getStoredEmpId(),
    sDate: this.formatDate(this.getDateMonthsAgo(10)),
    eDate: this.formatDate(new Date()),
    pageNumber: 1,
    pageSize: 10,
    searchColumn: this.paginationRequestHandleRequest.searchColumn,
    searchText: this.paginationRequestHandleRequest.searchText
  }

// helper function
private getDateMonthsAgo(months: number): Date {
  const today = new Date();
  today.setMonth(today.getMonth() - months);
  return today;
}

private formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // month is 0-based
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}



  private isInitialized = false;

  constructor(
    private requestApprovalVacationsService: RequestApprovalVacationsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private translate: TranslateService
  ) {
    
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    this.startDate = formattedDate;
    this.endDate = formattedDate;

    // Initialize paginationRequest here
    this.paginationRequestTimTranRequest = {
      pageNumber: 1,
      pageSize: 10,
      empId: this.getStoredEmpId(),
      startDate: this.startDate,
      endDate: this.endDate,
      searchColumn: this.paginationRequestTimTranRequest.searchColumn,
      searchText: this.paginationRequestTimTranRequest.searchText
    };

    this.paginationRequestHandleRequest = {
      pageNumber: 1,
      pageSize: 10,
      empId: this.getStoredEmpId(),
      startDate: this.startDate,
      endDate: this.endDate,
      searchColumn: this.paginationRequestHandleRequest.searchColumn,
      searchText: this.paginationRequestHandleRequest.searchText
    };

    this.attendanceAdjustmentRequest ={
      empId: this.getStoredEmpId(),
      sDate: this.formatDate(this.getDateMonthsAgo(10)),
      eDate: this.formatDate(new Date()),
      pageNumber: 1,
      pageSize: 10,
      searchColumn: this.selectedColumnTimTranRequest,
      searchText: this.searchTermTimTranRequest
    }

    this.TimeTransactionApprovalRequest = {
      empId: this.getStoredEmpId(),
      sDate: this.formatDate(this.getDateMonthsAgo(10)),
      eDate: this.formatDate(new Date()),
      pageNumber: 1,
      pageSize: 10,
      searchColumn: this.selectedColumnHandleRequest,
      searchText: this.searchTermHandleRequest
    }

    
    this.hijriDates['TimeTransactionStartDate'] = this.toObservedHijri(this.TimeTransactionApprovalRequest.sDate);
    this.hijriDates['TimeTransactionEndDate'] = this.toObservedHijri(this.TimeTransactionApprovalRequest.eDate);

    this.hijriDates['AttendanceStartDate'] = this.toObservedHijri(this.attendanceAdjustmentRequest.sDate);
    this.hijriDates['AttendanceEndDate'] = this.toObservedHijri(this.attendanceAdjustmentRequest.eDate);


    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      // this.paginationRequest.lang = lang === 'ar' ? 2 : 1; 

      // Only reload branches if component is already initialized (not first time)
      if (this.isInitialized) {
        this.TimeTransactionApprovalRecords(); 
        this.attendanceAdjustmentRecords();
      }
      
    });
  }

  ngOnInit() {
    this.isInitialized = true;
    this.TimeTransactionApprovalRecords();
    this.attendanceAdjustmentRecords();
  }

  selectColumnTimTranRequest(col: any) {
    this.selectedColumnTimTranRequest = col.column;
    this.paginationRequestTimTranRequest.searchColumn = col.column;
    this.selectedColumnLabelTimTranRequest = col.label;
  }

  selectColumnHandleRequest(col: any) {
    this.selectedColumnHandleRequest = col.column;
    this.paginationRequestHandleRequest.searchColumn = col.column;
    this.selectedColumnLabelHandleRequest = col.label;
  }

 onDateChange(event: Event, controlName: string) {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (value) {
    this.hijriDates[controlName] = this.toObservedHijri(value);
  } else {
    this.hijriDates[controlName] = '';
  }

  this.paginationRequestTimTranRequest.startDate = this.startDate;
  this.paginationRequestTimTranRequest.endDate = this.endDate;

  this.paginationRequestHandleRequest.startDate = this.startDate;
  this.paginationRequestHandleRequest.endDate = this.endDate;
  
  if(controlName == "TimeTransactionStartDate" || controlName == "TimeTransactionEndDate" )
  {
    this.TimeTransactionApprovalRecords();
  }
  else{
    this.attendanceAdjustmentRecords();
  }

}

toObservedHijri(date: Date | string, adjustment: number = -1): string {
  // Ensure date is a Date object
  const d: Date = date instanceof Date ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) return ''; // handle invalid date

  // Apply adjustment in days
  d.setDate(d.getDate() + adjustment);

  const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(d);

  const year = parts.find(p => p.type === 'year')?.value ?? '0000';
  const month = parts.find(p => p.type === 'month')?.value ?? '00';
  const day = parts.find(p => p.type === 'day')?.value ?? '00';

  return `${year}/${month}/${day}`;
}

  getStoredEmpId(): number  {
    const empId = localStorage.getItem('empId');
    return Number(empId);
  }

  // Custom pagination methods
  get totalPagesTimTranRequest(): number {
    return Math.ceil(this.totalRecordsTimTranRequest / this.paginationRequestTimTranRequest.pageSize);
  }

  get currentPageStartTimTranRequest(): number {
    return (this.currentPageTimTranRequest - 1) * this.paginationRequestTimTranRequest.pageSize + 1;
  }

  get currentPageEndTimTranRequest(): number {
    const end = this.currentPageTimTranRequest * this.paginationRequestTimTranRequest.pageSize;
    return end > this.totalRecordsTimTranRequest ? this.totalRecordsTimTranRequest : end;
  }

  get totalPagesHandleRequest(): number {
    return Math.ceil(this.totalRecordsHandleRequest / this.paginationRequestHandleRequest.pageSize);
  }

  get currentPageStartHandleRequest(): number {
    return (this.currentPageHandleRequest - 1) * this.paginationRequestHandleRequest.pageSize + 1;
  }

  get currentPageEndHandleRequest(): number {
    const end = this.currentPageHandleRequest * this.paginationRequestHandleRequest.pageSize;
    return end > this.totalRecordsHandleRequest ? this.totalRecordsHandleRequest : end;
  }

  goToPageTimTranRequest(page: number) {
    if (page >= 1 && page <= this.totalPagesTimTranRequest) {
      this.currentPageTimTranRequest = page;
      this.paginationRequestTimTranRequest.pageNumber = page;
      this.attendanceAdjustmentRecords();
    }
  }

  nextPageTimTranRequest() {
    if (this.currentPageTimTranRequest < this.totalPagesTimTranRequest) {
      this.paginationRequestTimTranRequest.pageNumber = this.currentPageTimTranRequest;
      this.goToPageTimTranRequest(this.currentPageTimTranRequest + 1);
    }
  }

  previousPageTimTranRequest() {
    if (this.currentPageTimTranRequest > 1) {
      this.paginationRequestTimTranRequest.pageNumber = this.currentPageTimTranRequest;
      this.goToPageTimTranRequest(this.currentPageTimTranRequest - 1);
    }
  }

  onPageSizeChangeTimTranRequest() {
    this.currentPageTimTranRequest = 1;
    this.paginationRequestTimTranRequest.pageNumber = 1;
    this.attendanceAdjustmentRecords();
  }

  goToPageHandleRequest(page: number) {
    if (page >= 1 && page <= this.totalPagesHandleRequest) {
      this.currentPageHandleRequest = page;
      this.paginationRequestHandleRequest.pageNumber = page;
      this.TimeTransactionApprovalRecords();
    }
  }

  nextPageHandleRequest() {
    if (this.currentPageTimTranRequest < this.totalPagesHandleRequest) {
      this.paginationRequestHandleRequest.pageNumber = this.currentPageHandleRequest;
      this.goToPageHandleRequest(this.currentPageHandleRequest + 1);
    }
  }

  previousPageHandleRequest() {
    if (this.currentPageHandleRequest > 1) {
      this.paginationRequestHandleRequest.pageNumber = this.currentPageHandleRequest;
      this.goToPageHandleRequest(this.currentPageHandleRequest - 1);
    }
  }

  onPageSizeChangeHandleRequest() {
    this.currentPageHandleRequest = 1;
    this.paginationRequestHandleRequest.pageNumber = 1;
    this.TimeTransactionApprovalRecords();
  }

  onSearchTimTranRequest() {
    this.currentPageTimTranRequest = 1;
    this.paginationRequestTimTranRequest.pageNumber = 1;
    this.paginationRequestTimTranRequest.searchColumn=this.selectedColumnTimTranRequest;
    this.paginationRequestTimTranRequest.searchText=this.searchTermTimTranRequest;
    this.attendanceAdjustmentRequest.searchColumn = this.selectedColumnTimTranRequest;
    this.attendanceAdjustmentRequest.searchText = this.searchTermTimTranRequest;
    this.attendanceAdjustmentRecords();
  }

   onSearchHandleRequest() {
    this.currentPageHandleRequest = 1;
    this.paginationRequestHandleRequest.pageNumber = 1;
    this.paginationRequestHandleRequest.searchColumn=this.selectedColumnHandleRequest;
    this.paginationRequestHandleRequest.searchText=this.searchTermHandleRequest;
    this.TimeTransactionApprovalRequest.searchColumn = this.selectedColumnHandleRequest;
    this.TimeTransactionApprovalRequest.searchText = this.searchTermHandleRequest;
    this.TimeTransactionApprovalRecords();
  }


  TimeTransactionApprovalRecords() {
    if((this.TimeTransactionApprovalRequest.sDate && !this.TimeTransactionApprovalRequest.eDate) ||
       (!this.TimeTransactionApprovalRequest.sDate && this.TimeTransactionApprovalRequest.eDate))
    {
      return;
    }

    this.TimeTransactionloading = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    this.requestApprovalVacationsService.getTimeTransactionApprovalRequests(this.TimeTransactionApprovalRequest, this.langService.getLangValue()).subscribe({
      next: (response: RequestApprovalVacationTimeTransactionApprovalResponse) => {
         if (response.isSuccess) {
        this.timeTransactionApprovals = response.data.approvalLeaveandAssignments;
        this.totalRecordsHandleRequest = response.data.totalCount;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: currentLang === 2
            ? 'حدث خطأ أثناء تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
            : 'An error occurred while loading data, please try again or contact support'
        });
      }
        this.TimeTransactionloading = false;
      },
      error: (error) => {
        let errorMsg = currentLang === 2
        ? 'فشل تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
        : 'Failed to load data, please try again or contact support';

      if (error.status === 404) {
        errorMsg = currentLang === 2
          ? 'لم يتم العثور على معاملات البصمة'
          : 'No punch transactions found';
      } else if (error.status === 500) {
        errorMsg = currentLang === 2
          ? 'خطأ في الخادم، يرجى الاتصال بالدعم الفني'
          : 'Server error, please contact support';
      }

      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant("ERROR"),
        detail: errorMsg
      });
        this.TimeTransactionloading = false;
      }
    });
  }

  AcceptHandleApprovalRequest(recId: number) {
    this.TimeTransactionloading = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const note = this.acceptHandleApprovalRequestnotes[recId] || '';
    this.PrepareAcceptHandelApprovalRequest(note, recId);

    console.log(this.acceptApprovalRequestQuery);
    this.requestApprovalVacationsService.acceptHandleApproval(this.acceptApprovalRequestQuery, this.langService.getLangValue()).subscribe({
      next: (response: ApiResponse<boolean>) => {
         if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant("SUCCESS"),
              detail: response.message
            });
            this.TimeTransactionApprovalRecords(); 
            this.attendanceAdjustmentRecords();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: response.message
            });
          }
        this.TimeTransactionloading = false;
      },

      error: (error) => {
        let errorMsg = currentLang === 2
        ? 'فشل تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
        : 'Failed to load data, please try again or contact support';

        if (error.status === 500) {
          errorMsg = currentLang === 2
            ? 'خطأ في الخادم، يرجى الاتصال بالدعم الفني'
            : 'Server error, please contact support';
        }

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: errorMsg
        });
        this.TimeTransactionloading = false;
      }
    });

  }

  RejectHandleApprovalRequest(recId: number) {
    this.TimeTransactionloading = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const note = this.acceptHandleApprovalRequestnotes[recId] || '';
    this.PrepareAcceptHandelApprovalRequest(note, recId);

    console.log(this.acceptApprovalRequestQuery);
    this.requestApprovalVacationsService.acceptHandleApproval(this.acceptApprovalRequestQuery, this.langService.getLangValue()).subscribe({
      next: (response: ApiResponse<boolean>) => {
         if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant("SUCCESS"),
              detail: response.message
            });
            this.TimeTransactionApprovalRecords(); 
            this.attendanceAdjustmentRecords();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: response.message
            });
          }
        this.TimeTransactionloading = false;
      },

      error: (error) => {
        let errorMsg = currentLang === 2
        ? 'فشل تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
        : 'Failed to load data, please try again or contact support';

        if (error.status === 500) {
          errorMsg = currentLang === 2
            ? 'خطأ في الخادم، يرجى الاتصال بالدعم الفني'
            : 'Server error, please contact support';
        }

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: errorMsg
        });
        this.TimeTransactionloading = false;
      }
    });

  }




  private PrepareAcceptHandelApprovalRequest(note: string, recId: number) {
    this.acceptApprovalRequestQuery.ApprovalRequest.Note = note;
    this.acceptApprovalRequestQuery.ApprovalRequest.TranId = recId;
  }

  




  attendanceAdjustmentRecords() {
    if((this.attendanceAdjustmentRequest.sDate && !this.attendanceAdjustmentRequest.eDate) ||
       (!this.attendanceAdjustmentRequest.sDate && this.attendanceAdjustmentRequest.eDate))
    {
      return;
    }

    this.loading = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    this.requestApprovalVacationsService.getApproveAttendanceAdjustmentRequests(this.attendanceAdjustmentRequest, this.langService.getLangValue()).subscribe({
      next: (response: RequestApprovalVacationAttendanceAdjustmentResponse) => {
         if (response.isSuccess) {
        this.attendanceAdjustments = response.data.approveAttendanceAdjustment;
        this.totalRecordsTimTranRequest = response.data.totalCount;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: currentLang === 2
            ? 'حدث خطأ أثناء تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
            : 'An error occurred while loading data, please try again or contact support'
        });
      }
        this.loading = false;
      },
      error: (error) => {
        let errorMsg = currentLang === 2
        ? 'فشل تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
        : 'Failed to load data, please try again or contact support';

      if (error.status === 404) {
        errorMsg = currentLang === 2
          ? 'لم يتم العثور على معاملات البصمة'
          : 'No punch transactions found';
      } else if (error.status === 500) {
        errorMsg = currentLang === 2
          ? 'خطأ في الخادم، يرجى الاتصال بالدعم الفني'
          : 'Server error, please contact support';
      }

      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant("ERROR"),
        detail: errorMsg
      });
        this.loading = false;
      }
    });
  }

  AcceptTimetranRequest(recId: number) {
    this.TimeTransactionloading = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const note = this.attendanceAdjustmentnotes[recId] || '';
    this.PrepareAcceptHandelApprovalRequest(note, recId);

    console.log(this.acceptApprovalRequestQuery);
    this.requestApprovalVacationsService.acceptTimetranRequest(this.acceptApprovalRequestQuery, this.langService.getLangValue()).subscribe({
      next: (response: ApiResponse<boolean>) => {
         if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant("SUCCESS"),
              detail: response.message
            });
            this.TimeTransactionApprovalRecords(); 
            this.attendanceAdjustmentRecords();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: response.message
            });
          }
        this.TimeTransactionloading = false;
      },

      error: (error) => {
        let errorMsg = currentLang === 2
        ? 'فشل تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
        : 'Failed to load data, please try again or contact support';

        if (error.status === 500) {
          errorMsg = currentLang === 2
            ? 'خطأ في الخادم، يرجى الاتصال بالدعم الفني'
            : 'Server error, please contact support';
        }

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: errorMsg
        });
        this.TimeTransactionloading = false;
      }
    });

  }

  RejectTimetranRequest(recId: number) {
    this.TimeTransactionloading = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const note = this.attendanceAdjustmentnotes[recId] || '';
    this.PrepareAcceptHandelApprovalRequest(note, recId);

    console.log(this.acceptApprovalRequestQuery);
    this.requestApprovalVacationsService.rejectTimetranRequest(this.acceptApprovalRequestQuery, this.langService.getLangValue()).subscribe({
      next: (response: ApiResponse<boolean>) => {
         if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant("SUCCESS"),
              detail: response.message
            });
            this.TimeTransactionApprovalRecords(); 
        this.attendanceAdjustmentRecords();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: response.message
            });
          }
        this.TimeTransactionloading = false;
      },

      error: (error) => {
        let errorMsg = currentLang === 2
        ? 'فشل تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
        : 'Failed to load data, please try again or contact support';

        if (error.status === 500) {
          errorMsg = currentLang === 2
            ? 'خطأ في الخادم، يرجى الاتصال بالدعم الفني'
            : 'Server error, please contact support';
        }

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: errorMsg
        });
        this.TimeTransactionloading = false;
      }
    });

  }




// show details section
  viewTimtranRequestDetails(item: TimeTransactionApproval) {
    this.timtranRequestDetails = item.reqId;
    this.showtimtranRequestDetails = true;
  }

  onCloseTimtranRequestModal() {
    this.showtimtranRequestDetails = false;
    this.timtranRequestDetails = 0;
  }

  viewTimtranRequestAttachments(item: TimeTransactionApproval) {
    this.timtranRequestAttachment = item.reqId;
    this.showtimtranRequestAttachment = true;
  }

  onCloseTimtranRequestAttachmentsModal() {
    this.showtimtranRequestAttachment = false;
    this.timtranRequestAttachment = 0;
  }

  ViewTimtranRequestGraph(item: TimeTransactionApproval){
    if(this.langService.getLangValue() == 1)
    {
      this.showInfoMessage('Graph functionality is not yet implemented');
    }
    else{
      this.showInfoMessage('تحت التطوير');
    }
  }


  private showInfoMessage(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: message,
      life: 3000
    });
  }



// show details section
  viewDetails(item: AttendanceAdjustment) {
    this.ApprovalLeavelDetails = item.reqId;
    this.showApprovalLeavelDetails = true;
  }

  onCloseModal() {
    this.showApprovalLeavelDetails = false;
    this.ApprovalLeavelDetails = 0;
  }

  viewAttachments(item: AttendanceAdjustment) {
    this.ApprovalLeavelAttachment = item.reqId;
    this.showApprovalLeavelAttachment = true;
  }

  onCloseAttachmentsModal() {
    this.showApprovalLeavelAttachment = false;
    this.ApprovalLeavelAttachment = 0;
  }
  ViewGraph(item: AttendanceAdjustment){
    if(this.langService.getLangValue() == 1)
    {
      this.showInfoMessage('Graph functionality is not yet implemented');
    }
    else{
      this.showInfoMessage('تحت التطوير');
    }
  }

}
