import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { RoadMap, Transaction } from '../../../../core/models/TimeTransactionApprovalData';
import { LanguageService } from '../../../../core/services/language.service';
import { AttendanceTimeService } from '../../services/attendance-time.service';

@Component({
  selector: 'app-approval-leave-details-modal',
  templateUrl: './approval-leave-details-modal.component.html',
  styleUrl: './approval-leave-details-modal.component.css'
})
export class ApprovalLeaveDetailsModalComponent implements OnInit, OnDestroy, OnChanges{
 @Input() showModal = false;
  @Input() requestId: number = 0;
  @Output() closeModal = new EventEmitter<void>();

  // Data arrays
  requestTransactions: Transaction[] = [];
  requestRoadMap: RoadMap[] = [];
  filteredRoadMap: RoadMap[] = [];

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
        this.applyRoadMapSearch();
      });
  }

  private applyRoadMapSearch() {
    const searchTerm = this.roadMapSearchForm.get('searchTerm')?.value?.toLowerCase() || '';
    
    if (!searchTerm) {
      this.filteredRoadMap = [...this.requestRoadMap];
    } else {
      this.filteredRoadMap = this.requestRoadMap.filter(item =>
        item.levelName.toLowerCase().includes(searchTerm) ||
        item.mgrName.toLowerCase().includes(searchTerm) ||
        item.curLevel.toString().includes(searchTerm)
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
    this.loadingTransactions = true;
    
    this.attendanceTimeService.getHandleApprovalTransactions(
      this.currentLang,
      this.requestId,
      this.transactionPage,
      this.transactionPageSize
    ).subscribe({
      next: (response) => {
        console.log(response)
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

  private loadRequestRoadMap() {
    this.loadingRoadMap = true;
    
    this.attendanceTimeService.getHandleApprovalRoadmap(
      this.currentLang,
      this.requestId,
      this.roadMapPage,
      this.roadMapPageSize
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.requestRoadMap = response.data.roadmaps;
          this.roadMapTotalRecords = response.data.totalCount;
          this.applyRoadMapSearch();
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
}
