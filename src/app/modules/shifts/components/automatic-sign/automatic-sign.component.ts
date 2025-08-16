import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AutoSign, AutoSignRequest } from '../../../../core/models/AutoSign';
import { AutomaticSignService } from '../../services/automatic-sign.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Dropdown } from 'primeng/dropdown';

interface DropdownItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-automatic-sign',
  templateUrl: './automatic-sign.component.html',
  styleUrl: './automatic-sign.component.css',
  providers: [MessageService, ConfirmationService]
})
export class AutomaticSignComponent implements OnInit, OnDestroy {
  // ViewChild references for dropdown management
  @ViewChild('empDropdown') empDropdown!: Dropdown;
  @ViewChild('deptDropdown') deptDropdown!: Dropdown;
  @ViewChild('mgrDeptDropdown') mgrDeptDropdown!: Dropdown;
  @ViewChild('branchDropdown') branchDropdown!: Dropdown;
  @ViewChild('mgrBranchDropdown') mgrBranchDropdown!: Dropdown;
  @ViewChild('roleDropdown') roleDropdown!: Dropdown;
  
  // Core component state
  autoSigns: AutoSign[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  showCreateModal = false;
  isEditMode = false;
  editingRecordId?: number;
  
  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to Arabic (2)
  
  // Reactive Forms
  searchForm!: FormGroup;
  createForm!: FormGroup;
  
  // Dropdown data with caching
  employees: DropdownItem[] = [];
  departments: DropdownItem[] = [];
  branches: DropdownItem[] = [];
  roles: DropdownItem[] = [];
  
  // Cache flags to avoid duplicate API calls
  private dataCache = {
    employees: false,
    departments: false,
    branches: false,
    roles: false
  };
  
  // Managers use the same data as departments and branches
  get managersOfDepartments(): DropdownItem[] {
    return this.departments;
  }
  
  get managersOfBranches(): DropdownItem[] {
    return this.branches;
  }
  
  // Loading states for dropdowns
  loadingEmployees = false;
  loadingDepartments = false;
  loadingBranches = false;
  loadingRoles = false;
  
  // Static dropdown options
  shiftPartOptions = [
    { id: 1, name: '1st Shift' },
    { id: 2, name: '2nd Shift' }
  ];

  constructor(
    private automaticSignService: AutomaticSignService,
    private dropdownlistsService: DropdownlistsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.currentLang = this.langService.getLangValue();
    this.initializeForms();
  }

  ngOnInit() {
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      // Reset cache when language changes
      this.resetDataCache();
      this.loadAutoSigns();
      // Preload dropdown data for better performance
      this.preloadDropdownData();
    });

    // Setup search with debouncing for better performance
    this.setupSearchDebouncing();
    
    // Preload dropdown data immediately
    this.preloadDropdownData();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  private setupSearchDebouncing() {
    this.searchSubscription = this.searchForm.get('searchTerm')!.valueChanges
      .pipe(
        debounceTime(500), // Wait 500ms after user stops typing for better performance
        distinctUntilChanged() // Only trigger if value actually changed
      )
      .subscribe(() => {
        // Only auto-search if there's actual content or if clearing the search
        const searchTerm = this.searchForm.get('searchTerm')?.value?.trim();
        if (searchTerm || searchTerm === '') {
          this.onSearch();
        }
      });
  }

  private resetDataCache() {
    this.dataCache = {
      employees: false,
      departments: false,
      branches: false,
      roles: false
    };
  }

  private preloadDropdownData() {
    // Load all dropdown data in parallel for better performance
    this.loadEmployees();
    this.loadDepartments();
    this.loadBranches();
    this.loadRoles();
  }

