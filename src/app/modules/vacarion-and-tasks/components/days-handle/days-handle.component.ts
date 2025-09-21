import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../../core/services/language.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { DaysHandleService } from '../../services/days-handle.service';
import { DaysHandle, DaysHandleResponse, ProcessBranchesRequest, ProcessDepartmentsRequest, ProcessEmployeesRequest, ProcessRolesRequest, UpdateDayHandleRequest } from '../../../../core/models/daysHandle';

interface DropdownItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-days-handle',
  templateUrl: './days-handle.component.html',
  styleUrl: './days-handle.component.css',
  providers: [MessageService, ConfirmationService]

})

export class DaysHandleComponent {
  
  // Core component state
  daysHandle: DaysHandle[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  showCreateModal = false;
  isEditMode = false;
  currentEditingShift: DaysHandle | null = null;
  hijriDates: { [key: string]: string } = {};
  
  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to Arabic (2)
  private empId: number = 0;
  
  // Reactive Forms
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  createForm!: FormGroup;
  
  // Selected items for bulk operations
  selectedItems: DaysHandle[] = [];
  selectAll = false;
  
  // Dropdown data with caching
  employees: DropdownItem[] = [];
  departments: DropdownItem[] = [];
  branches: DropdownItem[] = [];
  roles: DropdownItem[] = [];
  status: DropdownItem[] = [];
  parts: DropdownItem[] = [];

  // Cache flags to avoid duplicate API calls
  private dataCache = {
    employees: false,
    departments: false,
    branches:false,
    roles: false,
    status: false,
    parts: false
  };
  
  // Loading states for dropdowns
  loadingEmployees = false;
  loadingDepartments = false;
  loadingBranches = false;
  loadingRoles = false;
  loadingStatus = false;
  loadingParts = false;
  
  // Assignment type options
  assignmentTypeOptions = [
    { id: 1, name: 'Employee', nameAr: 'موظف' },
    { id: 2, name: 'Department', nameAr: 'قسم' },
    { id: 3, name: 'Branch', nameAr: 'فرع' },
    { id: 4, name: 'Role', nameAr: 'دور' }
  ];
  
  // Multi-select states
  selectedTargetItems: DropdownItem[] = [];
  selectedTargetIds: number[] = [];
  targetSelectAll = false;

  searchColumns = [
    { column: 'allFields', label: 'All Columns' },

    { column: 'empName', label: 'DAYS_HANDLE.EMPLOYEE' },
    { column: 'deptName', label: 'DAYS_HANDLE.DEPARTMENT' },
    { column: 'stsName', label: 'DAYS_HANDLE.STATUS' },
    { column: 'part', label: 'DAYS_HANDLE.PART' },
    { column: 'sDate', label: 'DAYS_HANDLE.START_DATE' },
    { column: 'eDate', label: 'DAYS_HANDLE.END_DATE' },
    { column: 'daysCount', label: 'DAYS_HANDLE.DAYS_COUNT' },

    { column: 'createdBy', label: 'DAYS_HANDLE.CREATED_BY' },
    { column: 'request', label: 'DAYS_HANDLE.REQUEST' },
    { column: 'requestDate', label: 'DAYS_HANDLE.REQUEST_DATE' },
    { column: 'note', label: 'DAYS_HANDLE.NOTE' }
  ];

  selectedColumn: string = '';
  selectedColumnLabel: string = this.searchColumns[0].label;
  searchTerm: string = '';
  
  
  constructor(
    private daysHandleService: DaysHandleService,
    private authService: AuthenticationService,
    private dropdownlistsService: DropdownlistsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private translate: TranslateService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    // Get empId from authentication service
    this.empId = this.authService.getEmpIdAsNumber() || 0;
    
    // Subscribe to language changes
    this.langSubscription = this.langService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang === 'ar' ? 2 : 1;
      this.loaddaysHandle();
      this.loadTargetDataIfNeeded();
    });
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
      assignmentType:[1],
      empId: [[]],
      deptId: [[]],
      branchId: [[]],
      roleId: [[]],
      stsId: ['', Validators.required],
      part: ['', Validators.required],
      sDate: ['', Validators.required],
      eDate: ['', Validators.required],
      createdBy: [''],
      note: [1],
    }, { validators: this.dateRangeValidator });

    // Subscribe to changes in assignmentType
    this.createForm.get('assignmentType')?.valueChanges.subscribe((type: number) => {
      this.updateAssignmentValidators(type);
    });

    // set initial validators
    this.updateAssignmentValidators(this.createForm.get('assignmentType')?.value);

  }

  onDateChange(event: Event, controlName: string, loadData:boolean) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value) {
      this.hijriDates[controlName] = this.toObservedHijri(value);
    } else {
      this.hijriDates[controlName] = '';
    }
    if(loadData){
      this.loaddaysHandle();
    }else{
      this.createForm.get(controlName)?.setValue(this.hijriDates[controlName]);
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

  styleStringToObject(style?: string): { [key: string]: string } {
    if (!style) {
      return {}; 
    }

    // remove leading 'style="' and trailing '"'
    style = style.replace(/^style="/i, "").replace(/"$/, "");

    return style.split(';').reduce((acc, rule) => {
      if (rule.trim()) {
        const [key, value] = rule.split(':');
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
      }
      return acc;
    }, {} as { [key: string]: string });
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
    return this.totalRecords === 0 ? 0 : ((this.currentPage - 1) * this.pageSize) + 1;
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
  
  // Core business methods
  loaddaysHandle() {
    this.loading = true;
    
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    
    console.log(startDate + " " +endDate);

    this.daysHandleService.getDaysHandle(
      this.langService.getLangValue(),
      this.empId,
      this.pageSize,
      this.currentPage,
      this.selectedColumn,
      this.searchTerm,
      startDate ? this.formatDateForApi(startDate) : null,
      endDate ? this.formatDateForApi(endDate) : null

    ).subscribe({
      next: (response: DaysHandleResponse) => {
        if (response.isSuccess) {
          this.daysHandle = response.data || [];
          // Since the API doesn't return total count, we'll estimate it
          this.totalRecords =response.totalCount;
          this.resetSelection();
        } else {
          this.showErrorMessage(response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shifts assign:', error);
        this.showErrorMessage('Error loading shifts assign data');
        this.loading = false;
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loaddaysHandle();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loaddaysHandle();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loaddaysHandle();
    }
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.loaddaysHandle();
  }

  onSearch() {
    this.currentPage = 1;
    this.loaddaysHandle();
  }

  // Selection methods
  onSelectAll() {
    if (this.selectAll) {
      this.selectedItems = [...this.daysHandle];
      this.daysHandle.forEach(item => item.sel = true);
    } else {
      this.selectedItems = [];
      this.daysHandle.forEach(item => item.sel = false);
    }
    console.log(this.selectedItems)
  }

  onItemSelect(item: DaysHandle) {
    if (item.sel) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems = this.selectedItems.filter(selected => selected.recId !== item.recId);
    }
    this.updateSelectAllState();
  }

  private updateSelectAllState() {
    this.selectAll = this.daysHandle.length > 0 && this.selectedItems.length === this.daysHandle.length;
  }

  private resetSelection() {
    this.selectedItems = [];
    this.selectAll = false;
    this.daysHandle.forEach(item => item.sel = false);
  }

  // Delete methods
  deleteSelected() {
    if (this.selectedItems.length === 0) {
      this.showWarningMessage('Please select items to delete');
      return;
    }

    this.confirmationService.confirm({
      message: this.translate.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.DELETE_SELECTED_CONFIRMATION', { count: this.selectedItems.length }),
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = this.selectedItems.map(item => item.recId);
        this.performDelete(ids);
      }
    });
  }

  deleteDayHandle(recId: number) {
    this.daysHandleService.deleteDaysHandle(this.currentLang, recId).subscribe({
      next: (response) => {
        this.showSuccessMessage(response.message);
        this.loaddaysHandle();
      },
      error: (error) => {
        console.error('Error deleting items:', error);
        this.showErrorMessage('Error deleting items');
      }
    });
  }

  private performDelete(ids: number[]) {
    this.daysHandleService.deleteDaysHandleSelected(this.currentLang, ids).subscribe({
      next: (response) => {
        this.showSuccessMessage(response.message);
        this.loaddaysHandle();
      },
      error: (error) => {
        console.error('Error deleting items:', error);
        this.showErrorMessage('Error deleting items');
      }
    });
  }

  // Helper methods
  private formatDateForApi(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  private showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: detail,
      life: 3000
    });
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detail,
      life: 3000
    });
  }

  private showWarningMessage(detail: string) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: detail,
      life: 3000
    });
  }

  // Date range validator
  private dateRangeValidator = (group: FormGroup) => {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        return { dateRangeInvalid: true };
      }
    }
    
    return null;
  };

  // Create modal methods
  openCreateModal() {
    this.resetCreateForm();
    this.showCreateModal = true;
    this.hijriDates['hsDate'] = '';
    this.hijriDates['heDate'] = '';
    // Since Employee (ID 1) is the default selection, load employees immediately
    this.loadTargetDataIfNeeded();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.isEditMode = false;
    this.resetCreateForm();
  }

  private resetCreateForm() {
    this.createForm.reset();
    this.createForm.get('assignmentType')?.setValue(1);
    this.selectedTargetItems = [];
    this.selectedTargetIds = [];
    this.targetSelectAll = false;
  }

  // Load target data only if not already cached
  private loadTargetDataIfNeeded() {

    if (!this.dataCache.employees) {
      this.loadEmployees();
    }

    if (!this.dataCache.departments) {
      this.loadDepartments();
    }

    if (!this.dataCache.branches) {
      this.loadBranches();
    }


    if (!this.dataCache.roles) {
      this.loadRoles();
    }

    if (!this.dataCache.status) {
      this.loadstatus();
    }

    if (!this.dataCache.parts) {
      this.loadparts();
    }

  }

  // Check if form is valid for submission
  get isFormValid(): boolean {
    return this.createForm.valid;
  }

  private loadEmployees() {
    if (this.dataCache.employees) return;
    
    this.loadingEmployees = true;
    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, this.empId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.employees = response.data.employees.map((item: any) => ({
            id: item.value,
            name: item.label
          }));
          this.dataCache.employees = true;
          // Clear cache to ensure fresh data is reflected
        }
        this.loadingEmployees = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.showErrorMessage('Failed to load employees');
        this.loadingEmployees = false;
      }
    });
  }

  private loadDepartments() {
    if (this.dataCache.departments) return;
    
    this.loadingDepartments = true;
    this.dropdownlistsService.getDepartmentsDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.departments = response.data.departments.map((item: any) => ({
            id: item.value,
            name: item.label
          }));
          this.dataCache.departments = true;
        }
        this.loadingDepartments = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.showErrorMessage('Failed to load departments');
        this.loadingDepartments = false;
      }
    });
  }

  private loadBranches() {
    if (this.dataCache.branches) return;
    
    this.loadingBranches = true;
    this.dropdownlistsService.getBranchesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.branches = response.data.parentBranches.map((item: any) => ({
            id: item.value,
            name: item.label
          }));
          this.dataCache.branches = true;
        }
        this.loadingBranches = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.showErrorMessage('Failed to load branches');
        this.loadingBranches = false;
      }
    });
  }

  private loadRoles() {
    if (this.dataCache.roles) return;
    
    this.loadingRoles = true;
    this.dropdownlistsService.getEmployeeRolesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.roles = response.data.dropdownListsForRoleModuleRights.map((item: any) => ({
            id: item.value,
            name: item.label
          }));
          this.dataCache.roles = true;
        }
        this.loadingRoles = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.showErrorMessage('Failed to load roles');
        this.loadingRoles = false;
      }
    });
  }

  private loadstatus() {
    if (this.dataCache.status) return;
    
    this.loadingStatus = true;
    this.dropdownlistsService.getStatusDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.status = response.data.map((item: any) => ({
            id: item.stsId,
            name: item.label
          }));
          this.dataCache.status = true;
        }
        this.loadingStatus = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.showErrorMessage('Failed to load roles');
        this.loadingStatus = false;
      }
    });
  }

  private loadparts() {
    if (this.dataCache.parts) return;
    
    this.loadingParts = true;
    this.dropdownlistsService.getPartsDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.parts = response.data.map((item: any) => ({
            id: item.valSeq,
            name: item.label
          }));
          this.dataCache.parts = true;
        }
        this.loadingParts = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.showErrorMessage('Failed to load roles');
        this.loadingParts = false;
      }
    });
  }

  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.createForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.createForm): string {
    const field = formGroup.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['dateRangeInvalid']) {
        return 'End date must be after start date';
      }
    }
    
    return '';
  }

  editShift(dayHandle: DaysHandle) {
    this.openEditShiftModal(dayHandle);
  }

  openEditShiftModal(dayHandle: DaysHandle) {
    // this.loadDropdownDataIfNeeded();
    this.isEditMode = true;
    this.currentEditingShift = dayHandle;
    // this.showCreateShiftModal = true;
    this.populateFormForEdit(dayHandle);

  }

  private populateFormForEdit(dayHandle: DaysHandle) {
    // Reset the form first
    this.resetCreateForm();

    // Show the modal
    this.showCreateModal = true;

    const formatDate = (value: string | null) => {
      if (!value) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // fallback: use basic shift data from list
    this.createForm.patchValue({
      recId: dayHandle.recId,
      empId: dayHandle.empId,
      deptId: dayHandle.deptId,
      stsId: dayHandle.stsId,
      part: dayHandle.part,
      sDate: formatDate(dayHandle.sDate),
      eDate: formatDate(dayHandle.eDate),
      createdBy: dayHandle.createdBy,
      reqId: dayHandle.reqId,
      recDate: dayHandle.recDate,
      note: dayHandle.note,
      daysCount: dayHandle.daysCount
    });
    this.hijriDates['hsDate'] = dayHandle.hsDate;
    this.hijriDates['heDate'] = dayHandle.heDate;
  }

  private updateAssignmentValidators(type: number) {
    const empId = this.createForm.get('empId');
    const deptId = this.createForm.get('deptId');
    const branchId = this.createForm.get('branchId');
    const roleId = this.createForm.get('roleId');

    // clear all first
    empId?.clearValidators();
    deptId?.clearValidators();
    branchId?.clearValidators();
    roleId?.clearValidators();

    empId?.reset();
    deptId?.reset();
    branchId?.reset();
    roleId?.reset();
    
    // set the one required
    switch (type) {
      case 1: empId?.setValidators([Validators.required]); break;
      case 2: deptId?.setValidators([Validators.required]); break;
      case 3: branchId?.setValidators([Validators.required]); break;
      case 4: roleId?.setValidators([Validators.required]); break;
    }

    // update validity
    empId?.updateValueAndValidity();
    deptId?.updateValueAndValidity();
    branchId?.updateValueAndValidity();
    roleId?.updateValueAndValidity();
  }

  submitCreate() {
    if (this.createForm.invalid) {
      return;
    }

    if (this.isEditMode) {
      this.updateAssignment();
    } else {
      this.createAssignment();
    }

    // Close modal and refresh data after API call
    this.closeCreateModal();
    setTimeout(() => this.loaddaysHandle(), 1000);
  }

  private createAssignment(): void {
    const assignmentType = this.createForm.get('assignmentType')?.value;

    switch (assignmentType) {
      case 1: // Employee
        const empRequest: ProcessEmployeesRequest = {
          empIds: this.createForm.get('empId')?.value,
          stsId: this.createForm.get('stsId')?.value,
          part: this.createForm.get('part')?.value,
          sDate: this.createForm.get('sDate')?.value,
          eDate: this.createForm.get('eDate')?.value,
          note: this.createForm.get('note')?.value,
        };
        console.log(empRequest);
        this.daysHandleService.createEmployeeAssignment(this.langService.getLangValue(), empRequest).subscribe({
          next: (response) => {
            this.showSuccessMessage(response.message);
          },
          error: (error) => {
            this.showErrorMessage(error.message);
          }
        });
        break;

      case 2: // Department
        const deptRequest: ProcessDepartmentsRequest = {
          deptIds: this.createForm.get('deptId')?.value,
          stsId: this.createForm.get('stsId')?.value,
          part: this.createForm.get('part')?.value,
          sDate: this.createForm.get('sDate')?.value,
          eDate: this.createForm.get('eDate')?.value,
          note: this.createForm.get('note')?.value,
          currentEmpId: this.empId
        };
        this.daysHandleService.createDepartmentAssignment(this.langService.getLangValue(), deptRequest).subscribe({
          next: (response) => {
            this.showSuccessMessage(response.message);
          },
          error: (error) => {
            this.showErrorMessage(error.message);
          }
        });
        break;

      case 3: // Branch
        const branchRequest: ProcessBranchesRequest = {
          branchIds: this.createForm.get('branchId')?.value,
          stsId: this.createForm.get('stsId')?.value,
          part: this.createForm.get('part')?.value,
          sDate: this.createForm.get('sDate')?.value,
          eDate: this.createForm.get('eDate')?.value,
          note: this.createForm.get('note')?.value,
          currentEmpId: this.empId
        };
        this.daysHandleService.createBranchAssignment(this.langService.getLangValue(), branchRequest).subscribe({
          next: (response) => {
            this.showSuccessMessage(response.message);
          },
          error: (error) => {
            this.showErrorMessage(error.message);
          }
        });
        break;

      case 4: // Role
        const roleRequest: ProcessRolesRequest = {
          roleIds: this.createForm.get('roleId')?.value,
          stsId: this.createForm.get('stsId')?.value,
          part: this.createForm.get('part')?.value,
          sDate: this.createForm.get('sDate')?.value,
          eDate: this.createForm.get('eDate')?.value,
          note: this.createForm.get('note')?.value,
          currentEmpId: this.empId
        };
        this.daysHandleService.createRoleAssignment(this.langService.getLangValue(), roleRequest).subscribe({
          next: (response) => {
            this.showSuccessMessage(response.message);
          },
          error: (error) => {
            this.showErrorMessage(error.message);
          }
        });
        break;
    }
  }

  private updateAssignment(): void {
    if (!this.currentEditingShift) {
      return;
    }

    const updateRequest: UpdateDayHandleRequest = {
      recId: this.currentEditingShift.recId,
      stsId: this.createForm.value.stsId,
      part: this.createForm.value.part,
      sDate: this.createForm.value.sDate,
      eDate: this.createForm.value.eDate,
      note: this.createForm.value.note
    };

    this.daysHandleService.updateAssignment(this.langService.getLangValue(), updateRequest).subscribe({
      next: (response) => {
        this.showSuccessMessage(response.message);
      },
      error: (error) => {
        this.showErrorMessage(error.message);
      }
    });
  }

}
