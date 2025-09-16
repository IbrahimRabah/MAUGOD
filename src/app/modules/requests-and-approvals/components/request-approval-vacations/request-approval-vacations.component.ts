import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PaginationPunchTransactionsRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { AcceptApprovalRequestQuery, AttendanceAdjustment, AttendanceAdjustmentRequest, RequestApprovalVacationAttendanceAdjustmentResponse, RequestApprovalVacationTimeTransactionApprovalResponse, TimeTransactionApproval, TimeTransactionApprovalRequest } from '../../../../core/models/requestApprovalVacations';
import { RequestApprovalVacationsService } from '../../services/request-approval-vacations.service';
import { ApiResponse } from '../../../../core/models/TimtranLock';
import { AttendanceTimeService } from '../../services/attendance-time.service';
import { RoadMap } from '../../../../core/models/TimeTransactionApprovalData';

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

  roadmapNodes: any[] = [];
  isDiagramVisible = false;
  requestRoadMap: RoadMap[] = [];
  roadMapTotalRecords:number = 0;
  
  ApprovalLeavelDetails : number = 0;
  showApprovalLeavelDetails : boolean = false;

  ApprovalLeavelAttachment : number = 0;
  showApprovalLeavelAttachment : boolean = false;



  loading: boolean = false;
  TimeTransactionloading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  deletingPunchTransactionId: number | null = null;
  hijriDates: { [key: string]: string | null } = {};


  startDate: string | null=null;
  endDate: string | null=null;


  searchColumns = [
    { column: '', label: 'All Columns' }, // all columns option
    { column: 'emp_name', label: 'Attendance.RESULTS_TABLE.EMPLOYEE_HEADER' },
    { column: 'sign_date', label: 'Attendance.RESULTS_TABLE.DATE_SIGN' },
    { column: 'rec_date', label: 'Attendance.RESULTS_TABLE.RECORD_DATE' },
    { column: 'data_source_label', label: 'Attendance.RESULTS_TABLE.DATA_SOURCE' }
  ];

  selectedColumn: string = '';
  selectedColumnLabel: string = this.searchColumns[0].label;

  paginationRequest: PaginationPunchTransactionsRequest = {
    pageNumber: 1,
    pageSize: 10,
    empId: this.getStoredEmpId(),
    startDate:this.startDate,
    endDate:this.endDate,
    searchColumn: this.selectedColumn, 
    searchText:this.searchTerm 
  };

  attendanceAdjustmentRequest: AttendanceAdjustmentRequest = {
    empId: this.getStoredEmpId(),
    sDate: this.formatDate(this.getDateMonthsAgo(10)),
    eDate: this.formatDate(new Date()),
    pageNumber: 1,
    pageSize: 10
  }

  TimeTransactionApprovalRequest: TimeTransactionApprovalRequest = {
    empId: this.getStoredEmpId(),
    sDate: this.formatDate(this.getDateMonthsAgo(10)),
    eDate: this.formatDate(new Date()),
    pageNumber: 1,
    pageSize: 10,
    searchColumn: null,
    searchText: null
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
    private attendanceTimeService: AttendanceTimeService,
    private translate: TranslateService
  ) {
    
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    this.startDate = formattedDate;
    this.endDate = formattedDate;

    // Initialize paginationRequest here
    this.paginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      empId: this.getStoredEmpId(),
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.attendanceAdjustmentRequest ={
      empId: this.getStoredEmpId(),
      sDate: this.formatDate(this.getDateMonthsAgo(10)),
      eDate: this.formatDate(new Date()),
      pageNumber: 1,
      pageSize: 10
    }

    this.TimeTransactionApprovalRequest = {
      empId: this.getStoredEmpId(),
      sDate: this.formatDate(this.getDateMonthsAgo(10)),
      eDate: this.formatDate(new Date()),
      pageNumber: 1,
      pageSize: 10,
      searchColumn: null,
      searchText: null
    }

    
    this.hijriDates['TimeTransactionStartDate'] = this.toObservedHijri(this.TimeTransactionApprovalRequest.sDate);
    this.hijriDates['TimeTransactionEndDate'] = this.toObservedHijri(this.TimeTransactionApprovalRequest.eDate);

    this.hijriDates['AttendanceStartDate'] = this.toObservedHijri(this.attendanceAdjustmentRequest.sDate);
    this.hijriDates['AttendanceEndDate'] = this.toObservedHijri(this.attendanceAdjustmentRequest.sDate);


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

  selectColumn(col: any) {
    this.selectedColumn = col.column;
    this.selectedColumnLabel = col.label;
  }

 onDateChange(event: Event, controlName: string) {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (value) {
    this.hijriDates[controlName] = this.toObservedHijri(value);
  } else {
    this.hijriDates[controlName] = '';
  }

  this.paginationRequest.startDate = this.startDate;
  this.paginationRequest.endDate = this.endDate;
  
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
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.paginationRequest.pageSize);
  }

  get currentPageStart(): number {
    return (this.currentPage - 1) * this.paginationRequest.pageSize + 1;
  }

  get currentPageEnd(): number {
    const end = this.currentPage * this.paginationRequest.pageSize;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.TimeTransactionApprovalRecords();
      this.attendanceAdjustmentRecords();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.TimeTransactionApprovalRecords();
    this.attendanceAdjustmentRecords();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.paginationRequest.searchColumn=this.selectedColumn;
    this.paginationRequest.searchText=this.searchTerm;
    this.TimeTransactionApprovalRecords();
    this.attendanceAdjustmentRecords();
  }




  TimeTransactionApprovalRecords() {
    if((this.TimeTransactionApprovalRequest.sDate && !this.TimeTransactionApprovalRequest.eDate) ||
       (!this.TimeTransactionApprovalRequest.sDate && this.TimeTransactionApprovalRequest.eDate))
    {
      return;
    }

    this.TimeTransactionloading = true;
    this.TimeTransactionApprovalRequest.empId = 0;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    this.requestApprovalVacationsService.getTimeTransactionApprovalRequests(this.TimeTransactionApprovalRequest, this.langService.getLangValue()).subscribe({
      next: (response: RequestApprovalVacationTimeTransactionApprovalResponse) => {
         if (response.isSuccess) {
        this.timeTransactionApprovals = response.data.approvalLeaveandAssignments;
        this.totalRecords = response.data.totalCount;
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
        this.totalRecords = response.data.totalCount;
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
    const note = this.acceptHandleApprovalRequestnotes[recId] || '';
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
    this.roadmapNodes = [
  { key: 'level1', name: 'المستوى الاول' },
  { key: 213, name: 'مصعب عمر عبدالله مصعب (213)', parent: 'level1' },
  { key: 'level2', name: 'المستوى الثاني', parent: 'level1' },
  { key: 215, name: 'مالك عبدالله مصعب عبدالله (215)', parent: 'level2' },
  { key: 'end', name: 'النهاية', parent: 'level2' }
];

this.isDiagramVisible = true;

    
  }


  onCloseTimtranRequestGraphModal() {
    this.isDiagramVisible = false;
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







 loadRequestRoadMap(requestId : number) {
    
    this.attendanceTimeService.getHandleApprovalRoadmap(
      this.langService.getLangValue(),
      requestId,
      1,
      1000
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.requestRoadMap = response.data.roadmaps;
          this.roadMapTotalRecords = response.data.totalCount;
        } else {
        }
      },
      error: (error) => {
        console.error('Error loading request road map:', error);
      }
    });
  }




}
