import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeeHandlesBalanceService } from '../../services/employee-handles-balance.service';
import { LanguageService } from '../../../../core/services/language.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { PaginationRequest } from '../../../../core/models/pagination';
import { EmployeeHandleBalance, EmployeeHandlesBalanceResponse } from '../../../../core/models/EmployeeHandlesBalance ';
import { Employee } from '../../../../core/models/employee';
import { Department } from '../../../../core/models/department';
import { Branch } from '../../../../core/models/branch';
import { Subscription } from 'rxjs';

interface SelectableItem {
  id: number | string;
  name: string;
}

interface MultiSelectState {
  available: SelectableItem[];
  selected: SelectableItem[];
  searchTerm: string;
}

@Component({
  selector: 'app-handle-statuses-employee-balance',
  templateUrl: './handle-statuses-employee-balance.component.html',
  styleUrl: './handle-statuses-employee-balance.component.css',
  providers: [MessageService, ConfirmationService]
})
export class HandleStatusesEmployeeBalanceComponent implements OnInit, OnDestroy {
  // Core component state
  employeeBalances: EmployeeHandleBalance[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  showAddModal = false;
  selectedBalance: EmployeeHandleBalance | null = null;
  isEditMode = false;
  selectedItems: EmployeeHandleBalance[] = [];
  
  private langSubscription: Subscription = new Subscription();
  private isInitialized = false;
  private currentLang = 2; // Default to Arabic (2)
  
  // Reactive Forms
  balanceForm!: FormGroup;
  searchForm!: FormGroup;

  // Multi-select state management
  multiSelectStates: { [key: string]: MultiSelectState } = {
    employees: { available: [], selected: [], searchTerm: '' },
    departments: { available: [], selected: [], searchTerm: '' },
    branches: { available: [], selected: [], searchTerm: '' },
    roles: { available: [], selected: [], searchTerm: '' }
  };

  // Dynamic data from services
  employees: Employee[] = [];
  departments: Department[] = [];
  branches: Branch[] = [];
  roles: any[] = [];
  
  // Loading states for each data type
  loadingEmployees = false;
  loadingDepartments = false;
  loadingBranches = false;
  loadingRoles = false;
  loadingStatuses = false;

  // Selected IDs for form submission
  selectedEmployeeIds: number[] = [];
  selectedDepartmentIds: number[] = [];
  selectedBranchIds: number[] = [];
  selectedRoleIds: number[] = [];

  // Dynamic statuses data (loaded from API)
  statuses: any[] = [];
  
  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 2 // Default to Arabic
  };
searchColumns = [
  { column: 'allFields', label: 'All Columns' }, // global search

  { column: 'allEmployee', label: 'EMPLOYEE_BALANCE.ALL_EMPLOYEES' },
  { column: 'employeeName', label: 'EMPLOYEE_BALANCE.EMPLOYEE' },
  { column: 'departmentName', label: 'EMPLOYEE_BALANCE.DEPARTMENT' },
  { column: 'branchName', label: 'EMPLOYEE_BALANCE.BRANCH' },
  { column: 'roleName', label: 'EMPLOYEE_BALANCE.ROLE' },
  { column: 'statusName', label: 'EMPLOYEE_BALANCE.STATUS' },
  { column: 'allSts', label: 'EMPLOYEE_BALANCE.ALL_STATUSES' },

  { column: 'maxPerWeek', label: 'EMPLOYEE_BALANCE.MAX_PER_WEEK' },
  { column: 'maxPerMonth', label: 'EMPLOYEE_BALANCE.MAX_PER_MONTH' },
  { column: 'maxPerYear', label: 'EMPLOYEE_BALANCE.MAX_PER_YEAR' },

  { column: 'forwardBalance', label: 'EMPLOYEE_BALANCE.FORWARD_BALANCE' },
  { column: 'countBaseContractStart', label: 'EMPLOYEE_BALANCE.COUNT_BASE_CONTRACT_START' },
  { column: 'fractionFloorCeil', label: 'EMPLOYEE_BALANCE.IGNORE_FRACTION' },
  { column: 'includeWeekendInBetween', label: 'EMPLOYEE_BALANCE.INCLUDE_WEEKEND' },

  { column: 'note', label: 'EMPLOYEE_BALANCE.NOTES' }
];



