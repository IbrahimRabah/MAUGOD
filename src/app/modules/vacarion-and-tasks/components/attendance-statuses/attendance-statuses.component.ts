import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';
import { AttendanceStatusService } from '../../services/attendance-status.service';
import { AttendanceStatusData, AttendanceStatusResponse, AttendanceStatusCreate, AttendanceStatusUpdate } from '../../../../core/models/attendanceStatus';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';

interface DropdownItem {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-attendance-statuses',
  templateUrl: './attendance-statuses.component.html',
  styleUrl: './attendance-statuses.component.css',
  providers: [MessageService, ConfirmationService]
})
export class AttendanceStatusesComponent implements OnInit, OnDestroy {
  
  // Core component state
  attendanceStatuses: AttendanceStatusData[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;

  WebStatuses: DropdownItem[] = [];
  AppStatuses: DropdownItem[] = [];

  private dataCache = {
    WebStatuses: false,
    AppStatuses: false
  };

  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic (2) - made public for template access
  
  // Reactive Forms
  searchForm!: FormGroup;
  filterForm!: FormGroup;

  // Create/Edit modal properties
  showCreateEditModal = false;
  isEditMode = false;
  editingRecordId?: string;
  createEditForm!: FormGroup;
  loadingFormData = false;

  // Change ID modal properties
  showChangeIdModal = false;
  changeIdForm!: FormGroup;
  currentChangeItem?: AttendanceStatusData;

searchColumns = [
  { column: '', label: 'All Columns' }, // all columns
  { column: 'sts_name', label: 'ATTENDANCE_STATUSES.STATUS_NAME' },
  { column: 'count_in_desc', label: 'ATTENDANCE_STATUSES.COUNT_IN' },
  { column: 'insert_default_in_desc', label: 'ATTENDANCE_STATUSES.INSERT_DEFAULT_IN' },
  { column: 'count_out_desc', label: 'ATTENDANCE_STATUSES.COUNT_OUT' },
  { column: 'insert_default_out_desc', label: 'ATTENDANCE_STATUSES.INSERT_DEFAULT_OUT' },
  { column: 'is_it_vaction_when_calc_salry_desc', label: 'ATTENDANCE_STATUSES.CALCULATE_AS_VACATION' },
  { column: 'is_it_paid_vaction_when_calc_salry_desc', label: 'ATTENDANCE_STATUSES.CALCULATE_AS_PAID_VACATION' },
  { column: 'is_it_absent_when_calc_salry_desc', label: 'ATTENDANCE_STATUSES.CALCULATE_AS_ABSENT' },
  { column: 'is_it_working_day_desc', label: 'ATTENDANCE_STATUSES.WORKING_DAY' },
  { column: 'created_by_desc', label: 'ATTENDANCE_STATUSES.CREATED_BY' },
  { column: 'app_calssifay_as_desc', label: 'ATTENDANCE_STATUSES.APPLICATION_CLASSIFY_AS' },
  { column: 'web_calssifay_as_desc', label: 'ATTENDANCE_STATUSES.WEB_CLASSIFY_AS' },
  { column: 'note', label: 'ATTENDANCE_STATUSES.NOTE' }
];


  selectedColumn: string = '';
  selectedColumnLabel: string = this.searchColumns[0].label;
  searchTerm: string = '';

  constructor(
    private attendanceStatusService: AttendanceStatusService,
    public langService: LanguageService,
    private messageService: MessageService,
    private dropdownlistsService: DropdownlistsService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.loadStatuses();

  }

  ngOnInit() {
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
      // Add filter controls if needed
    });

    this.createEditForm = this.fb.group({
      ar: ['', Validators.required],
      en: ['', Validators.required],
      countIn: [0, Validators.required],
      insertDefaultIn: [0, Validators.required],
      countOut: [0, Validators.required],
      insertDefaultOut: [0, Validators.required],
      isVacationWhenCalcSalary: [0],
      isPaidVacationWhenCalcSalary: [0],
      isAbsentWhenCalcSalary: [0],
      isWorkingDay: [0],
      appClassifyAs: [null, Validators.required],
      webClassifyAs: [null, Validators.required],
      note: ['']
    });

