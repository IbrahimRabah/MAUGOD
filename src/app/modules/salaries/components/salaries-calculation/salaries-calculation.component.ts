import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SalariesCalculationsService } from '../../services/salaries-calculations.service';
import { LanguageService } from '../../../../core/services/language.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { SalaryData, SalaryResponse } from '../../../../core/models/CalculateSalaryRequest';

interface SelectableItem {
  id: number | string;
  name: string;
}

interface MultiSelectState {
  available: SelectableItem[];
  selected: SelectableItem[];
  searchTerm: string;
}

const CALCULATION_TYPES = {
  EMPLOYEES: 'employees',
  DEPARTMENTS: 'departments',
  BRANCHES: 'branches',
  ROLES: 'roles'
} as const;

const PAYMENT_TYPES = {
  FULL: 'full',
  PARTIAL: 'partial'
} as const;

@Component({
  selector: 'app-salaries-calculation',
  templateUrl: './salaries-calculation.component.html',
  styleUrl: './salaries-calculation.component.css',
  providers: [MessageService, ConfirmationService]
})
export class SalariesCalculationComponent implements OnInit, OnDestroy {
  // Core component state
  salaryCalculations: SalaryData[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  showCalculateModal = false;
  selectedItems: SalaryData[] = [];
  
  private langSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to Arabic (2)
  
  // Reactive Forms
  searchForm!: FormGroup;
  calculateForm!: FormGroup;
  
  // Multi-select state management
  multiSelectStates: { [key: string]: MultiSelectState } = {
    employees: { available: [], selected: [], searchTerm: '' },
    departments: { available: [], selected: [], searchTerm: '' },
    branches: { available: [], selected: [], searchTerm: '' },
    roles: { available: [], selected: [], searchTerm: '' }
  };
  
  // Loading states
  loadingEmployees = false;
  loadingDepartments = false;
  loadingBranches = false;
  loadingRoles = false;
  
  // Data loaded flags to avoid unnecessary reloads
  private dataLoaded = {
    employees: false,
    departments: false,
    branches: false,
    roles: false
  };

  constructor(
    private salariesService: SalariesCalculationsService,
    private dropdownlistsService: DropdownlistsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.currentLang = this.langService.getLangValue();
    this.initializeForms();
    this.initializeMultiSelectStates();
  }

  ngOnInit() {
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      this.loadSalaryCalculations();
      // Reset data loaded flags when language changes to reload data in new language
      this.resetDataLoadedFlags();
    });
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForms() {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [10]
    });

    this.calculateForm = this.fb.group({
      calculationType: [CALCULATION_TYPES.EMPLOYEES, Validators.required],
      sDate: ['', Validators.required],
      eDate: ['', Validators.required],
      paymentType: [PAYMENT_TYPES.FULL, Validators.required],
      paidAmount: [0],
      note: [''],
      outReference: ['']
    });

    // Watch for payment type changes
    this.calculateForm.get('paymentType')?.valueChanges.subscribe(value => {
      const paidAmountControl = this.calculateForm.get('paidAmount');
      if (value === PAYMENT_TYPES.FULL) {
        paidAmountControl?.setValue(0);
        paidAmountControl?.disable();
      } else {
        paidAmountControl?.enable();
        paidAmountControl?.setValidators([Validators.required, Validators.min(0.01)]);
      }
      paidAmountControl?.updateValueAndValidity();
    });

    // Watch for calculation type changes to load appropriate dropdown data
    this.calculateForm.get('calculationType')?.valueChanges.subscribe(value => {
      if (value && this.showCalculateModal) {
        this.loadDataByCalculationType(value);
      }
    });
  }

  private resetDataLoadedFlags() {
    this.dataLoaded = {
      employees: false,
      departments: false,
      branches: false,
      roles: false
    };
  }

  private loadDataIfNeeded() {
    // Only load data that hasn't been loaded yet or when language changes
    if (!this.dataLoaded.employees) {
      this.loadEmployees();
    }
    if (!this.dataLoaded.departments) {
      this.loadDepartments();
    }
    if (!this.dataLoaded.branches) {
      this.loadBranches();
    }
    if (!this.dataLoaded.roles) {
      this.loadRoles();
    }
  }

  private loadDataByCalculationType(calculationType: string) {
    // Load only the data needed for the selected calculation type
    switch (calculationType) {
      case CALCULATION_TYPES.EMPLOYEES:
        if (!this.dataLoaded.employees) {
          this.loadEmployees();
        }
        break;
      case CALCULATION_TYPES.DEPARTMENTS:
        if (!this.dataLoaded.departments) {
          this.loadDepartments();
        }
        break;
      case CALCULATION_TYPES.BRANCHES:
        if (!this.dataLoaded.branches) {
          this.loadBranches();
        }
        break;
      case CALCULATION_TYPES.ROLES:
        if (!this.dataLoaded.roles) {
          this.loadRoles();
        }
        break;
    }
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail
    });
  }

  getStoredEmpId(): number | undefined {
    const empId = localStorage.getItem('empId');
    return empId ? parseInt(empId, 10) : undefined;
  }

  private loadEmployees() {
    this.loadingEmployees = true;
    const empId = this.getStoredEmpId() || 0;

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.employees) {
          const employees = response.data.employees.map((emp: any) => ({
            id: emp.value,
            name: emp.label
          }));
          this.updateMultiSelectState('employees', employees);
          this.dataLoaded.employees = true;
        } else {
          this.showErrorMessage('فشل في تحميل بيانات الموظفين');
        }
        this.loadingEmployees = false;
      },
      error: () => {
        this.loadingEmployees = false;
        this.showErrorMessage('فشل في تحميل بيانات الموظفين');
      }
    });
  }

  private loadDepartments() {
    this.loadingDepartments = true;

    this.dropdownlistsService.getDepartmentsDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.departments) {
          const departments = response.data.departments.map((dept: any) => ({
            id: dept.value,
            name: dept.label
          }));
          this.updateMultiSelectState('departments', departments);
          this.dataLoaded.departments = true;
        } else {
          this.showErrorMessage('فشل في تحميل بيانات الأقسام');
        }
        this.loadingDepartments = false;
      },
      error: () => {
        this.loadingDepartments = false;
        this.showErrorMessage('فشل في تحميل بيانات الأقسام');
      }
    });
  }

  private loadBranches() {
    this.loadingBranches = true;

    this.dropdownlistsService.getBranchesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.parentBranches) {
          const branches = response.data.parentBranches.map((branch: any) => ({
            id: branch.value,
            name: branch.label
          }));
          this.updateMultiSelectState('branches', branches);
          this.dataLoaded.branches = true;
        } else {
          this.showErrorMessage('فشل في تحميل بيانات الفروع');
        }
        this.loadingBranches = false;
      },
      error: () => {
        this.loadingBranches = false;
        this.showErrorMessage('فشل في تحميل بيانات الفروع');
      }
    });
  }

  private loadRoles() {
    this.loadingRoles = true;

    this.dropdownlistsService.getEmployeeRolesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.dropdownListsForRoleModuleRights) {
          const roles = response.data.dropdownListsForRoleModuleRights.map((role: any) => ({
            id: role.value,
            name: role.label
          }));
          this.updateMultiSelectState('roles', roles);
          this.dataLoaded.roles = true;
        } else {
          this.showErrorMessage('فشل في تحميل بيانات الوظائف');
        }
        this.loadingRoles = false;
      },
      error: () => {
        this.loadingRoles = false;
        this.showErrorMessage('فشل في تحميل بيانات الوظائف');
      }
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

  // Selection state getters
  get isAllSelected(): boolean {
    return this.salaryCalculations.length > 0 && this.selectedItems.length === this.salaryCalculations.length;
  }

  get isPartiallySelected(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.length < this.salaryCalculations.length;
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSalaryCalculations();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSalaryCalculations();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSalaryCalculations();
    }
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.loadSalaryCalculations();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadSalaryCalculations();
  }

  // Modal methods
  openCalculateModal() {
    this.showCalculateModal = true;
    this.resetCalculateForm();
    this.clearAllSelections();
    // Only load dropdown data for the default calculation type (employees)
    this.loadDataByCalculationType(CALCULATION_TYPES.EMPLOYEES);
  }

  closeCalculateModal() {
    this.showCalculateModal = false;
    this.resetCalculateForm();
    this.clearAllSelections();
  }

  private resetCalculateForm() {
    this.calculateForm.reset();
    this.calculateForm.patchValue({
      calculationType: CALCULATION_TYPES.EMPLOYEES,
      paymentType: PAYMENT_TYPES.FULL,
      paidAmount: 0
    });
  }

  private clearAllSelections() {
    Object.keys(this.multiSelectStates).forEach(key => {
      this.multiSelectStates[key] = {
        available: this.multiSelectStates[key].available,
        selected: [],
        searchTerm: ''
      };
    });
  }

  private initializeMultiSelectStates() {
    Object.keys(this.multiSelectStates).forEach(key => {
      this.multiSelectStates[key] = {
        available: [],
        selected: [],
        searchTerm: ''
      };
    });
  }

  private updateMultiSelectState(category: string, items: SelectableItem[]) {
    if (this.multiSelectStates[category]) {
      this.multiSelectStates[category].available = items;
    }
  }

  // Generic multi-select methods
  getFilteredItems(category: string): SelectableItem[] {
    const state = this.multiSelectStates[category];
    if (!state) {
      return [];
    }
    
    if (!state.searchTerm) {
      return state.available;
    }
    
    return state.available.filter((item: SelectableItem) =>
      item.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
  }

  isItemSelected(category: string, item: SelectableItem): boolean {
    const state = this.multiSelectStates[category];
    return state ? state.selected.some(selected => selected.id === item.id) : false;
  }

  toggleItemSelection(category: string, item: SelectableItem): void {
    const state = this.multiSelectStates[category];
    if (!state) return;

    const index = state.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      state.selected.splice(index, 1);
    } else {
      state.selected.push(item);
    }
  }

  clearSelection(category: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.selected = [];
    }
  }

  updateSearchTerm(category: string, searchTerm: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.searchTerm = searchTerm;
    }
  }

  getSelectedCount(category: string): number {
    return this.multiSelectStates[category]?.selected.length || 0;
  }

  selectAllItems(category: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.selected = [...state.available];
    }
  }

  hasSelectableItems(category: string): boolean {
    return (this.multiSelectStates[category]?.available.length || 0) > 0;
  }

  areAllItemsSelected(category: string): boolean {
    const state = this.multiSelectStates[category];
    return state ? state.available.length > 0 && state.selected.length === state.available.length : false;
  }

  // Core business methods
  loadSalaryCalculations() {
    this.loading = true;
    this.salariesService.getSalariesCalculations(this.currentLang.toString(), this.currentPage, this.pageSize).subscribe({
      next: (response: SalaryResponse) => {
        if (response.isSuccess) {
          this.salaryCalculations = response.data;
          this.totalRecords = response.totalCount;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load salary calculations'
        });
        this.loading = false;
      }
    });
  }

  submitCalculation() {
    if (this.calculateForm.invalid) {
      this.markFormGroupTouched(this.calculateForm);
      return;
    }

    const formValue = this.calculateForm.value;
    const calculationType = formValue.calculationType;
    const selectedIds = this.getSelectedIds(calculationType);
    
    if (selectedIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `Please select at least one ${calculationType.slice(0, -1)}`
      });
      return;
    }

    const requestBody = this.buildRequestBody(formValue, calculationType, selectedIds);
    const serviceCall = this.getServiceCall(calculationType, requestBody);

    serviceCall.subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Salary calculation completed successfully'
          });
          this.closeCalculateModal();
          this.loadSalaryCalculations();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Calculation failed'
          });
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to calculate salaries'
        });
      }
    });
  }

  private buildRequestBody(formValue: any, calculationType: string, selectedIds: number[]) {
    const requestBody: any = {
      sDate: formValue.sDate,
      eDate: formValue.eDate,
      note: formValue.note || '',
      paidAmount: formValue.paymentType === PAYMENT_TYPES.FULL ? 0 : formValue.paidAmount,
      outReference: formValue.outReference || ''
    };

    const propertyMap: { [key: string]: string } = {
      'employees': 'empIds',
      'departments': 'deptIds',
      'branches': 'branchIds',
      'roles': 'roleIds'
    };

    requestBody[propertyMap[calculationType]] = selectedIds;
    return requestBody;
  }

  private getServiceCall(calculationType: string, requestBody: any) {
    const serviceMap: { [key: string]: Function } = {
      'employees': () => this.salariesService.calculateSalaryByEmployee(requestBody, this.currentLang),
      'departments': () => this.salariesService.calculateSalaryByDepartment(requestBody, this.currentLang),
      'branches': () => this.salariesService.calculateSalaryByBranch(requestBody, this.currentLang),
      'roles': () => this.salariesService.calculateSalaryByRole(requestBody, this.currentLang)
    };

    return serviceMap[calculationType]();
  }

  private getSelectedIds(calculationType: string): number[] {
    const selectedItems = this.multiSelectStates[calculationType]?.selected || [];
    return selectedItems.map(item => Number(item.id));
  }

  deleteSalaryCalculation(calculation: SalaryData) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this salary calculation?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.salariesService.deleteSalaryCalculation(calculation.recId, this.currentLang).subscribe({
          next: (response) => {
            this.loading = false;
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: this.currentLang === 1 ? 'Success' : 'نجح',
                detail: response.message || (this.currentLang === 1 ? 'Salary calculation deleted successfully' : 'تم حذف حساب الراتب بنجاح')
              });
              this.loadSalaryCalculations();
              // Remove from selected items if it was selected
              this.selectedItems = this.selectedItems.filter(item => item.recId !== calculation.recId);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.currentLang === 1 ? 'Error' : 'خطأ',
                detail: response.message || (this.currentLang === 1 ? 'Failed to delete salary calculation' : 'فشل في حذف حساب الراتب')
              });
            }
          },
          error: (error) => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: this.currentLang === 1 ? 'Error' : 'خطأ',
              detail: this.currentLang === 1 ? 'An error occurred while deleting the salary calculation' : 'حدث خطأ أثناء حذف حساب الراتب'
            });
          }
        });
      }
    });
  }

  // Selection methods
  isSelected(calculation: SalaryData): boolean {
    return this.selectedItems.some(item => item.recId === calculation.recId);
  }

  toggleSelection(calculation: SalaryData) {
    const index = this.selectedItems.findIndex(item => item.recId === calculation.recId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(calculation);
    }
  }

  toggleSelectAll() {
    if (this.isAllSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.salaryCalculations];
    }
  }

  deleteSelected() {
    if (this.selectedItems.length === 0) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedItems.length} selected items?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        const selectedIds = this.selectedItems.map(item => item.recId);
        
        this.salariesService.deleteSelectedSalaryCalculations(selectedIds, this.currentLang).subscribe({
          next: (response) => {
            this.loading = false;
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: this.currentLang === 1 ? 'Success' : 'نجح',
                detail: response.message || (this.currentLang === 1 ? 
                  `${this.selectedItems.length} items deleted successfully` : 
                  `تم حذف ${this.selectedItems.length} عنصر بنجاح`)
              });
              this.selectedItems = [];
              this.loadSalaryCalculations();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.currentLang === 1 ? 'Error' : 'خطأ',
                detail: response.message || (this.currentLang === 1 ? 
                  'Failed to delete selected items' : 
                  'فشل في حذف العناصر المحددة')
              });
            }
          },
          error: (error) => {
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: this.currentLang === 1 ? 'Error' : 'خطأ',
              detail: this.currentLang === 1 ? 
                'An error occurred while deleting the selected items' : 
                'حدث خطأ أثناء حذف العناصر المحددة'
            });
          }
        });
      }
    });
  }

  // Helper methods
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.calculateForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field?.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.calculateForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }

  formatDate(dateString: string): string {
    return dateString ? new Date(dateString).toLocaleDateString() : '';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount || 0);
  }
}
