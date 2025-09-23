import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';
import { AttendanceTimeService } from '../../services/attendance-time.service';
import { 
  RequestTransactionForAttendanceTimeChangeRequestDetail,
  RequestRoadMapForAttendanceTimeChangeRequestDetail 
} from '../../../../core/models/TimeTransactionApprovalData';
import { PostRequestService } from '../../services/post-request.service';
import { RequestRoadMapDetail, RequestTransactionDetails } from '../../../../core/models/postRequest';
import { TimtranApprovalRoadmapVacationsDetail, TimtranApprovalTransactionsVacationsDetail } from '../../../../core/models/requestApprovalVacations';
import { RequestApprovalVacationsService } from '../../services/request-approval-vacations.service';

@Component({
  selector: 'app-request-details-modal',
  templateUrl: './request-details-modal.component.html',
  styleUrl: './request-details-modal.component.css'
})
export class RequestDetailsModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() showModal = false;
  @Input() requestId: number = 0;
  @Input() pageId: string = '';
  @Output() closeModal = new EventEmitter<void>();

  // Data arrays for attendanceTimeChangeRequest
  requestTransactions: (
    RequestTransactionForAttendanceTimeChangeRequestDetail |
    RequestTransactionDetails |
    TimtranApprovalTransactionsVacationsDetail
  )[] = [];
  requestRoadMap: RequestRoadMapForAttendanceTimeChangeRequestDetail[] | RequestRoadMapDetail[] | TimtranApprovalRoadmapVacationsDetail[]  = [];
  filteredRoadMap: RequestRoadMapForAttendanceTimeChangeRequestDetail[] | RequestRoadMapDetail[] | TimtranApprovalRoadmapVacationsDetail[]  = [];

  // Loading states
  loadingTransactions = false;
  loadingRoadMap = false;

  // Pagination
  transactionPage = 1;
  transactionPageSize = 10;
  transactionTotalRecords = 0;

  roadMapPage = 1;
  roadMapPageSize = 10;
  roadMapTotalRecords = 0;

  // Search form
  roadMapSearchForm!: FormGroup;
  private searchSubscription: Subscription = new Subscription();
  public currentLang = 2;

  constructor(
    private attendanceTimeService: AttendanceTimeService,
    private postRequestService: PostRequestService,
    private requestApprovalVacationsService: RequestApprovalVacationsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.setupSearch();
    this.currentLang = this.langService.getLangValue();
    
    if (this.showModal && this.requestId) {
      this.loadRequestDetails();
    }
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && changes['showModal'].currentValue && this.requestId) {
      this.loadRequestDetails();
    }
  }

  private initializeForms() {
    this.roadMapSearchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  private setupSearch() {
    this.searchSubscription = this.roadMapSearchForm.get('searchTerm')!.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyRoadMapSearch(this.pageId);
      });
  }

  private applyRoadMapSearch(pageId:string) {
    const searchTerm = this.roadMapSearchForm.get('searchTerm')?.value?.toLowerCase() || '';
    
    if (!searchTerm) {
          this.filteredRoadMap = [...this.requestRoadMap];
    } else {
        this.filteredRoadMap = this.requestRoadMap.filter(item =>
          item.curLevelName.toLowerCase().includes(searchTerm) ||
          item.mgrName.toLowerCase().includes(searchTerm) ||
          item.curl_Level.toString().includes(searchTerm)
        );
      }
    }

  clearSearch() {
    this.roadMapSearchForm.get('searchTerm')?.setValue('');
  }

  private loadRequestDetails() {
    this.loadRequestTransactions();
    this.loadRequestRoadMap();
  }

  private loadRequestTransactions() {
    console.log("page id : ", this.pageId);
    this.loadingTransactions = true;

    if(this.pageId === 'postRequest')
    {
      const params = {
      reqId: this.requestId,
      pageNumber: this.transactionPage,
      pageSize: this.transactionPageSize
      };

      this.postRequestService.getRequestTransactionsForPostRequestDetailsByReqId(params, this.currentLang)
        .subscribe({
          next: (response) => {
            if (response.isSuccess) {
            this.requestTransactions = response.data.requestTransactionsForPostRequestDetails;
            this.transactionTotalRecords = response.data.totalCount;
          } else {
            this.showErrorMessage(response.message);
          }
          this.loadingTransactions = false;
        },
          error: (error) => {
            console.error('Error loading request transactions:', error);
            this.showErrorMessage('Error loading request transactions');
          }
        });
    }
    
    else if(this.pageId === 'attendanceTimeChangeRequest')
    {
        this.attendanceTimeService.GetRequestTransactionsForAttendanceTimeChangeRequestDetailsByReqId(
        this.currentLang,
        this.requestId,
        this.transactionPage,
        this.transactionPageSize
      ).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.requestTransactions = response.data.requestTransactionsForAttendanceTimeChangeRequestDetails;
            this.transactionTotalRecords = response.data.totalCount;
          } else {
            this.showErrorMessage(response.message);
          }
          this.loadingTransactions = false;
        },
        error: (error) => {
          console.error('Error loading request transactions:', error);
          this.showErrorMessage('REQUEST_DETAILS.LOAD_TRANSACTIONS_ERROR');
          this.loadingTransactions = false;
        }
      });
    }

    else if(this.pageId === 'RequestApprovalVacationsForTimtranApproval')
    {
      this.requestApprovalVacationsService.GetTimtranApprovalTransactionsForRequestVacationsDetailsByReqId(
        this.currentLang,
        this.requestId,
        this.transactionPage,
        this.transactionPageSize
      ).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.requestTransactions = response.data.transactions;
            this.transactionTotalRecords = response.data.totalCount;
          } else {
            this.showErrorMessage(response.message);
          }
          this.loadingTransactions = false;
        },
        error: (error) => {
          console.error('Error loading request transactions:', error);
          this.showErrorMessage('REQUEST_DETAILS.LOAD_TRANSACTIONS_ERROR');
          this.loadingTransactions = false;
        }
      });
    }
  }

  private loadRequestRoadMap() {
    console.log("page id : ", this.pageId);
    this.loadingRoadMap = true;
    
    if(this.pageId === 'postRequest')
    {
      const params = {
      reqId: this.requestId,
      pageNumber: this.roadMapPage,
      pageSize: this.roadMapPageSize
      }; 

      this.postRequestService.getRequestRoadMapForPostRequestDetailsByReqId(params, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.requestRoadMap = response.data.requestRoadMapForPostRequestDetails;
            this.roadMapTotalRecords = response.data.totalCount;
            this.applyRoadMapSearch(this.pageId);
          } else {
            this.showErrorMessage(response.message);
          }
          this.loadingRoadMap = false;
        },
        error: (error) => {
          console.error('Error loading request road map:', error);
          this.showErrorMessage('Error loading request road map');
        }
      });
    }

    else if(this.pageId === 'attendanceTimeChangeRequest')
    {
        this.attendanceTimeService.GetRequestRoadMapForAttendanceTimeChangeRequestDetailsByReqId(
        this.currentLang,
        this.requestId,
        this.roadMapPage,
        this.roadMapPageSize
      ).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.requestRoadMap = response.data.requestRoadMapForAttendanceTimeChangeRequestDetails;
            this.roadMapTotalRecords = response.data.totalCount;
            this.applyRoadMapSearch(this.pageId);
          } else {
            this.showErrorMessage(response.message);
          }
          this.loadingRoadMap = false;
        },
        error: (error) => {
          console.error('Error loading request road map:', error);
          this.showErrorMessage('REQUEST_DETAILS.LOAD_ROADMAP_ERROR');
          this.loadingRoadMap = false;
        }
      });
    }
    else if(this.pageId === 'RequestApprovalVacationsForTimtranApproval')
    {
      this.requestApprovalVacationsService.GetTimtranApprovalRoadmapForRequestVacationsDetailsByReqId(
        this.currentLang,
        this.requestId,
        this.roadMapPage,
        this.roadMapPageSize
      ).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.requestRoadMap = response.data.roadmaps;
            this.roadMapTotalRecords = response.data.totalCount;
            this.applyRoadMapSearch(this.pageId);
          } else {
            this.showErrorMessage(response.message);
          }
          this.loadingRoadMap = false;
        },
        error: (error) => {
          console.error('Error loading request road map:', error);
          this.showErrorMessage('REQUEST_DETAILS.LOAD_ROADMAP_ERROR');
          this.loadingRoadMap = false;
        }
      });
    }
  }

  // Pagination methods for transactions
  get transactionTotalPages(): number {
    return Math.ceil(this.transactionTotalRecords / this.transactionPageSize);
  }

  get canGoNextTransaction(): boolean {
    return this.transactionPage < this.transactionTotalPages;
  }

  get canGoPreviousTransaction(): boolean {
    return this.transactionPage > 1;
  }

  nextTransactionPage() {
    if (this.canGoNextTransaction) {
      this.transactionPage++;
      this.loadRequestTransactions();
    }
  }

  previousTransactionPage() {
    if (this.canGoPreviousTransaction) {
      this.transactionPage--;
      this.loadRequestTransactions();
    }
  }

  // Pagination methods for road map
  get roadMapTotalPages(): number {
    return Math.ceil(this.roadMapTotalRecords / this.roadMapPageSize);
  }

  get canGoNextRoadMap(): boolean {
    return this.roadMapPage < this.roadMapTotalPages;
  }

  get canGoPreviousRoadMap(): boolean {
    return this.roadMapPage > 1;
  }

  nextRoadMapPage() {
    if (this.canGoNextRoadMap) {
      this.roadMapPage++;
      this.loadRequestRoadMap();
    }
  }

  previousRoadMapPage() {
    if (this.canGoPreviousRoadMap) {
      this.roadMapPage--;
      this.loadRequestRoadMap();
    }
  }

  // Helper methods
  getStatusText(flag: number, flagName: string): string {
    return flagName || 'Unknown';
  }

  getStatusIcon(flag: number): string {
    switch (flag) {
      case 1: return 'fas fa-check-circle text-success';
      case 2: return 'fas fa-times-circle text-danger';
      case 0: return 'fas fa-clock text-warning';
      default: return 'fas fa-question-circle text-muted';
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  // Message helper methods
  private showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('ERROR'),
      detail: this.translateService.instant(message)
    });
  }

  // Transactions trackBy
  trackByTransactionId(
    index: number,
    item: RequestTransactionForAttendanceTimeChangeRequestDetail | RequestTransactionDetails | TimtranApprovalTransactionsVacationsDetail
  ): number {
    return (item as any).rec_ID ?? (item as any).recId ?? index;
  }

  // RoadMap trackBy
  trackByRoadMapId(
    index: number,
    item: RequestRoadMapForAttendanceTimeChangeRequestDetail | RequestRoadMapDetail | TimtranApprovalRoadmapVacationsDetail
  ): number {
    return (item as any).recId ?? (item as any).rec_ID ?? index;
  }

}
