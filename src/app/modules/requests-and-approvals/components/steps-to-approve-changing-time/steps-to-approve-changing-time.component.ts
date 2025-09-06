import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import { StepsService } from '../../services/steps.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { 
  GetTimeTransactionApprovals, 
  GetTimeTransactionApprovalsResponse, 
  TimeTransactionApproval,
  requestRoadMapDetail 
} from '../../../../core/models/steps';

@Component({
  selector: 'app-steps-to-approve-changing-time',
  templateUrl: './steps-to-approve-changing-time.component.html',
  styleUrl: './steps-to-approve-changing-time.component.css',
  providers: [MessageService, ConfirmationService]
})
export class StepsToApproveChangingTimeComponent implements OnInit, OnDestroy {
  
  // Core component state
  timeTransactionApprovals: TimeTransactionApproval[] = [];
  filteredApprovals: TimeTransactionApproval[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Modal state
  showDetailsModal = false;
  showCreateModal = false;
  selectedRouteId = 0;
  roadMapDetails: requestRoadMapDetail[] = [];
  filteredRoadMapDetails: requestRoadMapDetail[] = [];
  roadMapTotalCount = 0;
  loadingRoadMap = false;
  roadMapCurrentPage = 1;
  roadMapPageSize = 10;
  
  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  private roadMapSearchSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic (2)
  
  // Reactive Forms
  searchForm!: FormGroup;
  roadMapSearchForm!: FormGroup;

  constructor(
    private stepsService: StepsService,
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
    this.loadTimeTransactionApprovals();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
    this.roadMapSearchSubscription.unsubscribe();
  }

  // Initialize reactive forms
  private initializeForms() {
    this.searchForm = this.fb.group({
      searchText: [''],
      pageSize: [this.pageSize]
    });

    this.roadMapSearchForm = this.fb.group({
      searchText: ['']
    });
  }

  // Initialize language settings
  private initializeLanguage() {
    this.currentLang = this.langService.getLangValue();
    
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      this.loadTimeTransactionApprovals();
    });
  }

  // Setup search functionality
  private setupSearchSubscription() {
    this.searchSubscription = this.searchForm.get('searchText')!.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.applySearch();
      });

    this.roadMapSearchSubscription = this.roadMapSearchForm.get('searchText')!.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.applyRoadMapSearch();
      });
  }

  // Pagination computed properties
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get currentPageStart(): number {
    return ((this.currentPage - 1) * this.pageSize) + 1;
  }

  get currentPageEnd(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Road map pagination computed properties
  get roadMapTotalPages(): number {
    return Math.ceil(this.roadMapTotalCount / this.roadMapPageSize);
  }

  // Core business methods
  loadTimeTransactionApprovals() {
    this.loading = true;
    
    const request: GetTimeTransactionApprovals = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchText: this.searchForm.get('searchText')?.value || undefined
    };

    this.stepsService.getRequestApprovalRoutes(request, this.currentLang)
      .subscribe({
        next: (response: GetTimeTransactionApprovalsResponse) => {
          if (response.isSuccess && response.data) {
            this.timeTransactionApprovals = response.data.timeTransactionApprovals || [];
            this.totalRecords = response.data.totalCount || 0;
            this.applySearch();
          } else {
            this.showErrorMessage(response.message || 'STEPS_TO_APPROVE.LOAD_ERROR');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading time transaction approvals:', error);
          this.showErrorMessage('STEPS_TO_APPROVE.LOAD_ERROR');
          this.loading = false;
        }
      });
  }

  // Apply search filter to the data
  private applySearch() {
    const searchText = this.searchForm.get('searchText')?.value?.toLowerCase() || '';
    
    if (!searchText.trim()) {
      this.filteredApprovals = [...this.timeTransactionApprovals];
    } else {
      this.filteredApprovals = this.timeTransactionApprovals.filter(item =>
        item.empName?.toLowerCase().includes(searchText) ||
        item.deptMgrName?.toLowerCase().includes(searchText) ||
        item.deptName?.toLowerCase().includes(searchText) ||
        item.branchMgrName?.toLowerCase().includes(searchText) ||
        item.branchName?.toLowerCase().includes(searchText) ||
        item.roleName?.toLowerCase().includes(searchText) ||
        item.forEveryoneName?.toLowerCase().includes(searchText) ||
        item.reqLevelName?.toLowerCase().includes(searchText) ||
        item.note?.toLowerCase().includes(searchText)
      );
    }
  }

  // Apply search filter to road map details
  private applyRoadMapSearch() {
    const searchText = this.roadMapSearchForm.get('searchText')?.value?.toLowerCase() || '';
    
    if (!searchText.trim()) {
      this.filteredRoadMapDetails = [...this.roadMapDetails];
    } else {
      this.filteredRoadMapDetails = this.roadMapDetails.filter(item =>
        item.levelName?.toLowerCase().includes(searchText) ||
        item.details?.toLowerCase().includes(searchText) ||
        item.level?.toString().includes(searchText)
      );
    }
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTimeTransactionApprovals();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToLastPage() {
    this.goToPage(this.totalPages);
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.loadTimeTransactionApprovals();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadTimeTransactionApprovals();
  }

  onRoadMapSearch() {
    this.applyRoadMapSearch();
  }

  // Action methods
  createApprovalRoute() {
    this.showCreateModal = true;
  }

  editApprovalRoute(item: TimeTransactionApproval) {
    // Set the route ID for editing and show the modal
    this.selectedRouteId = item.routeId;
    this.showCreateModal = true;
  }

  viewChart(item: TimeTransactionApproval) {
    alert(this.translateService.instant('STEPS_TO_APPROVE.NOT_IMPLEMENTED'));
  }

  viewDetails(item: TimeTransactionApproval) {
    this.selectedRouteId = item.routeId;
    this.showDetailsModal = true;
    this.loadRoadMapDetails();
  }

  deleteApprovalRoute(item: TimeTransactionApproval) {
    this.confirmationService.confirm({
      message: this.translateService.instant('STEPS_TO_APPROVE.DELETE_CONFIRMATION_MESSAGE'),
      header: this.translateService.instant('CONFIRM_DELE'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateService.instant('COMMON.YES'),
      rejectLabel: this.translateService.instant('COMMON.NO'),
      accept: () => {
        this.performDelete(item);
      }
    });
  }

  private performDelete(item: TimeTransactionApproval) {
    this.stepsService.deleteRequesrTimeTransactionApproval(item.routeId, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccessMessage('STEPS_TO_APPROVE.DELETE_SUCCESS');
            this.loadTimeTransactionApprovals();
          } else {
            this.showErrorMessage(response.message || 'STEPS_TO_APPROVE.DELETE_ERROR');
          }
        },
        error: (error) => {
          console.error('Error deleting approval route:', error.message);
          this.showErrorMessage(error.error.message);
        }
      });
  }

  // Modal methods
  loadRoadMapDetails() {
    this.loadingRoadMap = true;
    
    this.stepsService.getRequestRoadMapDetailsForRequestApprovalRoute(
      this.selectedRouteId,
      this.roadMapCurrentPage,
      this.roadMapPageSize,
      this.currentLang
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.roadMapDetails = response.data.requestRoadMapForTimeTransactionApprovalDetails || [];
          this.roadMapTotalCount = response.data.totalCount || 0;
          this.applyRoadMapSearch();
        } else {
          this.showErrorMessage(response.message || 'STEPS_TO_APPROVE.ROADMAP_LOAD_ERROR');
        }
        this.loadingRoadMap = false;
      },
      error: (error) => {
        console.error('Error loading road map details:', error);
        this.showErrorMessage('STEPS_TO_APPROVE.ROADMAP_LOAD_ERROR');
        this.loadingRoadMap = false;
      }
    });
  }

  onCloseDetailsModal() {
    this.showDetailsModal = false;
    this.selectedRouteId = 0;
    this.roadMapDetails = [];
    this.filteredRoadMapDetails = [];
    this.roadMapTotalCount = 0;
    this.roadMapCurrentPage = 1;
    this.roadMapSearchForm.get('searchText')?.setValue('');
  }

  onCloseCreateModal() {
    this.showCreateModal = false;
    this.selectedRouteId = 0; // Reset the route ID
  }

  onApprovalCreated() {
    this.showCreateModal = false;
    this.loadTimeTransactionApprovals(); // Refresh the list
  }

  // Utility methods
  canDeleteOrSelect(item: TimeTransactionApproval): boolean {
    return item.del === '1';
  }

  canEdit(item: TimeTransactionApproval): boolean {
    return item.str === '1';
  }

  getStatusDisplayText(item: TimeTransactionApproval): string {
    return item.isActiveText || (item.isActive ? 'Active' : 'Inactive');
  }

  getStatusIcon(isActive: boolean): string {
    return isActive ? 'fa fa-check-circle text-success' : 'fa fa-times-circle text-danger';
  }

  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  // TrackBy functions for better performance
  trackByRouteId(index: number, item: TimeTransactionApproval): number {
    return item.routeId;
  }

  trackByLevel(index: number, item: requestRoadMapDetail): number {
    return item.level;
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
