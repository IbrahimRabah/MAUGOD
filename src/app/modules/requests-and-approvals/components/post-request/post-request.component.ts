import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import { PostRequestService } from '../../services/post-request.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { LanguageService } from '../../../../core/services/language.service';
import { 
  PostRequest, 
  GetPostRequestsPayload, 
  DeletePostRequestParams,
  ApiResponse,
  PostRequestsData,
  PostRequestAttachment,
  PostRequestAttachmentsData,
  GetPostRequestAttachmentsParams
} from '../../../../core/models/postRequest';

@Component({
  selector: 'app-post-request',
  templateUrl: './post-request.component.html',
  styleUrl: './post-request.component.css',
  providers: [MessageService, ConfirmationService]
})
export class PostRequestComponent implements OnInit, OnDestroy {
  
  // Core component state
  postRequests: PostRequest[] = [];
  filteredPostRequests: PostRequest[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Date utilities
  maxDate = new Date();
  
  // Modal state
  showRequestDetailsModal = false;
  selectedRequestId = 0;
  
  // Attachments modal state
  showAttachmentsModal = false;
  selectedAttachmentRequestId = 0;
  postRequestAttachments: PostRequestAttachment[] = [];
  attachmentsTotalCount = 0;
  loadingAttachments = false;
  
  // Graph/Road map modal state
  showRoadMapModal = false;
  selectedRoadMapRequestId = 0;
  
  // Create modal state
  showCreateModal = false;
  
  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic (2) - made public for template access
  
  // Reactive Forms
  searchForm!: FormGroup;
  filterForm!: FormGroup;

  constructor(
    private postRequestService: PostRequestService,
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
    // this.loadPostRequests();
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
      this.loadPostRequests(); // Reload data when language changes
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
  loadPostRequests() {
    this.loading = true;
    
    const empId = this.authService.getEmpIdAsNumber();
    if (!empId) {
      this.showErrorMessage('Employee ID not found');
      this.loading = false;
      return;
    }

    const filterFormValue = this.filterForm.value;
    const searchTerm = this.searchForm.get('searchTerm')?.value || '';
    
    const payload: GetPostRequestsPayload = {
      empId: empId,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      sDate: filterFormValue.startDate || undefined,
      eDate: filterFormValue.endDate || undefined,
      searchColumn: searchTerm ? 'empName' : undefined,
      searchText: searchTerm || undefined
    };

    this.postRequestService.getPostRequests(payload, this.currentLang)
      .subscribe({
        next: (response: ApiResponse<PostRequestsData>) => {
          this.loading = false;
          if (response.isSuccess && response.data) {
            this.postRequests = response.data.postRequests || [];
            this.filteredPostRequests = [...this.postRequests]; // No local filtering needed
            this.totalRecords = response.data.totalCount || 0;
          } else {
            this.showErrorMessage(response.message || 'POST_REQUEST.LOAD_ERROR');
            this.postRequests = [];
            this.filteredPostRequests = [];
            this.totalRecords = 0;
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading post requests:', error);
          this.showErrorMessage('POST_REQUEST.LOAD_ERROR');
          this.postRequests = [];
          this.filteredPostRequests = [];
          this.totalRecords = 0;
        }
      });
  }

  // Apply search filter to the data
  private applySearch() {
    // For server-side search, reload data when search term changes
    this.currentPage = 1; // Reset to first page when searching
    this.loadPostRequests();
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPostRequests();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadPostRequests();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadPostRequests();
    }
  }

  goToFirstPage() {
    if (this.canGoPrevious) {
      this.currentPage = 1;
      this.loadPostRequests();
    }
  }

  goToLastPage() {
    if (this.canGoNext) {
      this.currentPage = this.totalPages;
      this.loadPostRequests();
    }
  }

  onPageSizeChange() {
    const newPageSize = parseInt(this.searchForm.get('pageSize')?.value, 10);
    if (newPageSize !== this.pageSize) {
      this.pageSize = newPageSize;
      this.currentPage = 1; // Reset to first page
      this.loadPostRequests();
    }
  }

  onSearch() {
    this.applySearch();
  }

  // Filter methods
  applyFilter() {
    this.currentPage = 1; // Reset to first page when applying filter
    this.loadPostRequests();
  }

  resetFilter() {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadPostRequests();
  }

  deletePostRequest(item: PostRequest) {
    this.confirmationService.confirm({
      message: this.translateService.instant('POST_REQUEST.DELETE_CONFIRMATION'),
      header: this.translateService.instant('COMMON.CONFIRM'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateService.instant('COMMON.YES'),
      rejectLabel: this.translateService.instant('COMMON.NO'),
      accept: () => {
        this.performDelete(item);
      }
    });
  }

  private performDelete(item: PostRequest) {
    const params: DeletePostRequestParams = {
      requestId: item.reqId
    };

    this.postRequestService.deletePostRequest(params, this.currentLang)
      .subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.isSuccess) {
            this.showSuccessMessage('POST_REQUEST.DELETE_SUCCESS');
            this.loadPostRequests(); // Reload the data
          } else {
            // Show the exact API error message directly
            this.messageService.add({
              severity: 'error',
              summary: this.translateService.instant('ERROR'),
              detail: response.message || 'POST_REQUEST.DELETE_ERROR'
            });
          }
        },
        error: (error) => {
          this.showErrorMessage(error.error.message || 'POST_REQUEST.DELETE_ERROR');
        }
      });
  }

  // Check if item can be deleted or selected
  canDeleteOrSelect(item: PostRequest): boolean {
    // Add your business logic here - for now, allowing all actions
    return true;
  }

  // Helper methods for displaying request status
  getStatusDisplayText(statusCode: number, statusName: string): string {
    return statusName || `Status ${statusCode}`;
  }

  getStatusIcon(statusCode: number): string {
    // Add your status icon logic here
    switch (statusCode) {
      case 1:
        return 'pi pi-check-circle text-success';
      case 2:
        return 'pi pi-clock text-warning';
      case 3:
        return 'pi pi-times-circle text-danger';
      default:
        return 'pi pi-info-circle text-info';
    }
  }

  // Utility methods for template
  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  // TrackBy function for better performance
  trackByRequestId(index: number, item: PostRequest): number {
    return item.reqId;
  }

  // Action button methods
  viewDetails(item: PostRequest) {
    this.selectedRequestId = item.reqId;
    this.showRequestDetailsModal = true;
    this.loadRequestTransactions(item.reqId);
  }

  private loadRequestTransactions(requestId: number) {
    const params = {
      reqId: requestId,
      pageNumber: 1,
      pageSize: 100
    };

    this.postRequestService.getRequestTransactionsForPostRequestDetailsByReqId(params, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            console.log('Request transactions loaded:', response.data);
            // You can store this data for display in modal
          } else {
            this.showErrorMessage('Error loading request transactions');
          }
        },
        error: (error) => {
          console.error('Error loading request transactions:', error);
          this.showErrorMessage('Error loading request transactions');
        }
      });
  }

  onCloseModal() {
    this.showRequestDetailsModal = false;
    this.selectedRequestId = 0;
  }

  viewGraph(item: PostRequest) {
    this.selectedRoadMapRequestId = item.reqId;
    this.showRoadMapModal = true;
    this.loadRequestRoadMap(item.reqId);
  }

  private loadRequestRoadMap(requestId: number) {
    const params = {
      reqId: requestId,
      pageNumber: 1,
      pageSize: 100
    };

    this.postRequestService.getRequestRoadMapForPostRequestDetailsByReqId(params, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            console.log('Request road map loaded:', response.data);
            // You can store this data for display in modal
          } else {
            this.showErrorMessage('Error loading request road map');
          }
        },
        error: (error) => {
          console.error('Error loading request road map:', error);
          this.showErrorMessage('Error loading request road map');
        }
      });
  }

  viewAttachments(item: PostRequest) {
    this.selectedAttachmentRequestId = item.reqId;
    this.showAttachmentsModal = true;
    this.loadPostRequestAttachments(item.reqId);
  }

  private loadPostRequestAttachments(requestId: number) {
    this.loadingAttachments = true;
    
    const params: GetPostRequestAttachmentsParams = {
      reqId: requestId,
      pageNumber: 1,
      pageSize: 100
    };

    this.postRequestService.getPostRequestAttachmentsByReqId(params, this.currentLang)
      .subscribe({
        next: (response: ApiResponse<PostRequestAttachmentsData>) => {
          this.loadingAttachments = false;
          if (response.isSuccess && response.data) {
            this.postRequestAttachments = response.data.postRequestAttachments;
            this.attachmentsTotalCount = response.data.totalCount;
            console.log('Post request attachments loaded:', this.postRequestAttachments);
          } else {
            this.showErrorMessage('POST_REQUEST.ERROR_LOADING_ATTACHMENTS');
            this.postRequestAttachments = [];
            this.attachmentsTotalCount = 0;
          }
        },
        error: (error) => {
          this.loadingAttachments = false;
          console.error('Error loading request attachments:', error);
          this.showErrorMessage('POST_REQUEST.ERROR_LOADING_ATTACHMENTS');
          this.postRequestAttachments = [];
          this.attachmentsTotalCount = 0;
        }
      });
  }

  onCloseAttachmentsModal() {
    this.showAttachmentsModal = false;
    this.selectedAttachmentRequestId = 0;
    this.postRequestAttachments = [];
    this.attachmentsTotalCount = 0;
    this.loadingAttachments = false;
  }

  onAttachmentUploaded() {
    // Refresh the attachments when a new one is uploaded
    if (this.selectedAttachmentRequestId > 0) {
      this.loadPostRequestAttachments(this.selectedAttachmentRequestId);
    }
  }

  onAttachmentDeleted() {
    // Refresh the attachments when one is deleted
    if (this.selectedAttachmentRequestId > 0) {
      this.loadPostRequestAttachments(this.selectedAttachmentRequestId);
    }
  }

  onCloseRoadMapModal() {
    this.showRoadMapModal = false;
    this.selectedRoadMapRequestId = 0;
  }

  // Placeholder action methods
  createRequest() {
    this.showCreateModal = true;
  }

  // Create modal event handlers
  onCreateModalClose() {
    this.showCreateModal = false;
  }

  onRequestCreated() {
    this.showCreateModal = false;
    this.loadPostRequests(); // Refresh the list
    this.showSuccessMessage('CREATE_POST_REQUEST.SUCCESS_MESSAGE');
  }

  // Message helper methods
  private showSuccessMessage(message: string) {
    this.translateService.get(message).subscribe(translatedMessage => {
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('SUCCESS'),
        detail: translatedMessage
      });
    });
  }

  private showErrorMessage(message: string) {
    this.translateService.get(message).subscribe(translatedMessage => {
      this.messageService.add({
        severity: 'error',
        summary: this.translateService.instant('ERROR'),
        detail: translatedMessage
      });
    });
  }

  private showWarningMessage(message: string) {
    this.translateService.get(message).subscribe(translatedMessage => {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('WARNING'),
        detail: translatedMessage
      });
    });
  }

  private showInfoMessage(message: string) {
    this.translateService.get(message).subscribe(translatedMessage => {
      this.messageService.add({
        severity: 'info',
        summary: this.translateService.instant('COMMON.INFO'),
        detail: translatedMessage
      });
    });
  }
}