    this.changeIdForm = this.fb.group({
      oldStatusId: [{ value: '', disabled: true }],
      newStatusId: ['', Validators.required]
    });
  }

  // Initialize language settings
  private initializeLanguage() {
    this.currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang === 'ar' ? 2 : 1;
      this.loadAttendanceStatuses();
    });
  }

  // Setup search functionality
  private setupSearchSubscription() {
    this.searchSubscription = this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadAttendanceStatuses();
      }) ?? new Subscription();
  }

  selectColumn(col: any) {
    this.selectedColumn = col.column;
    this.selectedColumnLabel = col.label;
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
  loadAttendanceStatuses() {
    this.loading = true;
    
    this.attendanceStatusService.getAttendanceStatus(this.currentLang, this.pageSize, this.currentPage,this.selectedColumn,this.searchTerm)
      .subscribe({
        next: (response: AttendanceStatusResponse) => {
          this.attendanceStatuses = response.data || [];
          this.totalRecords = response.totalCount || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading attendance statuses:', error);
          this.showErrorMessage('Error loading attendance statuses');
          this.loading = false;
        }
      });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAttendanceStatuses();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadAttendanceStatuses();
    }
  }

private loadStatuses() {

    if (!this.dataCache.WebStatuses){
      this.dropdownlistsService.getGetWebStatsDropdownList(this.langService.getLangValue()).subscribe({
        next: (response) => {
          // Handle API response format { data: { statuses: [{ label, value }] } }
          const statusData = response.data;
          this.WebStatuses = Array.isArray(statusData) ? statusData : [];
          this.dataCache.WebStatuses = true;
        },
        error: (error) => {
          console.error('Error loading statuses:', error);
          this.showErrorMessage('Failed to load statuses');
        }
      });

    }

    if (!this.dataCache.AppStatuses){
      this.dropdownlistsService.getGetAppStatsDropdownList(this.langService.getLangValue()).subscribe({
        next: (response) => {
          // Handle API response format { data: { statuses: [{ label, value }] } }
          const statusData = response.data;
          this.AppStatuses = Array.isArray(statusData) ? statusData : [];
          this.dataCache.AppStatuses = true;
        },
        error: (error) => {
          console.error('Error loading statuses:', error);
          this.showErrorMessage('Failed to load statuses');
        }
      });
    }


  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadAttendanceStatuses();
    }
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.loadAttendanceStatuses();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadAttendanceStatuses();
  }

  deleteAttendanceStatus(item: AttendanceStatusData) {
    this.confirmationService.confirm({
      message: this.translateService.instant('ATTENDANCE_STATUSES.DELETE_CONFIRMATION'),
      header: this.translateService.instant('ATTENDANCE_STATUSES.DELETE_TITLE'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.attendanceStatusService.deleteAttendanceStatus(this.currentLang, item.sts_id)
          .subscribe({
            next: () => {
              this.showSuccessMessage(this.translateService.instant('ATTENDANCE_STATUSES.SUCCESS_DELETED'));
              this.loadAttendanceStatuses();
            },
            error: (error) => {
              console.error('Error deleting attendance status:', error);
              this.showErrorMessage(this.translateService.instant('ATTENDANCE_STATUSES.ERROR_DELETING'));
            }
          });
      }
    });
  }

  // Check if item can be deleted
  canDelete(item: AttendanceStatusData): boolean {
    // Add any business logic here to determine if item can be deleted
    return true;
  }

  

  getBooleanIcon(value: number): string {
    return value === 1 ? 'fas fa-check text-success' : 'fas fa-times text-danger';
  }

getAppStatusLabel(value: number): string {
  const status = this.AppStatuses.find(s => s.value === value);
  return status ? status.label : value.toString(); // fallback if not found
}

