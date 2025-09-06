import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { PaginationRequest } from '../../../../core/models/pagination';
import { RequestRouteService } from '../../services/request-route.service';
import { LanguageService } from '../../../../core/services/language.service';
import { 
  RequestApprovalRoute, 
  GetRequestApprovalRoutesRequest,
  RoadMapDetail 
} from '../../../../core/models/requestRoute';

@Component({
  selector: 'app-request-approval-route',
  templateUrl: './request-approval-route.component.html',
  styleUrl: './request-approval-route.component.css',
  providers: [MessageService, ConfirmationService]
})
export class RequestApprovalRouteComponent implements OnInit, OnDestroy {
  
  // Core component state
  approvalRoutes: RequestApprovalRoute[] = [];
  searchTerm: string = '';
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;

  
    private isInitialized = false; // Prevent double API calls on init

    searchColumns = [
      { column: '', label: 'All Columns' }, // all columns option
      { column: 'route_id', label: 'REQUEST_APPROVAL_ROUTE.route_id' },
      { column: 'EMP_NAME', label: 'REQUEST_APPROVAL_ROUTE.EMP_NAME' },
      { column: 'MGR_OF_DEPT_NAME', label: 'REQUEST_APPROVAL_ROUTE.MGR_OF_DEPT_NAME' },
      { column: 'MGR_OF_BRANCH_NAME', label: 'REQUEST_APPROVAL_ROUTE.MGR_OF_BRANCH_NAME' },
      { column: 'DEPT_NAME', label: 'REQUEST_APPROVAL_ROUTE.DEPT_NAME' },
      { column: 'BRANCH_NAME', label: 'REQUEST_APPROVAL_ROUTE.BRANCH_NAME' },
      { column: 'ROLE_NAME', label: 'REQUEST_APPROVAL_ROUTE.ROLE_NAME' },
      { column: 'FOREVERYONE_NAME', label: 'REQUEST_APPROVAL_ROUTE.FOREVERYONE_NAME' },
      { column: 'STS_NAME', label: 'REQUEST_APPROVAL_ROUTE.STS_NAME' },
      { column: 'REQLEVEL_NAME', label: 'REQUEST_APPROVAL_ROUTE.REQLEVEL_NAME' },
      { column: 'ISACTIVE_NAME', label: 'REQUEST_APPROVAL_ROUTE.ISACTIVE_NAME' },
      { column: 'note', label: 'REQUEST_APPROVAL_ROUTE.note' }
    ];
    selectedColumn: string = '';
    selectedColumnLabel: string = this.searchColumns[0].label;
  
    selectColumn(col: any) {
      this.paginationRequest.searchColumn = col.column;
      this.selectedColumnLabel = col.label;
    }
  
    paginationRequest: PaginationRequest = {
        pageNumber: 1,
        pageSize: 10,
        lang: 1,// Default to English, can be changed based on app's language settings
        searchColumn: this.selectedColumn,
        searchText: this.searchTerm
      };
    
    onSearch() {
      this.currentPage = 1;
      this.paginationRequest.pageNumber = 1;
      this.paginationRequest.searchColumn = this.selectedColumn;
      this.paginationRequest.searchText = this.searchTerm;
      this.loadApprovalRoutes();
    }
  
  
  // Modal state
  showRoadMapModal = false;
  showCreateModal = false;
  selectedRouteId = 0;
  roadMapDetails: RoadMapDetail[] = [];
  filteredRoadMapDetails: RoadMapDetail[] = [];
  roadMapTotalCount = 0;
  loadingRoadMap = false;
  
  private langSubscription: Subscription = new Subscription();
  private roadMapSearchSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic (2) - made public for template access
  
  // Reactive Forms
  roadMapSearchForm!: FormGroup;

  constructor(
    private requestRouteService: RequestRouteService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.initializeLanguage();
    this.setupRoadMapSearchSubscription();

       // Set the language for the pagination request based on the current language setting
  this.langService.currentLang$.subscribe(lang => {
    this.paginationRequest.lang = lang === 'ar' ? 2 : 1;

    // Only reload approvalRoutes if component is already initialized (not first time)
    if (this.isInitialized) {
      this.loadApprovalRoutes(); // Reload approvalRoutes when language changes
      }
    })
    
    // Wait for translations to load before loading data
    this.translateService.onLangChange.subscribe(() => {
      this.loadApprovalRoutes();
    });
    
    // Initial load
    setTimeout(() => {
      this.loadApprovalRoutes();
    }, 100);
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
    this.roadMapSearchSubscription.unsubscribe();
  }

  // Initialize reactive forms
  private initializeForms() {
    this.roadMapSearchForm = this.fb.group({
      searchText: ['']
    });
  }