   searchTerm: string = '';
  
  selectedColumnLabel: string = this.searchColumns[0].label;
  selectedColumn: string = this.searchColumns[0].column;

  constructor(
    private employeeBalanceService: EmployeeHandlesBalanceService,
    private dropdownlistsService: DropdownlistsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.initializeMultiSelectStates();
    
    // Initialize current language
    this.currentLang = this.langService.getLangValue();
    
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      // Convert language string to number using the service method
      this.currentLang = this.langService.getLangValue();
      this.paginationRequest.lang = this.currentLang;
      
      if (this.isInitialized) {
        this.loadEmployeeBalances();
      }
    });
  }

  ngOnInit() {
    // Initialize current language from service
    this.currentLang = this.langService.getLangValue();
    this.paginationRequest.lang = this.currentLang;
    
    this.loadEmployeeBalances();
    this.loadAllData();

    this.isInitialized = true;
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }
  getStoredEmpId(): number | undefined {
    const empId = localStorage.getItem('empId');
    return empId ? parseInt(empId, 10) : undefined;
  }
  // Load all data from services
  private loadAllData() {
    this.loadEmployees();
    this.loadDepartments();
    this.loadBranches();
    this.loadRoles();
    this.loadStatuses();
  }

  private loadEmployees() {
    this.loadingEmployees = true;
    const empId = this.getStoredEmpId() || 0; // Default to 0 if no empId

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.employees = response.data.employees;
          console.log('Loaded employees from dropdown service:', this.employees.length);
          // Handle different possible property names from the API
          this.updateMultiSelectState('employees', this.employees.map((emp: any) => ({
            id: emp.value,
            name: emp.label
          })));
        } else {
          console.error('Failed to load employees:', response.message || 'No data received');
          this.employees = [];
        }
        this.loadingEmployees = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loadingEmployees = false;
        this.employees = [];
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات الموظفين'
        });
      }
    });
  }

  private loadDepartments() {
    this.loadingDepartments = true;

    this.dropdownlistsService.getDepartmentsDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.departments = response.data.departments;
          console.log('Loaded departments from dropdown service:', this.departments.length);
          this.updateMultiSelectState('departments', this.departments.map((dept: any) => ({
            id: dept.value,
            name: dept.label
          })));
        } else {
          console.error('Failed to load departments:', response.message || 'No data received');
          this.departments = [];
        }
        this.loadingDepartments = false;
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.loadingDepartments = false;
        this.departments = [];
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات الأقسام'
        });
      }
    });
  }

  private loadBranches() {
    this.loadingBranches = true;

    this.dropdownlistsService.getBranchesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.branches = response.data.parentBranches;
          console.log('Loaded branches from dropdown service:', this.branches.length);
          this.updateMultiSelectState('branches', this.branches.map((branch: any) => ({
            id: branch.value,
            name: branch.label
          })));
        } else {
          console.error('Failed to load branches:', response.message || 'No data received');
          this.branches = [];
        }
        this.loadingBranches = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.loadingBranches = false;
        this.branches = [];
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات الفروع'
        });
      }
    });
  }

  private loadRoles() {
    this.loadingRoles = true;
    const lang = this.currentLang;

    this.dropdownlistsService.getEmployeeRolesDropdownList(lang).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.roles = response.data.dropdownListsForRoleModuleRights;
          console.log('Loaded roles:', this.roles.length);
          this.updateMultiSelectState('roles', this.roles.map(job => ({
            id: job.value,
            name: job.label
          })));
        } else {
          console.error('Failed to load roles:', response.message);
        }
        this.loadingRoles = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.loadingRoles = false;
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات الوظائف'
        });
      }
    });
  }

  private loadStatuses() {
    this.loadingStatuses = true;

    this.dropdownlistsService.getGetRequestStatsDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.statuses = response.data.statuses.map((status: any) => ({
            id: status.value,
            name: status.label
          }));
          console.log('Loaded statuses from dropdown service:', this.statuses.length);
        } else {
          console.error('Failed to load statuses:', response.message || 'No data received');
          this.statuses = [];
        }
        this.loadingStatuses = false;
      },
      error: (error) => {
        console.error('Error loading statuses:', error);
        this.loadingStatuses = false;
        this.statuses = [];
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات الحالات'
        });
      }
    });
  }

  private updateMultiSelectState(category: string, items: SelectableItem[]) {
    if (this.multiSelectStates[category]) {
      this.multiSelectStates[category].available = items;
    }
  }

  private initializeForms() {
    // Main balance form
    this.balanceForm = this.fb.group({
      allEmployee: [false],
      includeEmployees: [false],
      includeDepartments: [false],
      includeBranches: [false],
      includeRoles: [false],
      empIds: [[]],
      deptIds: [[]],
      branchIds: [[]],
      roleIds: [[]],
      stsId: [''],
      allSts: [false],
      maxPerWeek: [0],
      maxPerMonth: [0],
      maxPerYear: [0],
      forwardBalance: [false],
      countBaseContractStart: [false],
      fractionFloorCeil: [false],
      includeWeekendInBetween: [false],
      note: ['']
    });

    // Search form
    this.searchForm = this.fb.group({
      pageSize: [10]
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


selectColumn(col: any) {
    this.selectedColumn = col.column;
    this.selectedColumnLabel = col.label;
  }
  // Pagination computed properties
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.paginationRequest.pageSize);
  }

  get currentPageStart(): number {
    return (this.currentPage - 1) * this.paginationRequest.pageSize + 1;
  }

  get currentPageEnd(): number {
    const end = this.currentPage * this.paginationRequest.pageSize;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  // Getters for data
  get statusOptions() { return this.statuses; }

  // Form validation getters
  get isBalanceFormValid(): boolean {
    return this.balanceForm.valid && this.validateEmployeeSelectionForUI();
  }

  private validateEmployeeSelectionForUI(): boolean {
    const formValue = this.balanceForm.value;
    
    // If all employees is selected, validation passes
    if (formValue.allEmployee) {
      return true;
    }

    // Check if at least one group is selected
    const hasEmployees = formValue.includeEmployees && formValue.empIds?.length > 0;
    const hasDepartments = formValue.includeDepartments && formValue.deptIds?.length > 0;
    const hasBranches = formValue.includeBranches && formValue.branchIds?.length > 0;
    const hasRoles = formValue.includeRoles && formValue.roleIds?.length > 0;

    return hasEmployees || hasDepartments || hasBranches || hasRoles;
  }


  // Selection state getters
  get isAllSelected(): boolean {
    return this.employeeBalances.length > 0 && this.selectedItems.length === this.employeeBalances.length;
  }

  get isPartiallySelected(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.length < this.employeeBalances.length;
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadEmployeeBalances();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadEmployeeBalances();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadEmployeeBalances();
    }
  }

  onPageSizeChange() {
    const newPageSize = this.searchForm.get('pageSize')?.value;
    this.paginationRequest.pageSize = newPageSize;
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadEmployeeBalances();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadEmployeeBalances();
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

    // Update form arrays
    this.updateFormArrays(category);
  }

  clearSelection(category: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.selected = [];
      this.updateFormArrays(category);
    }
  }

  private updateFormArrays(category: string): void {
    const state = this.multiSelectStates[category];
    if (!state) return;

    const selectedIds = state.selected.map(item => item.id);
    
    switch (category) {
      case 'employees':
        this.selectedEmployeeIds = selectedIds as number[];
        this.balanceForm.patchValue({ empIds: this.selectedEmployeeIds });
        break;
      case 'departments':
        this.selectedDepartmentIds = selectedIds as number[];
        this.balanceForm.patchValue({ deptIds: this.selectedDepartmentIds });
        break;
      case 'branches':
        this.selectedBranchIds = selectedIds as number[];
        this.balanceForm.patchValue({ branchIds: this.selectedBranchIds });
        break;
      case 'roles':
        this.selectedRoleIds = selectedIds as number[];
        this.balanceForm.patchValue({ roleIds: this.selectedRoleIds });
        break;
    }
  }

  updateSearchTerm(category: string, searchTerm: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.searchTerm = searchTerm;
    }
  }

  getSelectedCount(category: string): number {
    const state = this.multiSelectStates[category];
    return state ? state.selected.length : 0;
  }

  // Methods for Select All functionality in dropdowns
  selectAllItems(category: string): void {
    const state = this.multiSelectStates[category];
    if (!state) return;

    state.selected = [...state.available];
    this.updateFormArrays(category);
  }

  hasSelectableItems(category: string): boolean {
    const state = this.multiSelectStates[category];
    return state ? state.available.length > 0 : false;
  }

  areAllItemsSelected(category: string): boolean {
    const state = this.multiSelectStates[category];
    if (!state || state.available.length === 0) return false;
    return state.selected.length === state.available.length;
  }

  // Modal and form methods
  addBalance() {
    this.isEditMode = false;
    this.showAddModal = true;
    this.resetForm();
    // Load all dropdown data when modal opens
    this.loadAllData();
  }

  closeModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  private resetForm() {
    this.balanceForm.reset();
    this.balanceForm.patchValue({
      allEmployee: false,
      includeEmployees: false,
      includeDepartments: false,
      includeBranches: false,
      includeRoles: false,
      empIds: [],
      deptIds: [],
      branchIds: [],
      roleIds: [],
      allSts: false,
      maxPerWeek: 0,
      maxPerMonth: 0,
      maxPerYear: 0,
      forwardBalance: false,
      countBaseContractStart: false,
      fractionFloorCeil: false,
      includeWeekendInBetween: false
    });
    
    // Reset selected IDs arrays
    this.selectedEmployeeIds = [];
    this.selectedDepartmentIds = [];
    this.selectedBranchIds = [];
    this.selectedRoleIds = [];
    
    this.initializeMultiSelectStates();
  }

  // Form workflow event handlers
  onEmployeeTypeChange() {
    const allEmployeeChecked = this.balanceForm.get('allEmployee')?.value;
    
    if (allEmployeeChecked) {
      // When "All Employees" is checked, uncheck and clear all specific selections
      this.balanceForm.patchValue({
        includeEmployees: false,
        includeDepartments: false,
        includeBranches: false,
        includeRoles: false,
        empIds: [],
        deptIds: [],
        branchIds: [],
        roleIds: []
      });
      
      // Clear all multi-select states
      this.initializeMultiSelectStates();
      this.selectedEmployeeIds = [];
      this.selectedDepartmentIds = [];
      this.selectedBranchIds = [];
      this.selectedRoleIds = [];
    }
  }

  onGroupTypeChange(groupType: string) {
    const isChecked = this.balanceForm.get(`include${this.capitalizeFirst(groupType)}`)?.value;
    
    if (!isChecked) {
      this.clearSelection(groupType);
    }
    
    // If any specific group is selected, uncheck "All Employees"
    const anyGroupSelected = this.balanceForm.get('includeEmployees')?.value ||
                           this.balanceForm.get('includeDepartments')?.value ||
                           this.balanceForm.get('includeBranches')?.value ||
                           this.balanceForm.get('includeRoles')?.value;
    
    if (anyGroupSelected) {
      this.balanceForm.patchValue({ allEmployee: false });
    }
  }

  onStatusTypeChange() {
    if (this.balanceForm.get('allSts')?.value) {
      this.balanceForm.patchValue({ stsId: '' });
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Core business methods
  submitBalance() {
    if (!this.balanceForm.valid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى ملء جميع الحقول المطلوبة'
      });
      return;
    }

    // Additional validation for employee selection
    if (!this.validateEmployeeSelection()) {
      return;
    }

    const formData = this.prepareFormData();
    
    if (this.isEditMode && this.selectedBalance) {
      this.updateBalance(formData);
    } else {
      this.addNewBalance(formData);
    }
  }

  private validateEmployeeSelection(): boolean {
    const formValue = this.balanceForm.value;
    
    // If all employees is selected, no additional validation needed
    if (formValue.allEmployee) {
      return true;
    }

    // Check if at least one group is selected
    const hasEmployees = formValue.includeEmployees && formValue.empIds?.length > 0;
    const hasDepartments = formValue.includeDepartments && formValue.deptIds?.length > 0;
    const hasBranches = formValue.includeBranches && formValue.branchIds?.length > 0;
    const hasRoles = formValue.includeRoles && formValue.roleIds?.length > 0;

    if (!hasEmployees && !hasDepartments && !hasBranches && !hasRoles) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى اختيار "جميع الموظفين" أو تحديد موظفين/أقسام/فروع/وظائف محددة'
      });
      return false;
    }

    return true;
  }

  private prepareFormData(): any {
    const formValue = this.balanceForm.value;
    
    return {
      allEmployee: formValue.allEmployee,
      empIds: formValue.allEmployee ? [] : formValue.empIds || [],
      deptIds: formValue.allEmployee ? [] : formValue.deptIds || [],
      branchIds: formValue.allEmployee ? [] : formValue.branchIds || [],
      roleIds: formValue.allEmployee ? [] : formValue.roleIds || [],
      stsId: formValue.stsId,
      allSts: formValue.allSts,
      maxPerWeek: formValue.maxPerWeek,
      maxPerMonth: formValue.maxPerMonth,
      maxPerYear: formValue.maxPerYear,
      forwardBalance: formValue.forwardBalance,
      countBaseContractStart: formValue.countBaseContractStart,
      fractionFloorCeil: formValue.fractionFloorCeil,
      includeWeekendInBetween: formValue.includeWeekendInBetween,
      note: formValue.note
    };
  }

  private addNewBalance(formData: any) {
    const allEmployee = formData.allEmployee;
    
    if (allEmployee) {
      // If "For Everyone" is selected, call all 4 endpoints
      this.processAllEndpoints(formData);
    } else {
      // If specific groups are selected, call only relevant endpoints
      this.processSpecificEndpoints(formData);
    }
  }

  /**
   * Process all endpoints when "For Everyone" is selected
   * Calls: process-employees, process-depts, process-branches, process-roles
   */
  private processAllEndpoints(formData: any) {
    const baseData = {
      allEmployee: true,
      stsId: formData.stsId,
      allSts: formData.allSts,
      maxPerWeek: formData.maxPerWeek,
      maxPerMonth: formData.maxPerMonth,
      maxPerYear: formData.maxPerYear,
      forwardBalance: formData.forwardBalance,
      countBaseContractStart: formData.countBaseContractStart,
      fractionFloorCeil: formData.fractionFloorCeil,
      includeWeekendInBetween: formData.includeWeekendInBetween,
      note: formData.note
    };

    // Prepare data for each endpoint with empty arrays since allEmployee = true
    const employeeData = { ...baseData, empIds: [] };
    const departmentData = { ...baseData, deptIds: [] };
    const branchData = { ...baseData, branchIds: [] };
    const roleData = { ...baseData, roleIds: [] };

    // Call all endpoints
    this.callMultipleEndpoints([
      { name: 'الموظفين', method: this.employeeBalanceService.processEmployee(employeeData, this.currentLang) },
      { name: 'الأقسام', method: this.employeeBalanceService.processDepartments(departmentData, this.currentLang) },
      { name: 'الفروع', method: this.employeeBalanceService.processBranches(branchData, this.currentLang) },
      { name: 'الوظائف', method: this.employeeBalanceService.processRoles(roleData, this.currentLang) }
    ]);
  }

  /**
   * Process specific endpoints based on user selections
   * Only calls endpoints for selected groups
   */
  private processSpecificEndpoints(formData: any) {
    const baseData = {
      allEmployee: false,
      stsId: formData.stsId,
      allSts: formData.allSts,
      maxPerWeek: formData.maxPerWeek,
      maxPerMonth: formData.maxPerMonth,
      maxPerYear: formData.maxPerYear,
      forwardBalance: formData.forwardBalance,
      countBaseContractStart: formData.countBaseContractStart,
      fractionFloorCeil: formData.fractionFloorCeil,
      includeWeekendInBetween: formData.includeWeekendInBetween,
      note: formData.note
    };

    const endpoints = [];

    // Add endpoints based on selected groups
    if (formData.empIds && formData.empIds.length > 0) {
      const employeeData = { ...baseData, empIds: formData.empIds };
      endpoints.push({ name: 'الموظفين', method: this.employeeBalanceService.processEmployee(employeeData, this.currentLang) });
    }

    if (formData.deptIds && formData.deptIds.length > 0) {
      const departmentData = { ...baseData, deptIds: formData.deptIds };
      endpoints.push({ name: 'الأقسام', method: this.employeeBalanceService.processDepartments(departmentData, this.currentLang) });
    }

    if (formData.branchIds && formData.branchIds.length > 0) {
      const branchData = { ...baseData, branchIds: formData.branchIds };
      endpoints.push({ name: 'الفروع', method: this.employeeBalanceService.processBranches(branchData, this.currentLang) });
    }

    if (formData.roleIds && formData.roleIds.length > 0) {
      const roleData = { ...baseData, roleIds: formData.roleIds };
      endpoints.push({ name: 'الوظائف', method: this.employeeBalanceService.processRoles(roleData, this.currentLang) });
    }

    if (endpoints.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى اختيار مجموعة واحدة على الأقل'
      });
      return;
    }

    this.callMultipleEndpoints(endpoints);
  }

  /**
   * Execute multiple API calls and track their success/failure
   */
  private callMultipleEndpoints(endpoints: Array<{ name: string, method: any }>) {
    let successCount = 0;
    let errorCount = 0;
    let totalEndpoints = endpoints.length;
    const successMessages: string[] = [];
    const errorMessages: string[] = [];

    endpoints.forEach(endpoint => {
      endpoint.method.subscribe({
        next: (response: any) => {
          successCount++;
          successMessages.push(`تم معالجة ${endpoint.name} بنجاح`);
          console.log(`Success processing ${endpoint.name}:`, response);
          
          // Check if all endpoints have completed
          if (successCount + errorCount === totalEndpoints) {
            this.showFinalResults(successMessages, errorMessages);
          }
        },
        error: (error: any) => {
          errorCount++;
          errorMessages.push(`فشل في معالجة ${endpoint.name}`);
          console.error(`Error processing ${endpoint.name}:`, error);
          
          // Check if all endpoints have completed
          if (successCount + errorCount === totalEndpoints) {
            this.showFinalResults(successMessages, errorMessages);
          }
        }
      });
    });
  }

  /**
   * Display final results to user after all API calls complete
   */
  private showFinalResults(successMessages: string[], errorMessages: string[]) {
    // Show success messages
    if (successMessages.length > 0) {
      this.messageService.add({
        severity: 'success',
        summary: 'نجح',
        detail: successMessages.join('\n'),
        life: 5000
      });
    }

    // Show error messages
    if (errorMessages.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: errorMessages.join('\n'),
        life: 5000
      });
    }

    // Reload data and close modal if at least one endpoint succeeded
    if (successMessages.length > 0) {
      this.loadEmployeeBalances();
      this.closeModal();
    }
  }

  private updateBalance(formData: any) {
    const updateData = {
      recId: this.selectedBalance!.recId,
      ...formData
    };
    
    this.employeeBalanceService.updateEmployeeHandleBalance(updateData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجح',
          detail: 'تم تحديث توازن الموظف بنجاح'
        });
        this.loadEmployeeBalances();
        this.closeModal();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحديث توازن الموظف'
        });
      }
    });
  }