  private initializeForms() {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [10]
    });

    this.createForm = this.fb.group({
      empId: [null], // Removed Validators.required
      deptId: [null], // Removed Validators.required
      mgrOfDeptId: [null], // Removed Validators.required
      branchId: [null], // Removed Validators.required
      mgrOfBranchId: [null], // Removed Validators.required
      roleId: [null], // Removed Validators.required
      sDate: ['', Validators.required],
      eDate: ['', Validators.required],
      shiftPart: [1, Validators.required],
      autoIn: [0],
      inRandomBfor: [0],
      inRandomAftr: [0],
      autoOut: [0],
      outRandomBfor: [0],
      outRandomAftr: [0],
      sts: [1],
      sat: [0],
      sun: [0],
      mon: [0],
      tue: [0],
      wed: [0],
      thu: [0],
      fri: [0],
      note: ['']
    }, { 
      validators: [this.dateRangeValidator, this.autoInOutValidator]
    });

    // Add listeners for date changes to trigger validation
    this.createForm.get('sDate')?.valueChanges.subscribe(() => {
      this.createForm.get('eDate')?.updateValueAndValidity();
    });

    this.createForm.get('eDate')?.valueChanges.subscribe(() => {
      this.createForm.updateValueAndValidity();
    });

    // Add listeners for Auto In/Out changes to trigger validation
    this.createForm.get('autoIn')?.valueChanges.subscribe(() => {
      this.createForm.updateValueAndValidity();
    });

    this.createForm.get('autoOut')?.valueChanges.subscribe(() => {
      this.createForm.updateValueAndValidity();
    });
  }

  // Custom validator for date range
  private dateRangeValidator = (group: FormGroup) => {
    const startDate = group.get('sDate')?.value;
    const endDate = group.get('eDate')?.value;

    if (!startDate || !endDate) {
      return null; // Don't validate if either date is missing
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Reset time to compare only dates
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (end < start) {
      return { dateRange: { message: 'End date must be after start date' } };
    }

    return null;
  };

  // Custom validator to ensure at least one of Auto In or Auto Out is selected
  private autoInOutValidator = (group: FormGroup) => {
    const autoIn = group.get('autoIn')?.value;
    const autoOut = group.get('autoOut')?.value;

    // Convert to numbers in case they come as strings
    const autoInValue = Number(autoIn);
    const autoOutValue = Number(autoOut);

    // At least one must be 1 (enabled)
    if (autoInValue !== 1 && autoOutValue !== 1) {
      return { autoInOut: { message: 'At least one of Auto In or Auto Out must be enabled' } };
    }

    return null;
  };

  // Helper method to check if dates are valid
  private areDatesValid(): boolean {
    const startDate = this.createForm.get('sDate')?.value;
    const endDate = this.createForm.get('eDate')?.value;
    
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    return end >= start;
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

  // Check if we can go to next page
  get canGoNext(): boolean {
    return this.autoSigns.length === this.pageSize;
  }

  // Check if we can go to previous page
  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Core business methods
  loadAutoSigns() {
    this.loading = true;
    
    this.automaticSignService.GetAutomaticSign(this.currentLang, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.autoSigns) {
          this.autoSigns = response.data.autoSigns;
          
          // Calculate total records based on returned data
          if (this.autoSigns.length < this.pageSize) {
            this.totalRecords = (this.currentPage - 1) * this.pageSize + this.autoSigns.length;
          } else {
            this.totalRecords = this.currentPage * this.pageSize + 1;
          }
        } else {
          this.autoSigns = [];
          this.totalRecords = 0;
          this.showErrorMessage(
            this.langService.getCurrentLang() === 'ar' ? 
              'فشل في تحميل البيانات' : 
              'Failed to load data'
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading auto signs:', error);
        this.showErrorMessage(
          this.langService.getCurrentLang() === 'ar' ? 
            'حدث خطأ أثناء تحميل البيانات' : 
            'Error occurred while loading data'
        );
        this.loading = false;
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && (page <= this.totalPages || this.totalPages === 0)) {
      this.currentPage = page;
      this.loadAutoSigns();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadAutoSigns();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadAutoSigns();
    }
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.loadAutoSigns();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadAutoSigns();
  }

  // Helper method to get search term
  get searchTerm(): string {
    return this.searchForm.get('searchTerm')?.value || '';
  }

  // Modal methods
  openCreateModal() {
    this.isEditMode = false;
    this.editingRecordId = undefined;
    this.showCreateModal = true;
    this.resetCreateForm();
    // Don't reload dropdown data if already cached - just show modal faster
    if (!this.isAllDataCached()) {
      this.loadMissingDropdownData();
    }
  }

  openEditModal(autoSign: AutoSign) {
    this.isEditMode = true;
    this.editingRecordId = autoSign.recId;
    this.showCreateModal = true;
    this.populateEditForm(autoSign);
    // Don't reload dropdown data if already cached - just show modal faster
    if (!this.isAllDataCached()) {
      this.loadMissingDropdownData();
    }
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.isEditMode = false;
    this.editingRecordId = undefined;
    this.resetCreateForm();
  }

  private resetCreateForm() {
    this.createForm.reset();
    this.createForm.patchValue({
      shiftPart: 1,
      autoIn: 0,
      autoOut: 0,
      sts: 1,
      sat: 0,
      sun: 0,
      mon: 0,
      tue: 0,
      wed: 0,
      thu: 0,
      fri: 0,
      inRandomBfor: 0,
      inRandomAftr: 0,
      outRandomBfor: 0,
      outRandomAftr: 0
    });
  }

  private populateEditForm(autoSign: AutoSign) {
    // Format dates for the form (remove time part)
    const sDate = autoSign.sDate ? this.formatDateForForm(autoSign.sDate) : '';
    const eDate = autoSign.eDate ? this.formatDateForForm(autoSign.eDate) : '';

    this.createForm.patchValue({
      empId: autoSign.empId,
      deptId: autoSign.deptId,
      mgrOfDeptId: autoSign.mgrOfDeptId,
      branchId: autoSign.branchId,
      mgrOfBranchId: autoSign.mgrOfBranchId,
      roleId: autoSign.roleId,
      sDate: sDate,
      eDate: eDate,
      shiftPart: autoSign.shiftPart,
      autoIn: autoSign.autoIn,
      inRandomBfor: 0, // These might not be in the AutoSign model, so using defaults
      inRandomAftr: 0,
      autoOut: autoSign.autoOut,
      outRandomBfor: 0,
      outRandomAftr: 0,
      sts: autoSign.sts,
      sat: autoSign.sat,
      sun: autoSign.sun,
      mon: autoSign.mon,
      tue: autoSign.tue,
      wed: autoSign.wed,
      thu: autoSign.thu,
      fri: autoSign.fri,
      note: autoSign.note || ''
    });
  }

  private formatDateForForm(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  // Load dropdown data - optimized to call endpoints only once per data type
  private loadDropdownData() {
    this.loadMissingDropdownData();
  }

  private isAllDataCached(): boolean {
    return this.dataCache.employees && 
           this.dataCache.departments && 
           this.dataCache.branches && 
           this.dataCache.roles;
  }

  private loadMissingDropdownData() {
    if (!this.dataCache.employees) this.loadEmployees();
    if (!this.dataCache.departments) this.loadDepartments();
    if (!this.dataCache.branches) this.loadBranches();
    if (!this.dataCache.roles) this.loadRoles();
  }

  private loadEmployees() {
    if (this.dataCache.employees) return; // Skip if already loaded
    
    this.loadingEmployees = true;
    const empId = this.getStoredEmpId() || 0;

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.employees = response.data.employees.map((emp: any) => ({
            id: emp.value,
            name: emp.label
          }));
          this.dataCache.employees = true;
        }
        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
        this.showErrorMessage('Failed to load employees');
      }
    });
  }

  private loadDepartments() {
    if (this.dataCache.departments) return; // Skip if already loaded
    
    this.loadingDepartments = true;
    this.dropdownlistsService.getDepartmentsDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.departments = response.data.departments.map((dept: any) => ({
            id: dept.value,
            name: dept.label
          }));
          this.dataCache.departments = true;
        }
        this.loadingDepartments = false;
      },
      error: () => {
        this.loadingDepartments = false;
        this.showErrorMessage('Failed to load departments');
      }
    });
  }

  private loadBranches() {
    if (this.dataCache.branches) return; // Skip if already loaded
    
    this.loadingBranches = true;
    this.dropdownlistsService.getBranchesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.branches = response.data.parentBranches.map((branch: any) => ({
            id: branch.value,
            name: branch.label
          }));
          this.dataCache.branches = true;
        }
        this.loadingBranches = false;
      },
      error: () => {
        this.loadingBranches = false;
        this.showErrorMessage('Failed to load branches');
      }
    });
  }

  private loadRoles() {
    if (this.dataCache.roles) return; // Skip if already loaded
    
    this.loadingRoles = true;
    this.dropdownlistsService.getEmployeeRolesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.roles = response.data.dropdownListsForRoleModuleRights.map((role: any) => ({
            id: role.value,
            name: role.label
          }));
          this.dataCache.roles = true;
        }
        this.loadingRoles = false;
      },
      error: () => {
        this.loadingRoles = false;
        this.showErrorMessage('Failed to load roles');
      }
    });
  }

  getStoredEmpId(): number | undefined {
    const empId = localStorage.getItem('empId');
    return empId ? parseInt(empId, 10) : undefined;
  }

  // Dropdown management for collapse behavior
  onDropdownShow(currentDropdownId: string) {
    // Close all other dropdowns when one is opened
    const dropdowns = [
      { id: 'empDropdown', ref: this.empDropdown },
      { id: 'deptDropdown', ref: this.deptDropdown },
      { id: 'mgrDeptDropdown', ref: this.mgrDeptDropdown },
      { id: 'branchDropdown', ref: this.branchDropdown },
      { id: 'mgrBranchDropdown', ref: this.mgrBranchDropdown },
      { id: 'roleDropdown', ref: this.roleDropdown }
    ];
    
    dropdowns.forEach(dropdown => {
      if (dropdown.id !== currentDropdownId && dropdown.ref?.overlayVisible) {
        dropdown.ref.hide();
      }
    });
  }

  // Submit form
  submitCreate() {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      
      // Console log the form values before calling the API
      console.log('🔍 Form Values Before API Call:', formValue);
      console.log('📋 Form Status:', {
        valid: this.createForm.valid,
        invalid: this.createForm.invalid,
        touched: this.createForm.touched,
        dirty: this.createForm.dirty
      });
      
      const autoSignRequest: AutoSignRequest = {
        empId: formValue.empId || 0, // Use 0 as default for optional fields
        deptId: formValue.deptId || 0,
        mgrOfDeptId: formValue.mgrOfDeptId || 0,
        branchId: formValue.branchId || 0,
        mgrOfBranchId: formValue.mgrOfBranchId || 0,
        roleId: formValue.roleId || 0,
        sDate: this.formatDateForApi(formValue.sDate),
        eDate: this.formatDateForApi(formValue.eDate),
        shiftPart: formValue.shiftPart,
        autoIn: formValue.autoIn,
        inRandomBfor: formValue.inRandomBfor,
        inRandomAftr: formValue.inRandomAftr,
        autoOut: formValue.autoOut,
        outRandomBfor: formValue.outRandomBfor,
        outRandomAftr: formValue.outRandomAftr,
        sts: formValue.sts,
        sat: formValue.sat,
        sun: formValue.sun,
        mon: formValue.mon,
        tue: formValue.tue,
        wed: formValue.wed,
        thu: formValue.thu,
        fri: formValue.fri,
        note: formValue.note || '',
        lang: this.currentLang
      };

      console.log('🚀 API Request Payload:', autoSignRequest);

      if (this.isEditMode && this.editingRecordId) {
        // Update existing record
        this.automaticSignService.updateAutoSign(this.currentLang, autoSignRequest).subscribe({
          next: (response) => {
            console.log('✅ Update API Response:', response);
            this.showSuccessMessage(
              this.langService.getCurrentLang() === 'ar' ? 
                'تم تحديث التوقيع الآلي بنجاح' : 
                'Automatic sign updated successfully'
            );
            this.closeCreateModal();
            this.loadAutoSigns();
          },
          error: (error) => {
            console.error('❌ Update API Error:', error);
            this.showErrorMessage(
              this.langService.getCurrentLang() === 'ar' ? 
                'حدث خطأ أثناء تحديث التوقيع الآلي' : 
                'Error occurred while updating automatic sign'
            );
          }
        });
      } else {
        // Create new record
        this.automaticSignService.insertAutomaticSign(autoSignRequest, this.currentLang).subscribe({
          next: (response) => {
            console.log('✅ Create API Response:', response);
            this.showSuccessMessage(
              this.langService.getCurrentLang() === 'ar' ? 
                'تم إنشاء التوقيع الآلي بنجاح' : 
                'Automatic sign created successfully'
            );
            this.closeCreateModal();
            this.loadAutoSigns();
          },
          error: (error) => {
            console.error('❌ Create API Error:', error);
            this.showErrorMessage(
              this.langService.getCurrentLang() === 'ar' ? 
                'حدث خطأ أثناء إنشاء التوقيع الآلي' : 
                'Error occurred while creating automatic sign'
            );
          }
        });
      }
    } else {
      console.warn('⚠️ Form is invalid:', this.createForm.errors);
      console.log('🔧 Invalid form controls:', this.getInvalidControls());
      
      // Show specific error for date range validation
      if (this.createForm.errors?.['dateRange']) {
        this.showErrorMessage(
          this.langService.getCurrentLang() === 'ar' ? 
            'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية' : 
            'End date must be after start date'
        );
      }
      
      // Show specific error for Auto In/Out validation
      if (this.createForm.errors?.['autoInOut']) {
        this.showErrorMessage(
          this.langService.getCurrentLang() === 'ar' ? 
            'يجب تفعيل واحد على الأقل من الدخول التلقائي أو الخروج التلقائي' : 
            'At least one of Auto In or Auto Out must be enabled'
        );
      }
      
      this.markFormGroupTouched(this.createForm);
    }
  }

  private formatDateForApi(date: string): string {
    if (!date) return '';
    // Convert date to ISO string format
    const dateObj = new Date(date);
    return dateObj.toISOString();
  }

  // Helper methods
  private showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success',
      detail
    });
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error',
      detail
    });
  }

  // Edit and delete methods
  editAutoSign(autoSign: AutoSign) {
    this.openEditModal(autoSign);
  }

  deleteAutoSign(autoSign: AutoSign) {
    this.confirmationService.confirm({
      message: this.langService.getCurrentLang() === 'ar' ? 
        `هل أنت متأكد من حذف التوقيع الآلي للموظف: ${autoSign.empName}؟` :
        `Are you sure you want to delete the automatic sign for employee: ${autoSign.empName}?`,
      header: this.langService.getCurrentLang() === 'ar' ? 'تأكيد الحذف' : 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.langService.getCurrentLang() === 'ar' ? 'نعم' : 'Yes',
      rejectLabel: this.langService.getCurrentLang() === 'ar' ? 'لا' : 'No',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.automaticSignService.deleteAutoSign(this.currentLang, autoSign.recId).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.showSuccessMessage(
                this.langService.getCurrentLang() === 'ar' ? 
                  'تم حذف التوقيع الآلي بنجاح' : 
                  'Automatic sign deleted successfully'
              );
              this.loadAutoSigns();
            } else {
              this.showErrorMessage(response.message || 
                (this.langService.getCurrentLang() === 'ar' ? 
                  'فشل في حذف التوقيع الآلي' : 
                  'Failed to delete automatic sign')
              );
            }
          },
          error: (error) => {
            console.error('❌ Delete API Error:', error);
            this.showErrorMessage(
              this.langService.getCurrentLang() === 'ar' ? 
                'حدث خطأ أثناء حذف التوقيع الآلي' : 
                'Error occurred while deleting automatic sign'
            );
          }
        });
      }
    });
  }

  // Format display values
  getDisplayValue(value: string | number): string {
    return value?.toString() || '-';
  }

  getYesNoDisplay(value: number): string {
    if (this.langService.getCurrentLang() === 'ar') {
      return value === 1 ? 'نعم' : 'لا';
    } else {
      return value === 1 ? 'Yes' : 'No';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
    const fieldInvalid = !!(field && field.invalid && (field.dirty || field.touched));
    
    // For end date, also check form-level date range validation
    if (fieldName === 'eDate') {
      const formInvalid = !!(formGroup.errors?.['dateRange'] && (field?.dirty || field?.touched));
      return fieldInvalid || formInvalid;
    }
    
    return fieldInvalid;
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.createForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return this.langService.getCurrentLang() === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
      }
    }
    
    // Check for form-level date range error
    if (fieldName === 'eDate' && formGroup.errors?.['dateRange']) {
      return this.langService.getCurrentLang() === 'ar' ? 
        'تاريخ الانتهاء يجب أن يكون بعد تاريخ البداية' : 
        'End date must be after start date';
    }
    
    return '';
  }
}