getWebStatusLabel(value: number): string {
  const status = this.WebStatuses.find(s => s.value === value);
  return status ? status.label : value.toString();
}
  // Get status name based on current language


  // Message helper methods
  private showSuccessMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: message
    });
  }

  private showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('ERROR'),
      detail: message
    });
  }

  private showWarningMessage(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: this.translateService.instant('WARNING'),
      detail: message
    });
  }

  // Create/Edit Modal Methods
  get isCreateEditFormValid(): boolean {
    return this.createEditForm.valid;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingRecordId = undefined;
    this.resetCreateEditForm();
    this.showCreateEditModal = true;

    this.createEditForm.patchValue({
      countIn: '1',
      insertDefaultIn: '0',
      countOut: '1',
      insertDefaultOut: '0',
      isWorkingDay: 1,
      appClassifyAs: 0,
      webClassifyAs: 0,
    });

console.log("test" + this.createEditForm.value)

  }

  openEditModal(record: AttendanceStatusData) {
    this.isEditMode = true;
    this.editingRecordId = record.sts_id;
    this.loadFormDataForEdit(record);
    this.showCreateEditModal = true;
  }

  closeCreateEditModal() {
    this.showCreateEditModal = false;
    this.resetCreateEditForm();
    this.isEditMode = false;
    this.editingRecordId = undefined;
    this.loadingFormData = false;
  }

  private resetCreateEditForm() {
    this.createEditForm.reset({
      ar: '',
      en: '',
      countIn: 0,
      insertDefaultIn: 0,
      countOut: 0,
      insertDefaultOut: 0,
      isVacationWhenCalcSalary: 0,
      isPaidVacationWhenCalcSalary: 0,
      isAbsentWhenCalcSalary: 0,
      isWorkingDay: 0,
      appClassifyAs: null,
      webClassifyAs: null,
      note: ''
    });
  }

  private loadFormDataForEdit(record: AttendanceStatusData) {
    this.loadingFormData = true;
    
    // Populate the form with the record data
    this.createEditForm.patchValue({
      ar: record.ar,
      en: record.en,
      countIn: record.count_in.toString(),
      insertDefaultIn: record.insert_default_in.toString(),
      countOut: record.count_out.toString(),
      insertDefaultOut: record.insert_default_out.toString(),
      isVacationWhenCalcSalary: record.is_it_vaction_when_calc_salry,
      isPaidVacationWhenCalcSalary: record.is_it_paid_vaction_when_calc_salry,
      isAbsentWhenCalcSalary: record.is_it_absent_when_calc_salry,
      isWorkingDay: record.is_it_working_day,
      appClassifyAs: record.app_calssifay_as,
      webClassifyAs: record.web_calssifay_as,
      note: record.note
    });
    
    this.loadingFormData = false;
  }

  submitCreateEdit() {
    if (!this.isCreateEditFormValid) {
      this.showWarningMessage(this.translateService.instant('ATTENDANCE_STATUSES.FORM_VALIDATION_ERROR'));
      return;
    }

    if (this.isEditMode) {
      this.submitUpdate();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate() {
    const formData = this.createEditForm.value;
    const createData: AttendanceStatusCreate = {
      ar: formData.ar,
      en: formData.en,
      countIn: formData.countIn,
      insertDefaultIn: formData.insertDefaultIn,
      countOut: formData.countOut,
      insertDefaultOut: formData.insertDefaultOut,
      isVacationWhenCalcSalary: formData.isVacationWhenCalcSalary,
      isPaidVacationWhenCalcSalary: formData.isPaidVacationWhenCalcSalary,
      isAbsentWhenCalcSalary: formData.isAbsentWhenCalcSalary,
      isAbsentMultiply: 0, // Not in form, default value
      isAbsentCountPerDay: 0, // Not in form, default value
      includeWeekends: 0, // Not in form, default value
      includeWeekendsMultiply: 0, // Not in form, default value
      includeWeekendsCountPerDay: 0, // Not in form, default value
      isWorkingDay: formData.isWorkingDay,
      appClassifyAs: formData.appClassifyAs,
      webClassifyAs: formData.webClassifyAs,
      note: formData.note || ''
    };

    this.attendanceStatusService.createAttendanceStatus(this.currentLang, createData)
      .subscribe({
        next: (response) => {
          this.showSuccessMessage(this.translateService.instant('ATTENDANCE_STATUSES.SUCCESS_CREATED'));
          this.closeCreateEditModal();
          this.loadAttendanceStatuses();
        },
        error: (error) => {
          console.error('Error creating attendance status:', error);
          this.showErrorMessage(this.translateService.instant('ATTENDANCE_STATUSES.ERROR_CREATING'));
        }
      });
  }

  private submitUpdate() {
    if (!this.editingRecordId) return;
    
    const formData = this.createEditForm.value;
    const updateData: AttendanceStatusUpdate = {
      stsId: this.editingRecordId,
      ar: formData.ar,
      en: formData.en,
      countIn: formData.countIn,
      insertDefaultIn: formData.insertDefaultIn,
      countOut: formData.countOut,
      insertDefaultOut: formData.insertDefaultOut,
      isVacationWhenCalcSalary: formData.isVacationWhenCalcSalary,
      isPaidVacationWhenCalcSalary: formData.isPaidVacationWhenCalcSalary,
      isAbsentWhenCalcSalary: formData.isAbsentWhenCalcSalary,
      isAbsentMultiply: 0, // Not in form, default value
      isAbsentCountPerDay: 0, // Not in form, default value
      includeWeekends: 0, // Not in form, default value
      includeWeekendsMultiply: 0, // Not in form, default value
      includeWeekendsCountPerDay: 0, // Not in form, default value
      isWorkingDay: formData.isWorkingDay,
      appClassifyAs: formData.appClassifyAs,
      webClassifyAs: formData.webClassifyAs,
      note: formData.note || ''
    };

    this.attendanceStatusService.updateAttendanceStatus(this.currentLang, updateData)
      .subscribe({
        next: (response) => {
          this.showSuccessMessage(this.translateService.instant('ATTENDANCE_STATUSES.SUCCESS_UPDATED'));
          this.closeCreateEditModal();
          this.loadAttendanceStatuses();
        },
        error: (error) => {
          console.error('Error updating attendance status:', error);
          this.showErrorMessage(this.translateService.instant('ATTENDANCE_STATUSES.ERROR_UPDATING'));
        }
      });
  }

  // Update the edit method to use the new modal
  editAttendanceStatus(item: AttendanceStatusData) {
    this.openEditModal(item);
  }

  changeAttendanceStatusId(item: AttendanceStatusData) {
    this.currentChangeItem = item;
    this.changeIdForm.patchValue({
      oldStatusId: item.sts_id,
      newStatusId: ''
    });
    this.showChangeIdModal = true;
  }

  // Change ID Modal Methods
  closeChangeIdModal() {
    this.showChangeIdModal = false;
    this.currentChangeItem = undefined;
    this.changeIdForm.reset();
  }

  get isChangeIdFormValid(): boolean {
    return this.changeIdForm.valid;
  }

  submitChangeId() {
    if (!this.isChangeIdFormValid) {
      this.showWarningMessage(this.translateService.instant('ATTENDANCE_STATUSES.CHANGE_ID_VALIDATION_ERROR'));
      return;
    }

    // Show not implemented message
    this.showWarningMessage(this.translateService.instant('ATTENDANCE_STATUSES.CHANGE_ID_NOT_IMPLEMENTED'));
    this.closeChangeIdModal();
  }

  // Handle toggle change for checkboxes
  onToggleChange(fieldName: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.checked ? 1 : 0;
    this.createEditForm.patchValue({ [fieldName]: value });
  }

  // Handle toggle change for custom toggle buttons
  onCustomToggleChange(fieldName: string) {
    const currentValue = this.createEditForm.get(fieldName)?.value;
    const newValue = currentValue === 1 ? 0 : 1;
    this.createEditForm.patchValue({ [fieldName]: newValue });
  }
}
