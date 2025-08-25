import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';
import { ShiftAssign, GetShiftsAssignResponse, CreateShiftsAssignRequest } from '../../../../core/models/shiftsAssign';
import { ShiftsAssignService } from '../../services/shifts-assign.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { LanguageService } from '../../../../core/services/language.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { TranslateService } from '@ngx-translate/core';

interface DropdownItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-shifts-assign',
  templateUrl: './shifts-assign.component.html',
  styleUrl: './shifts-assign.component.css',
  providers: [MessageService, ConfirmationService]
})
export class ShiftsAssignComponent implements OnInit, OnDestroy {
  // ViewChild references for dropdown management
  @ViewChild('shiftsDropdown') shiftsDropdown!: Dropdown;
  @ViewChild('targetDropdown') targetDropdown!: Dropdown;
  
  // Core component state
  shiftsAssign: ShiftAssign[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  showCreateModal = false;
  
  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to Arabic (2)
  private empId: number = 0;
  
  // Reactive Forms
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  createForm!: FormGroup;
  
  // Selected items for bulk operations
  selectedItems: ShiftAssign[] = [];
  selectAll = false;
  
  // Dropdown data with caching
  shifts: DropdownItem[] = [];
  employees: DropdownItem[] = [];
  departments: DropdownItem[] = [];
  branches: DropdownItem[] = [];
  roles: DropdownItem[] = [];
  
  // Cache flags to avoid duplicate API calls
  private dataCache = {
    shifts: false,
    employees: false,
    departments: false,
    branches: false,
    roles: false
  };
  
  // Loading states for dropdowns
  loadingShifts = false;
  loadingEmployees = false;
  loadingDepartments = false;
  loadingBranches = false;
  loadingRoles = false;
  
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
  
  constructor(
    private shiftsAssignService: ShiftsAssignService,
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
      this.loadShiftsAssign();
    });

