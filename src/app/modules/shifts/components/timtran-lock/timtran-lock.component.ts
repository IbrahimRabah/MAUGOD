import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { TimtranService } from '../../services/timtran.service';
import { LanguageService } from '../../../../core/services/language.service';
import { TimtranLock } from '../../../../core/models/TimtranLock';

@Component({
  selector: 'app-timtran-lock',
  templateUrl: './timtran-lock.component.html',
  styleUrl: './timtran-lock.component.css',
  providers: [MessageService, ConfirmationService]
})
export class TimtranLockComponent implements OnInit, OnDestroy {
  // Core component state
  timtranLocks: TimtranLock[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  showCreateModal = false;
  
  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to Arabic (2)
  
  // Reactive Forms
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  createForm!: FormGroup;
  
  // Selected items for bulk operations
  selectedItems: TimtranLock[] = [];
  selectAll = false;

  constructor(
    private timtranService: TimtranService,
    public langService: LanguageService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    // Subscribe to language changes
    this.langSubscription = this.langService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang === 'ar' ? 2 : 1;
      this.loadTimtranLocks();
    });

    // Setup search debouncing
    this.setupSearchDebouncing();
    
    // Initial load
    this.loadTimtranLocks();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  private initializeForms() {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [10]
    });

    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });

    this.createForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      totalLock: [false],
      handleApprovalReqLock: [false],
      handleApprovalReqTranLock: [false],
      timtranApprovalReqLock: [false],
      timtranApprovalReqTranLock: [false],
      daysHandleDirect: [false],
      daysHandleSync: [false],
      timtranManualChange: [false],
      note: ['']
    }, { validators: this.dateRangeValidator });
  }

  private setupSearchDebouncing() {
    this.searchSubscription = this.searchForm.get('searchTerm')!.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadTimtranLocks();
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
  loadTimtranLocks() {
    this.loading = true;
    this.timtranService.getTimtranLock(this.currentPage, this.pageSize, this.currentLang)
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.isSuccess && response.data) {
            this.timtranLocks = response.data;
            // Handle pagination information
            this.totalRecords = response.totalCount || response.data.length;
            
            // If no data and not on first page, go back to first page
            if (response.data.length === 0 && this.currentPage > 1) {
              this.currentPage = 1;
              this.loadTimtranLocks();
              return;
            }
            
            // Show message if no data available
            // if (response.data.length === 0) {
            //   this.showWarningMessage('TIMTRAN_LOCK.NO_DATA_AVAILABLE');
            // }
          } else {
            this.timtranLocks = [];
            this.totalRecords = 0;
            this.showWarningMessage(response.message || 'TIMTRAN_LOCK.NO_DATA_AVAILABLE');
          }
          this.resetSelection();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error loading timtran locks:', error);
          this.showErrorMessage('TIMTRAN_LOCK.ERROR_OCCURRED');
          this.timtranLocks = [];
          this.totalRecords = 0;
          this.resetSelection();
        }
      });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTimtranLocks();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadTimtranLocks();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadTimtranLocks();
    }
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.loadTimtranLocks();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadTimtranLocks();
  }

  // Filter methods
  onFilter() {
    this.currentPage = 1;
    this.loadTimtranLocks();
  }

  onResetFilter() {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadTimtranLocks();
  }

  // Selection methods
  onSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedItems = [...this.timtranLocks];
    } else {
      this.selectedItems = [];
    }
  }

  onItemSelect(item: TimtranLock) {
    const index = this.selectedItems.findIndex(selected => selected.recId === item.recId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
    this.updateSelectAllState();
  }

  private updateSelectAllState() {
    this.selectAll = this.timtranLocks.length > 0 && 
                   this.selectedItems.length === this.timtranLocks.length;
  }

  private resetSelection() {
    this.selectedItems = [];
    this.selectAll = false;
  }

  // Delete methods
  deleteSelected() {
    if (this.selectedItems.length === 0) {
      this.showWarningMessage('Please select items to delete');
      return;
    }

    this.confirmationService.confirm({
      message: this.translateService.instant('TIMTRAN_LOCK.CONFIRM_DELETE_SELECTED'),
      header: this.translateService.instant('TIMTRAN_LOCK.DELETE_SELECTED'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = this.selectedItems.map(item => item.recId);
        this.performDelete(ids);
      }
    });
  }

  deleteTimtranLock(item: TimtranLock) {
    this.confirmationService.confirm({
      message: this.translateService.instant('TIMTRAN_LOCK.CONFIRM_DELETE'),
      header: this.translateService.instant('TIMTRAN_LOCK.DELETE_SELECTED'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDelete([item.recId]);
      }
    });
  }

  private performDelete(ids: number[]) {
    this.timtranService.deleteTranLocksSelected(ids, this.currentLang)
      .subscribe({
        next: (response) => {
          this.showSuccessMessage('TIMTRAN_LOCK.DELETE_SUCCESS');
          this.loadTimtranLocks();
        },
        error: (error) => {
          console.error('Error deleting timtran locks:', error);
          this.showErrorMessage('TIMTRAN_LOCK.ERROR_OCCURRED');
        }
      });
  }

  // Helper methods
  private formatDateForApi(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  private showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS') || 'Success',
      detail: this.translateService.instant(detail)
    });
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('ERROR') || 'Error',
      detail: this.translateService.instant(detail)
    });
  }

  private showWarningMessage(detail: string) {
    this.messageService.add({
      severity: 'warn',
      summary: this.translateService.instant('WARNING') || 'Warning',
      detail: this.translateService.instant(detail)
    });
  }

  // Date range validator
  private dateRangeValidator = (group: FormGroup) => {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    
    if (startDate && endDate && startDate > endDate) {
      return { dateRangeInvalid: true };
    }
    return null;
  };

  // Create modal methods
  openCreateModal() {
    this.showCreateModal = true;
    this.resetCreateForm();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetCreateForm();
  }

  private resetCreateForm() {
    this.createForm.reset({
      startDate: '',
      endDate: '',
      totalLock: false,
      handleApprovalReqLock: false,
      handleApprovalReqTranLock: false,
      timtranApprovalReqLock: false,
      timtranApprovalReqTranLock: false,
      daysHandleDirect: false,
      daysHandleSync: false,
      timtranManualChange: false,
      note: ''
    });
  }

  // Toggle handlers
  onTotalLockToggle() {
    const totalLockValue = this.createForm.get('totalLock')?.value;
    if (totalLockValue) {
      // If total lock is enabled, enable all other toggles
      this.createForm.patchValue({
        handleApprovalReqLock: true,
        handleApprovalReqTranLock: true,
        timtranApprovalReqLock: true,
        timtranApprovalReqTranLock: true,
        daysHandleDirect: true,
        daysHandleSync: true,
        timtranManualChange: true
      });
    } else {
      // If total lock is disabled, disable all other toggles
      this.createForm.patchValue({
        handleApprovalReqLock: false,
        handleApprovalReqTranLock: false,
        timtranApprovalReqLock: false,
        timtranApprovalReqTranLock: false,
        daysHandleDirect: false,
        daysHandleSync: false,
        timtranManualChange: false
      });
    }
  }

  // Check if form is valid for submission
  get isFormValid(): boolean {
    return this.createForm.valid;
  }

  // Submit create form
  submitCreate() {
    if (!this.isFormValid) {
      this.markFormGroupTouched(this.createForm);
      const invalidControls = this.getInvalidControls();
      if (invalidControls.length > 0) {
        this.showErrorMessage(`Please fix the following errors: ${invalidControls.join(', ')}`);
      }
      return;
    }

    const formValue = this.createForm.value;
    const payload = {
      sDate: this.formatDateForApi(formValue.startDate),
      eDate: this.formatDateForApi(formValue.endDate),
      totalLock: formValue.totalLock ? 1 : 0,
      handleApprovalReqLock: formValue.handleApprovalReqLock ? 1 : 0,
      handleApprovalReqTranLock: formValue.handleApprovalReqTranLock ? 1 : 0,
      timtranApprovalReqLock: formValue.timtranApprovalReqLock ? 1 : 0,
      timtranApprovalReqTranLock: formValue.timtranApprovalReqTranLock ? 1 : 0,
      daysHandleDirect: formValue.daysHandleDirect ? 1 : 0,
      daysHandleSync: formValue.daysHandleSync ? 1 : 0,
      timtranManualChange: formValue.timtranManualChange ? 1 : 0,
      rDate: new Date().toISOString(),
      note: formValue.note || '',
      lang: this.currentLang
    };

    this.timtranService.insertTimtranLockInputForm(payload, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccessMessage('TIMTRAN_LOCK.CREATE_SUCCESS');
            this.closeCreateModal();
            this.loadTimtranLocks();
          } else {
            this.showErrorMessage(response.message || 'TIMTRAN_LOCK.ERROR_OCCURRED');
          }
        },
        error: (error) => {
          console.error('Error creating timtran lock:', error);
          this.showErrorMessage('TIMTRAN_LOCK.ERROR_OCCURRED');
        }
      });
  }

  // Form validation helpers
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private getInvalidControls(): string[] {
    const invalidControls: string[] = [];
    Object.keys(this.createForm.controls).forEach(key => {
      if (this.createForm.get(key)?.invalid) {
        invalidControls.push(key);
      }
    });
    return invalidControls;
  }

  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.createForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.createForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return this.translateService.instant(`TIMTRAN_LOCK.${fieldName.toUpperCase()}_REQUIRED`);
      }
      if (field.errors['dateRangeInvalid']) {
        return this.translateService.instant('TIMTRAN_LOCK.END_DATE_BEFORE_START');
      }
    }
    return '';
  }

  // Helper method to convert number to boolean for display
  getBooleanValue(value: number): boolean {
    return value === 1;
  }
}