loadEmployeeBalances() {
  this.loading = true;

  let searchValue: any = this.searchTerm?.trim();

  const lowerTerm = searchValue?.toLowerCase();

  // Boolean filters
  if (["allEmployee", "allSts", "forwardBalance", "fractionFloorCeil", "countBaseContractStart", "includeWeekendInBetween"]
      .includes(this.selectedColumn)) {
    if (lowerTerm === "yes" || lowerTerm === "نعم") searchValue = true;
    else if (lowerTerm === "no" || lowerTerm === "لا") searchValue = false;
    else searchValue = null;
  }

  // Numeric filters
  if (["maxPerWeek", "maxPerMonth", "maxPerYear"].includes(this.selectedColumn)) {
    const num = Number(searchValue);
    searchValue = isNaN(num) ? null : num;
  }

  // Strings & global search (allFields) remain as-is

  this.employeeBalanceService.getEmployeeHandlesBalance(
    this.currentLang.toString(),
    this.paginationRequest.pageNumber,
    this.paginationRequest.pageSize,
    this.selectedColumn,
    searchValue
  ).subscribe({
    next: (response: any) => {
      const typedResponse = response as EmployeeHandlesBalanceResponse;
      this.employeeBalances = typedResponse.data;
      this.totalRecords = typedResponse.totalCount;
      this.loading = false;
    },
    error: () => {
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'فشل في تحميل بيانات توازن الموظفين'
      });
      this.loading = false;
    }
  });
}



  editBalance(balance: EmployeeHandleBalance) {
    this.isEditMode = true;
    this.selectedBalance = balance;

    // Reset form first
    this.resetForm();

    // Patch all form values
    this.balanceForm.patchValue({
      allEmployee: balance.allEmployee,
      includeEmployees: !!balance.empId,
      includeDepartments: !!balance.deptId,
      includeBranches: !!balance.branchId,
      includeRoles: !!balance.roleId,
      empIds: balance.empId ? [balance.empId] : [],
      deptIds: balance.deptId ? [balance.deptId] : [],
      branchIds: balance.branchId ? [balance.branchId] : [],
      roleIds: balance.roleId ? [balance.roleId] : [],
      stsId: balance.stsId ?? '',
      empId: balance.empId ?? '',
      deptId: balance.deptId ?? '',
      branchId: balance.branchId ?? '',
      roleId: balance.roleId ?? '',
      allSts: balance.allSts,
      maxPerWeek: balance.maxPerWeek ?? 0,
      maxPerMonth: balance.maxPerMonth ?? 0,
      maxPerYear: balance.maxPerYear ?? 0,
      forwardBalance: balance.forwardBalance,
      countBaseContractStart: balance.countBaseContractStart,
      fractionFloorCeil: balance.fractionFloorCeil,
      includeWeekendInBetween: balance.includeWeekendInBetween,
      note: balance.note
    });

    // Set selected IDs arrays
    this.selectedEmployeeIds = balance.empId ? [balance.empId] : [];
    this.selectedDepartmentIds = balance.deptId ? [balance.deptId] : [];
    this.selectedBranchIds = balance.branchId ? [balance.branchId] : [];
    this.selectedRoleIds = balance.roleId ? [balance.roleId] : [];

    // Set multiSelectStates for UI
    if (balance.empId) {
      const employee = this.employees.find(emp => emp.empId === balance.empId);
      if (employee) {
        this.multiSelectStates['employees'].selected = [{ id: employee.empId, name: employee.empName }];
      }
    }
    if (balance.deptId) {
      const department = this.departments.find(dept => dept.deptId === balance.deptId);
      if (department) {
        this.multiSelectStates['departments'].selected = [{ id: department.deptId, name: department.deptName }];
      }
    }
    if (balance.branchId) {
      const branch = this.branches.find(br => br.branchId === balance.branchId);
      if (branch) {
        this.multiSelectStates['branches'].selected = [{ id: branch.branchId, name: branch.branchName }];
      }
    }
    if (balance.roleId) {
      const role = this.roles.find(r => r.jobId === balance.roleId);
      if (role) {
        const roleName = this.currentLang === 2 ? role.arTitle : role.enTitle;
        this.multiSelectStates['roles'].selected = [{ id: role.jobId, name: roleName }];
      }
    }

    // Load all dropdown data when modal opens for editing
    this.loadAllData();
    this.showAddModal = true;
  }

  deleteBalance(balance: EmployeeHandleBalance) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من أنك تريد حذف هذا السجل؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employeeBalanceService.deleteEmployeeHandleBalance(balance.recId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'نجح',
              detail: 'تم حذف السجل بنجاح'
            });
            this.loadEmployeeBalances();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'فشل في حذف السجل'
            });
          }
        });
      }
    });
  }

  // Selection methods
  isSelected(balance: EmployeeHandleBalance): boolean {
    return this.selectedItems.some(item => item.recId === balance.recId);
  }

  toggleSelection(balance: EmployeeHandleBalance) {
    const index = this.selectedItems.findIndex(item => item.recId === balance.recId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(balance);
    }
  }

  toggleSelectAll() {
    if (this.selectedItems.length === this.employeeBalances.length) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.employeeBalances];
    }
  }

  deleteSelected() {
    if (this.selectedItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى اختيار عنصر واحد على الأقل للحذف'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `هل أنت متأكد من أنك تريد حذف ${this.selectedItems.length} عنصر؟`,
      header: 'تأكيد حذف العناصر المحددة',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletePromises = this.selectedItems.map(item => 
          this.employeeBalanceService.deleteEmployeeHandleBalance(item.recId).toPromise()
        );

        Promise.all(deletePromises).then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجح',
            detail: 'تم حذف العناصر المحددة بنجاح'
          });
          this.selectedItems = [];
          this.loadEmployeeBalances();
        }).catch(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل في حذف بعض العناصر'
          });
        });
      }
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.balanceForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.balanceForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors?.['required']) {
      return 'هذا الحقل مطلوب';
    }
    return '';
  }
}