    // Setup search debouncing
    this.setupSearchDebouncing();
    
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
      assignmentType: [1, Validators.required], // Default to Employee
      selectedTargets: [[], Validators.required],
      shiftId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
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
        this.loadShiftsAssign();
      });
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
  loadShiftsAssign() {
    this.loading = true;
    
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    
    this.shiftsAssignService.getShiftsAssign(
      this.currentPage,
      this.pageSize,
      this.empId,
      this.currentLang,
      startDate ? this.formatDateForApi(startDate) : undefined,
      endDate ? this.formatDateForApi(endDate) : undefined
    ).subscribe({
      next: (response: GetShiftsAssignResponse) => {
        if (response.isSuccess) {
          this.shiftsAssign = response.data || [];
          // Since the API doesn't return total count, we'll estimate it
          this.totalRecords = this.shiftsAssign.length;
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
      this.loadShiftsAssign();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadShiftsAssign();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadShiftsAssign();
    }
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.loadShiftsAssign();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadShiftsAssign();
  }

  // Filter methods
  onFilter() {
    this.currentPage = 1;
    this.loadShiftsAssign();
  }

  onResetFilter() {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadShiftsAssign();
  }

  // Selection methods
  onSelectAll() {
    if (this.selectAll) {
      this.selectedItems = [...this.shiftsAssign];
      this.shiftsAssign.forEach(item => item.sel = true);
    } else {
      this.selectedItems = [];
      this.shiftsAssign.forEach(item => item.sel = false);
    }
  }

  onItemSelect(item: ShiftAssign) {
    if (item.sel) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems = this.selectedItems.filter(selected => selected.rec_Id !== item.rec_Id);
    }
    this.updateSelectAllState();
  }

  private updateSelectAllState() {
    this.selectAll = this.shiftsAssign.length > 0 && this.selectedItems.length === this.shiftsAssign.length;
  }

  private resetSelection() {
    this.selectedItems = [];
    this.selectAll = false;
    this.shiftsAssign.forEach(item => item.sel = false);
  }

  // Delete methods
  deleteSelected() {
    if (this.selectedItems.length === 0) {
      this.showWarningMessage('Please select items to delete');
      return;
    }

    this.confirmationService.confirm({
      message: this.translate.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.DELETE_SELECTED_CONFIRMATION'),
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = this.selectedItems.map(item => item.rec_Id);
        this.performDelete(ids);
      }
    });
  }

  deleteShiftAssign(item: ShiftAssign) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the shift assignment for ${item.emp_Name}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDelete([item.rec_Id]);
      }
    });
  }

  private performDelete(ids: number[]) {
    this.shiftsAssignService.deleteShiftsAssignSelected(ids, this.currentLang).subscribe({
      next: (response) => {
        this.showSuccessMessage('Items deleted successfully');
        this.loadShiftsAssign();
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

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
    this.loadShifts();
    // Preload all dropdown data for better performance
    this.preloadAllDropdownData();
  }

  // Preload all dropdown data for better performance
  private preloadAllDropdownData() {
    this.loadEmployees();
    this.loadDepartments();
    this.loadBranches();
    this.loadRoles();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetCreateForm();
  }

  private resetCreateForm() {
    this.createForm.reset({
      assignmentType: 1, // Default to Employee
      selectedTargets: [],
      shiftId: '',
      startDate: '',
      endDate: ''
    });
    this.selectedTargetItems = [];
    this.selectedTargetIds = [];
    this.targetSelectAll = false;
    // Don't reset data cache as we want to keep loaded data for performance
  }

  private resetDataCache() {
    this.dataCache = {
      shifts: false,
      employees: false,
      departments: false,
      branches: false,
      roles: false
    };
  }

  // Assignment type change handler
  onAssignmentTypeChange() {
    this.selectedTargetItems = [];
    this.selectedTargetIds = [];
    this.targetSelectAll = false;
    this.createForm.patchValue({ selectedTargets: [] });
    // Don't load data again if already cached
    this.loadTargetDataIfNeeded();
  }

  // Load target data only if not already cached
  private loadTargetDataIfNeeded() {
    const assignmentType = this.createForm.get('assignmentType')?.value;
    
    switch (assignmentType) {
      case 1: // Employee
        if (!this.dataCache.employees) {
          this.loadEmployees();
        }
        break;
      case 2: // Department
        if (!this.dataCache.departments) {
          this.loadDepartments();
        }
        break;
      case 3: // Branch
        if (!this.dataCache.branches) {
          this.loadBranches();
        }
        break;
      case 4: // Role
        if (!this.dataCache.roles) {
          this.loadRoles();
        }
        break;
    }
  }

  // Target selection change handler
  onTargetSelectionChange(selectedIds: number[]) {
    this.selectedTargetIds = selectedIds || [];
    this.selectedTargetItems = this.currentTargetOptions.filter(item => 
      this.selectedTargetIds.includes(item.id)
    );
    // The form control is already updated by formControlName binding
    // Just mark as touched to trigger validation display
    this.createForm.get('selectedTargets')?.markAsTouched();
  }

  // Check if form is valid for submission
  get isFormValid(): boolean {
    const formValid = this.createForm.valid;
    const selectedTargetsControl = this.createForm.get('selectedTargets');
    const hasTargets = selectedTargetsControl?.value && selectedTargetsControl.value.length > 0;
    const result = formValid && hasTargets;
    
    // Debug logging
    if (!result) {
      console.log('Form validation:', {
        formValid,
        hasTargets,
        selectedTargetsValue: selectedTargetsControl?.value,
        formErrors: this.createForm.errors,
        formValue: this.createForm.value,
        selectedTargetsErrors: selectedTargetsControl?.errors
      });
    }
    
    return result;
  }

  // Get label for selected items in multiselect
  getSelectedItemsLabel(): string {
    const selectedTargets = this.createForm.get('selectedTargets')?.value || [];
    const count = selectedTargets.length;
    if (count === 0) return '';
    if (count === 1) return '1 item selected';
    return `${count} items selected`;
  }

  // Load target data based on assignment type
  private loadTargetData() {
    const assignmentType = this.createForm.get('assignmentType')?.value;
    
    switch (assignmentType) {
      case 1: // Employee
        this.loadEmployees();
        break;
      case 2: // Department
        this.loadDepartments();
        break;
      case 3: // Branch
        this.loadBranches();
        break;
      case 4: // Role
        this.loadRoles();
        break;
    }
  }

  // Get current target options based on assignment type
  get currentTargetOptions(): DropdownItem[] {
    const assignmentType = this.createForm.get('assignmentType')?.value;
    
    switch (assignmentType) {
      case 1: return this.employees;
      case 2: return this.departments;
      case 3: return this.branches;
      case 4: return this.roles;
      default: return [];
    }
  }

  // Dropdown loading methods
  private loadShifts() {
    if (this.dataCache.shifts) return;
    
    this.loadingShifts = true;
    this.dropdownlistsService.getShiftsDropDownList(this.currentLang).subscribe({
      next: (response) => {
        console.log('Loading shifts dropdown:', response);
        if (response.isSuccess && response.data && response.data.shifts) {
          this.shifts = response.data.shifts.map((item: any) => ({
            id: item.value,
            name: item.label
          }));
          this.dataCache.shifts = true;
        }
        this.loadingShifts = false;
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
        this.showErrorMessage('Failed to load shifts');
        this.loadingShifts = false;
      }
    });
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

  // Dropdown management for collapse behavior
  onDropdownShow(currentDropdownId: string) {
    // Close other dropdowns when one is opened
    if (currentDropdownId !== 'shifts' && this.shiftsDropdown) {
      this.shiftsDropdown.hide();
    }
    if (currentDropdownId !== 'target' && this.targetDropdown) {
      this.targetDropdown.hide();
    }
  }

  // Submit create form
  submitCreate() {
    if (this.createForm.invalid) {
      this.markFormGroupTouched(this.createForm);
      
      // Show specific validation messages
      const invalidControls = this.getInvalidControls();
      if (invalidControls.length > 0) {
        this.showErrorMessage(`Please fix the following fields: ${invalidControls.join(', ')}`);
      }
      
      return;
    }

    const formValue = this.createForm.value;
    const assignmentType = formValue.assignmentType;
    const selectedTargetIds = formValue.selectedTargets || [];
    
    // Get selected targets by their IDs
    const selectedTargets = this.currentTargetOptions.filter(option => 
      selectedTargetIds.includes(option.id)
    );

    if (selectedTargets.length === 0) {
      this.showErrorMessage('Please select at least one target');
      return;
    }

    // Create requests for each selected target
    selectedTargets.forEach(target => {
      const payload: CreateShiftsAssignRequest = {
        empId: assignmentType === 1 ? target.id : null,
        deptId: assignmentType === 2 ? target.id : null,
        branchId: assignmentType === 3 ? target.id : null,
        roleId: assignmentType === 4 ? target.id : null,
        shiftId: parseInt(formValue.shiftId),
        startDate: this.formatDateForApi(formValue.startDate),
        endDate: this.formatDateForApi(formValue.endDate),
        lang: this.currentLang
      };

      this.shiftsAssignService.createShiftsAssign(payload, this.currentLang).subscribe({
        next: (response) => {
          this.showSuccessMessage(`Shift assignment created successfully for ${target.name}`);
        },
        error: (error) => {
          console.error('Error creating shift assignment:', error);
          this.showErrorMessage(`Failed to create shift assignment for ${target.name}`);
        }
      });
    });

    // Close modal and refresh data
    this.closeCreateModal();
    setTimeout(() => {
      this.loadShiftsAssign();
    }, 1000); // Give time for all requests to complete
  }

  // Form validation helpers
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private getInvalidControls(): string[] {
    const invalidControls: string[] = [];
    const controls = this.createForm.controls;
    
    for (const name in controls) {
      if (controls[name].invalid) {
        invalidControls.push(name);
      }
    }
    
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
        return `${fieldName} is required`;
      }
      if (field.errors['dateRangeInvalid']) {
        return 'End date must be after start date';
      }
    }
    
    return '';
  }

  // Get assignment type display name
  getAssignmentTypeDisplayName(typeId: number): string {
    const option = this.assignmentTypeOptions.find(opt => opt.id === typeId);
    return this.currentLang === 2 ? (option?.nameAr || '') : (option?.name || '');
  }
}