  // Initialize language settings
  private initializeLanguage() {
    this.currentLang = this.langService.getLangValue();
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      // Reload data when language changes
      this.loadApprovalRoutes();
    });
  }

  // Setup road map search functionality
  private setupRoadMapSearchSubscription() {
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
    return Math.ceil(this.totalRecords / this.paginationRequest.pageSize);
  }

  get currentPageStart(): number {
    return (this.currentPage - 1) * this.paginationRequest.pageSize + 1;
  }

  get currentPageEnd(): number {
    return Math.min(this.currentPage * this.paginationRequest.pageSize, this.totalRecords);
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Core business methods
  loadApprovalRoutes() {
    this.loading = true;
    
    const request: GetRequestApprovalRoutesRequest = {
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      searchColumn: this.paginationRequest.searchColumn,
      searchText: this.paginationRequest.searchText
    };

    this.requestRouteService.getRequestApprovalRoutes(request, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.approvalRoutes = response.data.requestApprovalRoutes;
            this.totalRecords = response.data.totalCount;
          } else {
            this.showErrorMessage(response.message);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading approval routes:', error);
          this.showErrorMessage('Error loading approval routes');
          this.loading = false;
        }
      });
  }

  // Apply road map search filter
  private applyRoadMapSearch() {
    const searchText = this.roadMapSearchForm.get('searchText')?.value?.toLowerCase() || '';
    
    if (!searchText) {
      this.filteredRoadMapDetails = [...this.roadMapDetails];
    } else {
      this.filteredRoadMapDetails = this.roadMapDetails.filter(detail =>
        detail.levelName?.toLowerCase().includes(searchText) ||
        detail.details?.toLowerCase().includes(searchText)
      );
    }
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadApprovalRoutes();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadApprovalRoutes();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadApprovalRoutes();
    }
  }

  goToFirstPage() {
    this.goToPage(1);
  }

  goToLastPage() {
    this.goToPage(this.totalPages);
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadApprovalRoutes();
  }

  // Action methods
  editRoute(route: RequestApprovalRoute) {
    // TODO: Implement edit functionality
    this.showInfoMessage('Edit functionality is not yet implemented');
  }

  deleteRoute(route: RequestApprovalRoute) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this approval route?',
      header: 'Confirm Deletion',
      icon: 'fa fa-exclamation-triangle',
      accept: () => {
        this.performDelete(route);
      }
    });
  }

  private performDelete(route: RequestApprovalRoute) {
    this.requestRouteService.deleteRequestApprovalRoute(route.routeId, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccessMessage('Approval route deleted successfully');
            this.loadApprovalRoutes();
          } else {
            this.showErrorMessage(response.message || 'Error deleting approval route');
          }
        },
        error: (error) => {
          console.error('Error deleting approval route:', error);
          this.showErrorMessage(error.error.message);
        }
      });
  }

  viewDetails(route: RequestApprovalRoute) {
    this.selectedRouteId = route.routeId;
    this.showRoadMapModal = true;
    this.loadRoadMapDetails();
  }

  private loadRoadMapDetails() {
    this.loadingRoadMap = true;
    
    this.requestRouteService.getRoadMapDetailsForRequestApprovalRoute(
      this.selectedRouteId,
      1, // pageNumber
      100, // pageSize - load all details
      this.currentLang
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.roadMapDetails = response.data.roadMapDetailsForRequestApprovalRoutes;
          this.roadMapTotalCount = response.data.totalCount;
          this.applyRoadMapSearch();
        } else {
          this.showErrorMessage(response.message);
        }
        this.loadingRoadMap = false;
      },
      error: (error) => {
        console.error('Error loading road map details:', error);
        this.showErrorMessage('Error loading road map details');
        this.loadingRoadMap = false;
      }
    });
  }

  viewChart(route: RequestApprovalRoute) {
    this.showInfoMessage('Chart functionality is not yet implemented');
  }

  // Modal methods
  onCloseRoadMapModal() {
    this.showRoadMapModal = false;
    this.roadMapDetails = [];
    this.filteredRoadMapDetails = [];
    this.roadMapSearchForm.reset();
  }

  onCloseCreateModal() {
    this.showCreateModal = false;
  }

  onRouteCreated() {
    this.loadApprovalRoutes();
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  // Helper methods for displaying data
  getActiveStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getActiveStatusClass(isActive: boolean): string {
    return isActive ? 'text-success' : 'text-danger';
  }

  // Utility methods for template
  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  // TrackBy function for better performance
  trackByRouteId(index: number, item: RequestApprovalRoute): number {
    return item.routeId;
  }

  trackByRoadMapLevel(index: number, item: RoadMapDetail): number {
    return item.level;
  }

  // Message helper methods
  private showSuccessMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000
    });
  }

  private showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  private showInfoMessage(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: message,
      life: 3000
    });
  }
}
