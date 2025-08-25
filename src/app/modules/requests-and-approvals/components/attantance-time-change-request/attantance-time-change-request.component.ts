import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { AttendanceTimeService } from '../../services/attendance-time.service';
import { TimeTransactionApprovalRequest } from '../../../../core/models/TimeTransactionApprovalData';

@Component({
  selector: 'app-attantance-time-change-request',
  templateUrl: './attantance-time-change-request.component.html',
  styleUrl: './attantance-time-change-request.component.css',
  providers: [MessageService, ConfirmationService]
})
export class AttantanceTimeChangeRequestComponent implements OnInit, OnDestroy {
  
  // Core component state
  timeTransactionRequests: TimeTransactionApprovalRequest[] = [];
  filteredTimeTransactionRequests: TimeTransactionApprovalRequest[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Modal state
  showRequestDetailsModal = false;
  selectedRequestId = 0;
  
  // Attachments modal state
  showAttachmentsModal = false;
  selectedAttachmentRequestId = 0;
  
  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic (2) - made public for template access
  
  // Reactive Forms
  searchForm!: FormGroup;
  filterForm!: FormGroup;

  constructor(
    private attendanceTimeService: AttendanceTimeService,
    public langService: LanguageService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.initializeLanguage();
    this.setupSearchSubscription();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  // Initialize reactive forms
  private initializeForms() {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [this.pageSize]
    });

    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
  }

  // Initialize language settings
  private initializeLanguage() {
    this.currentLang = this.langService.getLangValue();
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      this.loadTimeTransactionRequests();
    });
  }

  // Setup search functionality
  private setupSearchSubscription() {
    this.searchSubscription = this.searchForm.get('searchTerm')!.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applySearch();
      });

    this.searchForm.get('pageSize')!.valueChanges.subscribe(() => {
      this.onPageSizeChange();
    });
  }

  // Pagination computed properties
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get currentPageStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get currentPageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Core business methods
  loadTimeTransactionRequests() {
    this.loading = true;
    const empId = this.authService.getEmpIdAsNumber() || 0;
    const startDate = this.filterForm.get('startDate')?.value || undefined;
    const endDate = this.filterForm.get('endDate')?.value || undefined;

    this.attendanceTimeService.GetTimeTransactionApprovalRequests(
      this.currentLang,
      empId,
      this.currentPage,
      this.pageSize,
      startDate,
      endDate
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.timeTransactionRequests = response.data.timeTransactionApprovalRequests;
          // Handle pagination information from API response if available
          this.totalRecords = response.data.totalRecords || this.timeTransactionRequests.length;
          this.applySearch();
        } else {
          this.showErrorMessage(response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading time transaction requests:', error);
        this.showErrorMessage('ATTENDANCE_TIME_CHANGE.LOAD_ERROR');
        this.loading = false;
      }
    });
  }

  // Apply search filter to the data
  private applySearch() {
    const searchTerm = this.searchForm.get('searchTerm')?.value?.toLowerCase() || '';
    
    if (!searchTerm) {
      this.filteredTimeTransactionRequests = [...this.timeTransactionRequests];
    } else {
      this.filteredTimeTransactionRequests = this.timeTransactionRequests.filter(request =>
        request.empName.toLowerCase().includes(searchTerm) ||
        request.requestByEmpName.toLowerCase().includes(searchTerm) ||
        request.reqStsName.toLowerCase().includes(searchTerm) ||
        request.note.toLowerCase().includes(searchTerm) ||
        request.reqId.toString().includes(searchTerm)
      );
    }
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTimeTransactionRequests();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadTimeTransactionRequests();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadTimeTransactionRequests();
    }
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.loadTimeTransactionRequests();
  }

  onSearch() {
    this.applySearch();
  }

  // Filter methods
  applyFilter() {
    this.currentPage = 1;
    this.loadTimeTransactionRequests();
  }

  resetFilter() {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadTimeTransactionRequests();
  }

  deleteTimeTransactionRequest(item: TimeTransactionApprovalRequest) {
    this.confirmationService.confirm({
      message: this.translateService.instant('ATTENDANCE_TIME_CHANGE.DELETE_SINGLE_CONFIRMATION', { empName: item.empName }),
      header: this.translateService.instant('ATTENDANCE_TIME_CHANGE.DELETE_CONFIRMATION_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateService.instant('COMMON.YES'),
      rejectLabel: this.translateService.instant('COMMON.NO'),
      accept: () => {
        this.attendanceTimeService.DeleteTimeTransactionApprovalRequest(this.currentLang, item.reqId).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.showSuccessMessage('ATTENDANCE_TIME_CHANGE.DELETE_SUCCESS');
              this.loadTimeTransactionRequests();
            } else {
              this.showErrorMessage(response.message);
            }
          },
          error: (error) => {
            this.showErrorMessage(error?.error?.message || 'ATTENDANCE_TIME_CHANGE.DELETE_ERROR');
          }
        });
      }
    });
  }

  // Check if item can be deleted or selected
  canDeleteOrSelect(item: TimeTransactionApprovalRequest): boolean {
    // Add your business logic here
    return true; // For now, allow all items to be deleted/selected
  }

  // Helper methods for displaying request status
  getStatusDisplayText(statusCode: number, statusName: string): string {
    return statusName || 'Unknown';
  }

  getStatusIcon(statusCode: number): string {
    switch (statusCode) {
      case 1: return 'pi pi-check-circle text-success';
      case 2: return 'pi pi-times-circle text-danger';
      case 0: return 'pi pi-clock text-warning';
      default: return 'pi pi-question-circle text-muted';
    }
  }

  // TrackBy function for better performance
  trackByRequestId(index: number, item: TimeTransactionApprovalRequest): number {
    return item.reqId;
  }

  // Action button methods
  viewDetails(item: TimeTransactionApprovalRequest) {
    this.selectedRequestId = item.reqId;
    this.showRequestDetailsModal = true;
  }

  onCloseModal() {
    this.showRequestDetailsModal = false;
    this.selectedRequestId = 0;
  }

  viewGraph(item: TimeTransactionApprovalRequest) {
    // Implement graph view logic
    console.log('View graph for:', item);
    this.showInfoMessage('ATTENDANCE_TIME_CHANGE.GRAPH_NOT_IMPLEMENTED');
  }

  viewAttachments(item: TimeTransactionApprovalRequest) {
    this.selectedAttachmentRequestId = item.reqId;
    this.showAttachmentsModal = true;
  }

  onCloseAttachmentsModal() {
    this.showAttachmentsModal = false;
    this.selectedAttachmentRequestId = 0;
  }

  // Placeholder action methods
  createRequest() {
    this.showInfoMessage('ATTENDANCE_TIME_CHANGE.CREATE_NOT_IMPLEMENTED');
  }

  manualAttendance() {
    this.showInfoMessage('ATTENDANCE_TIME_CHANGE.MANUAL_ATTENDANCE_NOT_IMPLEMENTED');
  }

  attendanceByDepartment() {
    this.showInfoMessage('ATTENDANCE_TIME_CHANGE.DEPARTMENT_ATTENDANCE_NOT_IMPLEMENTED');
  }

  // Message helper methods
  private showSuccessMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: this.translateService.instant(message)
    });
  }

  private showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('ERROR'),
      detail: this.translateService.instant(message)
    });
  }

  private showWarningMessage(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: this.translateService.instant('WARNING'),
      detail: this.translateService.instant(message)
    });
  }

  private showInfoMessage(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('INFO'),
      detail: this.translateService.instant(message)
    });
  }
}
