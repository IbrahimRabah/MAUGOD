import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MultiSelect } from 'primeng/multiselect';
import { RequestPostPermissionsService } from '../../services/request-post-permissions.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { RequestPostPermission, ProcessEmployeeDto, ProcessDepartmentDto, ProcessBranchesDto, ProcessRolesDto, ProcessManagersOfDepartmentsDto, ProcessManagersOfBranchesDto, ProcessEveryOneDto } from '../../../../core/models/RequestPostPermission ';

interface DropdownItem {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-request-post-premisions',
  templateUrl: './request-post-premisions.component.html',
  styleUrl: './request-post-premisions.component.css',
  providers: [MessageService, ConfirmationService]
})
export class RequestPostPremisionsComponent implements OnInit, OnDestroy {
  // ViewChild references for multiselect components
  @ViewChild('targetDropdown') targetDropdown!: MultiSelect;
  @ViewChild('statusDropdown') statusDropdown!: MultiSelect;
  
  // Core component state
  requestPostPermissions: RequestPostPermission[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  showCreateModal = false;
  
  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic (2) - made public for template access
  private empId: number = 0;
  
  // Reactive Forms
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  createForm!: FormGroup;
  
  // Selected items for bulk operations
  selectedItems: RequestPostPermission[] = [];
  selectAll = false;

  // Dropdown data with caching
  statuses: DropdownItem[] = [];
  employees: DropdownItem[] = [];
  departments: DropdownItem[] = [];
  branches: DropdownItem[] = [];
  roles: DropdownItem[] = [];
  
  // Cache flags to avoid duplicate API calls
  private dataCache = {
    statuses: false,
    employees: false,
    departments: false,
    branches: false,
    roles: false
  };
  
  // Loading states for dropdowns
  loadingStatuses = false;
  loadingEmployees = false;
  loadingDepartments = false;
  loadingBranches = false;
  loadingRoles = false;
  
  // Target type options
  targetTypeOptions = [
    { id: 1, name: 'Employee', nameAr: 'موظف' },
    { id: 2, name: 'Department', nameAr: 'قسم' },
    { id: 3, name: 'Branch', nameAr: 'فرع' },
    { id: 4, name: 'Role', nameAr: 'دور' },
    { id: 5, name: 'Manager of Department', nameAr: 'مدير القسم' },
    { id: 6, name: 'Manager of Branch', nameAr: 'مدير الفرع' }
  ];
  
  // Multi-select states
  selectedTargetItems: DropdownItem[] = [];
  selectedTargetIds: (string | number)[] = [];
  selectedStatusItems: DropdownItem[] = [];
  selectedStatusIds: (string | number)[] = [];

  constructor(
    private requestPostPermissionsService: RequestPostPermissionsService,
    private authService: AuthenticationService,
    private dropdownlistsService: DropdownlistsService,
    public langService: LanguageService,
    private messageService: MessageService,
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
      this.loadRequestPostPermissions();
    });

    this.setupSearchDebouncing();
    this.loadRequestPostPermissions();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  private initializeForms() {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [this.pageSize]
    });

    this.filterForm = this.fb.group({
      // Add filter controls as needed
    });

    this.createForm = this.fb.group({
      everyoneType: [true, Validators.required], // Default to everyone (true)
      targetType: [1], // Default to Employee (1)
      selectedTargets: [[]],
      selectedStatuses: [[], Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
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
        this.loadRequestPostPermissions();
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
  loadRequestPostPermissions() {
    this.loading = true;
    this.requestPostPermissionsService.getRequestPostPermissions(
      this.currentLang,
      this.pageSize,
      this.currentPage
    ).subscribe({
      next: (response) => {
        this.requestPostPermissions = response.data || [];
        this.totalRecords = response.totalCount || 0;
        this.loading = false;
        this.resetSelection();
      },
      error: (error) => {
        console.error('Error loading request post permissions:', error);
        this.showErrorMessage('Failed to load request post permissions');
        this.loading = false;
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRequestPostPermissions();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadRequestPostPermissions();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadRequestPostPermissions();
    }
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')!.value;
    this.currentPage = 1;
    this.loadRequestPostPermissions();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadRequestPostPermissions();
  }

  // Selection methods
  onSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      // Only select items where recId !== -1
      this.selectedItems = this.requestPostPermissions.filter(item => item.recId !== -1);
    } else {
      this.selectedItems = [];
    }
  }

  onItemSelect(item: RequestPostPermission) {
    // Don't allow selection of items with recId === -1
    if (item.recId === -1) {
      return;
    }

    const index = this.selectedItems.findIndex(selected => selected.recId === item.recId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
    this.updateSelectAllState();
  }

  private updateSelectAllState() {
    const selectableItems = this.requestPostPermissions.filter(item => item.recId !== -1);
    this.selectAll = selectableItems.length > 0 && 
                    selectableItems.every(item => 
                      this.selectedItems.some(selected => selected.recId === item.recId)
                    );
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

    const itemCount = this.selectedItems.length;
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${itemCount} selected permission(s)?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const idsToDelete = this.selectedItems.map(item => item.recId);
        this.performDeleteSelected(idsToDelete);
      }
    });
  }

  deleteRequestPostPermission(item: RequestPostPermission) {
    // Don't allow deletion of items with recId === -1
    if (item.recId === -1) {
      this.showWarningMessage('This item cannot be deleted');
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this permission?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDelete(item.recId);
      }
    });
  }

  private performDelete(id: number) {
    this.requestPostPermissionsService.deleteStatusPermission(this.currentLang, id).subscribe({
      next: () => {
        this.showSuccessMessage('Permission deleted successfully');
        this.loadRequestPostPermissions();
      },
      error: (error) => {
        console.error('Error deleting permission:', error);
        this.showErrorMessage('Failed to delete permission');
      }
    });
  }

  private performDeleteSelected(ids: number[]) {
    this.requestPostPermissionsService.deleteSelectedPermissions(ids, this.currentLang).subscribe({
      next: () => {
        this.showSuccessMessage(`${ids.length} permission(s) deleted successfully`);
        this.loadRequestPostPermissions();
      },
      error: (error) => {
        console.error('Error deleting selected permissions:', error);
        this.showErrorMessage('Failed to delete selected permissions');
      }
    });
  }

  // Helper methods
  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(this.currentLang === 2 ? 'ar-SA' : 'en-US');
    } catch {
      return dateString;
    }
  }

  getEmployeeName(item: RequestPostPermission): string {
    return this.currentLang === 2 ? (item.empNameAr || '') : (item.empNameEn || item.empNameAr || '');
  }

  getDepartmentName(item: RequestPostPermission): string {
    if (!item.deptNameAr && !item.deptNameEn) return '-';
    return this.currentLang === 2 ? (item.deptNameAr || '') : (item.deptNameEn || item.deptNameAr || '');
  }

  getBranchName(item: RequestPostPermission): string {
    if (!item.branchNameAr && !item.branchNameEn) return '-';
    return this.currentLang === 2 ? (item.branchNameAr || '') : (item.branchNameEn || item.branchNameAr || '');
  }

  getRoleName(item: RequestPostPermission): string {
    if (!item.roleNameAr && !item.roleNameEn) return '-';
    return this.currentLang === 2 ? (item.roleNameAr || '') : (item.roleNameEn || item.roleNameAr || '');
  }

  getManagerOfDepartmentName(item: RequestPostPermission): string {
    if (!item.mgrDeptNameAr && !item.mgrDeptNameEn) return '-';
    return this.currentLang === 2 ? (item.mgrDeptNameAr || '') : (item.mgrDeptNameEn || item.mgrDeptNameAr || '');
  }

  getManagerOfBranchName(item: RequestPostPermission): string {
    if (!item.mgrBranchNameAr && !item.mgrBranchNameEn) return '-';
    return this.currentLang === 2 ? (item.mgrBranchNameAr || '') : (item.mgrBranchNameEn || item.mgrBranchNameAr || '');
  }

  getStatusName(item: RequestPostPermission): string {
    return this.currentLang === 2 ? (item.stsNameAr || '') : (item.stsNameEn || item.stsNameAr || '');
  }

  private showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: detail
    });
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: detail
    });
  }

  private showWarningMessage(detail: string) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: detail
    });
  }

  // Edit method (placeholder for future implementation)
  editRequestPostPermission(item: RequestPostPermission) {
    // TODO: Implement edit functionality
    console.log('Edit functionality not implemented yet', item);
    this.showWarningMessage('Edit functionality will be implemented in the next phase');
  }

  // Check if item can be deleted or selected
  canDeleteOrSelect(item: RequestPostPermission): boolean {
    return item.recId !== -1;
  }

  // Check if item is selected
  isItemSelected(item: RequestPostPermission): boolean {
    return this.selectedItems.some(selected => selected.recId === item.recId);
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
    this.showCreateModal = true;
    this.resetCreateForm();
    this.loadStatuses();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetCreateForm();
    this.resetDataCache();
  }

  // Reset multiselect states
  private resetCreateForm() {
    this.createForm.reset({
      everyoneType: true, // Default to everyone
      targetType: 1, // Default to Employee
      selectedTargets: [],
      selectedStatuses: [],
      startDate: '',
      endDate: '',
      note: ''
    });
    this.selectedTargetItems = [];
    this.selectedTargetIds = [];
    this.selectedStatusItems = [];
    this.selectedStatusIds = [];
  }

  private resetDataCache() {
    this.dataCache = {
      statuses: false,
      employees: false,
      departments: false,
      branches: false,
      roles: false
    };
  }

  // Form type change handlers
  onEveryoneTypeChange() {
    this.createForm.get('selectedTargets')?.setValue([]);
    this.selectedTargetItems = [];
    this.selectedTargetIds = [];
    
    if (this.createForm.get('everyoneType')?.value) {
      // When everyone is selected, remove validation for selectedTargets
      this.createForm.get('selectedTargets')?.clearValidators();
    } else {
      // When not everyone, require selectedTargets and default to Employee
      this.createForm.get('selectedTargets')?.setValidators([Validators.required]);
      this.createForm.get('targetType')?.setValue(1); // Default to Employee
      this.loadTargetDataIfNeeded();
    }
    this.createForm.get('selectedTargets')?.updateValueAndValidity();
  }

  onTargetTypeChange() {
    this.createForm.get('selectedTargets')?.setValue([]);
    this.selectedTargetItems = [];
    this.selectedTargetIds = [];
    this.loadTargetDataIfNeeded();
  }

  // New methods for radio button clicks that also open dropdowns
  selectEveryoneType(isEveryone: boolean) {
    this.createForm.get('everyoneType')?.setValue(isEveryone);
    this.onEveryoneTypeChange();
  }

  selectTargetType(targetTypeId: number) {
    this.createForm.get('targetType')?.setValue(targetTypeId);
    this.onTargetTypeChange();
  }

  // Load target data only if not already cached
  private loadTargetDataIfNeeded() {
    if (this.createForm.get('everyoneType')?.value) return;
    
    const targetType = this.createForm.get('targetType')?.value;
    this.loadTargetData(targetType);
  }

  // Handle dropdown show events
  onDropdownShow(type: 'target' | 'status') {
    if (type === 'target') {
      this.loadTargetDataIfNeeded();
    } else if (type === 'status') {
      this.loadStatuses();
    }
  }

  // Target selection change handler
  onTargetSelectionChange(selectedIds: (string | number)[]) {
    this.selectedTargetIds = selectedIds;
    this.selectedTargetItems = this.currentTargetOptions.filter(item => 
      selectedIds.includes(item.value)
    );
    this.createForm.get('selectedTargets')?.setValue(selectedIds);
  }

  // Status selection change handler
  onStatusSelectionChange(selectedIds: (string | number)[]) {
    this.selectedStatusIds = selectedIds;
    this.selectedStatusItems = this.statuses.filter(item => 
      selectedIds.includes(item.value)
    );
    this.createForm.get('selectedStatuses')?.setValue(selectedIds);
  }

  // Check if form is valid for submission
  get isFormValid(): boolean {
    return this.createForm.valid;
  }

  // Get label for selected items in multiselect
  getSelectedTargetItemsLabel(): string {
    if (this.selectedTargetItems.length === 0) return '';
    if (this.selectedTargetItems.length === 1) {
      return this.selectedTargetItems[0].label;
    }
    return `${this.selectedTargetItems.length} items selected`;
  }

  getSelectedStatusItemsLabel(): string {
    if (this.selectedStatusItems.length === 0) return '';
    if (this.selectedStatusItems.length === 1) {
      return this.selectedStatusItems[0].label;
    }
    return `${this.selectedStatusItems.length} statuses selected`;
  }

  // Load target data based on target type
  private loadTargetData(targetType: number) {
    switch (targetType) {
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
      case 5: // Manager of Department
        this.loadDepartments(); // Same as departments
        break;
      case 6: // Manager of Branch
        this.loadBranches(); // Same as branches
        break;
    }
  }

  // Get current target options based on target type
  get currentTargetOptions(): DropdownItem[] {
    const targetType = this.createForm.get('targetType')?.value;
    switch (targetType) {
      case 1: return this.employees;
      case 2: return this.departments;
      case 3: return this.branches;
      case 4: return this.roles;
      case 5: return this.departments;
      case 6: return this.branches;
      default: return [];
    }
  }

  // Dropdown loading methods
  private loadStatuses() {
    if (this.dataCache.statuses) return;
    
    this.loadingStatuses = true;
    this.dropdownlistsService.getEmployeeStatusesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        // Handle API response format { data: { statuses: [{ label, value }] } }
        const statusData = response.data?.statuses || response.data?.dropdownListsForRoleModuleRights || [];
        this.statuses = Array.isArray(statusData) ? statusData : [];
        this.dataCache.statuses = true;
        this.loadingStatuses = false;
      },
      error: (error) => {
        console.error('Error loading statuses:', error);
        this.showErrorMessage('Failed to load statuses');
        this.loadingStatuses = false;
      }
    });
  }

  private loadEmployees() {
    if (this.dataCache.employees) return;
    
    this.loadingEmployees = true;
    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, this.empId).subscribe({
      next: (response) => {
        // Handle API response format { data: { employees: [{ label, value }] } }
        const employeeData = response.data?.employees || response.data?.dropdownListsForRoleModuleRights || [];
        this.employees = Array.isArray(employeeData) ? employeeData : [];
        this.dataCache.employees = true;
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
        // Handle API response format { data: { departments: [{ label, value }] } }
        const departmentData = response.data?.departments || response.data?.dropdownListsForRoleModuleRights || [];
        this.departments = Array.isArray(departmentData) ? departmentData : [];
        this.dataCache.departments = true;
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
        // Handle API response format { data: { parentBranches: [{ label, value }] } }
        const branchData = response.data?.parentBranches || response.data?.dropdownListsForRoleModuleRights || [];
        this.branches = Array.isArray(branchData) ? branchData : [];
        this.dataCache.branches = true;
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
        // Handle API response format { data: { dropdownListsForRoleModuleRights: [{ label, value }] } }
        const roleData = response.data?.dropdownListsForRoleModuleRights || [];
        this.roles = Array.isArray(roleData) ? roleData : [];
        this.dataCache.roles = true;
        this.loadingRoles = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.showErrorMessage('Failed to load roles');
        this.loadingRoles = false;
      }
    });
  }

  // Submit create form
  submitCreate() {
    if (!this.isFormValid) {
      this.markFormGroupTouched(this.createForm);
      this.showWarningMessage('Please fill all required fields correctly');
      return;
    }

    const formValue = this.createForm.value;
    const isEveryone = formValue.everyoneType;
    const targetType = formValue.targetType;
    const startDate = this.formatDateForApi(formValue.startDate);
    const endDate = this.formatDateForApi(formValue.endDate);
    const note = formValue.note || '';
    // Convert statusIds to array of strings
    const statusIds: string[] = formValue.selectedStatuses.map((id: any) => String(id));

    if (isEveryone) {
      const payload: ProcessEveryOneDto = {
        stsIds: statusIds,
        everyone: 1,
        sDate: startDate,
        eDate: endDate,
        note: note
      };
      this.processEveryOne(payload);
    } else {
      // Convert targetIds to array of numbers
      const targetIds: number[] = formValue.selectedTargets.map((id: any) => Number(id));
      
      switch (targetType) {
        case 1: // Employee
          const employeePayload: ProcessEmployeeDto = {
            stsIds: statusIds,
            empIds: targetIds,
            everyone: 0,
            sDate: startDate,
            eDate: endDate,
            note: note
          };
          this.processEmployee(employeePayload);
          break;
          
        case 2: // Department
          const departmentPayload: ProcessDepartmentDto = {
            stsIds: statusIds,
            deptIds: targetIds,
            everyone: 0,
            sDate: startDate,
            eDate: endDate,
            note: note
          };
          this.processDepartment(departmentPayload);
          break;
          
        case 3: // Branch
          const branchPayload: ProcessBranchesDto = {
            stsIds: statusIds,
            branchIds: targetIds,
            everyone: 0,
            sDate: startDate,
            eDate: endDate,
            note: note
          };
          this.processBranches(branchPayload);
          break;
          
        case 4: // Role
          const rolePayload: ProcessRolesDto = {
            stsIds: statusIds,
            roleIds: targetIds,
            everyone: 0,
            sDate: startDate,
            eDate: endDate,
            note: note
          };
          this.processRoles(rolePayload);
          break;
          
        case 5: // Manager of Department
          const managerDeptPayload: ProcessManagersOfDepartmentsDto = {
            stsIds: statusIds,
            mgrOfDeptIds: targetIds,
            everyone: 0,
            sDate: startDate,
            eDate: endDate,
            note: note
          };
          this.processManagersOfDepartments(managerDeptPayload);
          break;
          
        case 6: // Manager of Branch
          const managerBranchPayload: ProcessManagersOfBranchesDto = {
            stsIds: statusIds,
            mgrOfBranchIds: targetIds,
            everyone: 0,
            sDate: startDate,
            eDate: endDate,
            note: note
          };
          this.processManagersOfBranches(managerBranchPayload);
          break;
      }
    }
  }

  // API call methods
  private processEveryOne(payload: ProcessEveryOneDto) {
    this.requestPostPermissionsService.processEveryOne(payload, this.currentLang).subscribe({
      next: (response) => {
        this.showSuccessMessage('Permission created successfully for everyone');
        this.closeCreateModal();
        this.loadRequestPostPermissions();
      },
      error: (error) => {
        console.error('Error creating permission for everyone:', error);
        this.showErrorMessage('Failed to create permission for everyone');
      }
    });
  }

  private processEmployee(payload: ProcessEmployeeDto) {
    this.requestPostPermissionsService.processEmployee(payload, this.currentLang).subscribe({
      next: (response) => {
        this.showSuccessMessage('Permission created successfully for employees');
        this.closeCreateModal();
        this.loadRequestPostPermissions();
      },
      error: (error) => {
        console.error('Error creating permission for employees:', error);
        this.showErrorMessage('Failed to create permission for employees');
      }
    });
  }

  private processDepartment(payload: ProcessDepartmentDto) {
    this.requestPostPermissionsService.processDepartment(payload, this.currentLang).subscribe({
      next: (response) => {
        this.showSuccessMessage('Permission created successfully for departments');
        this.closeCreateModal();
        this.loadRequestPostPermissions();
      },
      error: (error) => {
        console.error('Error creating permission for departments:', error);
        this.showErrorMessage('Failed to create permission for departments');
      }
    });
  }

  private processBranches(payload: ProcessBranchesDto) {
    this.requestPostPermissionsService.processBranches(payload, this.currentLang).subscribe({
      next: (response) => {
        this.showSuccessMessage('Permission created successfully for branches');
        this.closeCreateModal();
        this.loadRequestPostPermissions();
      },
      error: (error) => {
        console.error('Error creating permission for branches:', error);
        this.showErrorMessage('Failed to create permission for branches');
      }
    });
  }

  private processRoles(payload: ProcessRolesDto) {
    this.requestPostPermissionsService.processRoles(payload, this.currentLang).subscribe({
      next: (response) => {
        this.showSuccessMessage('Permission created successfully for roles');
        this.closeCreateModal();
        this.loadRequestPostPermissions();
      },
      error: (error) => {
        console.error('Error creating permission for roles:', error);
        this.showErrorMessage('Failed to create permission for roles');
      }
    });
  }

  private processManagersOfDepartments(payload: ProcessManagersOfDepartmentsDto) {
    this.requestPostPermissionsService.processManagersOfDepartments(payload, this.currentLang).subscribe({
      next: (response) => {
        this.showSuccessMessage('Permission created successfully for department managers');
        this.closeCreateModal();
        this.loadRequestPostPermissions();
      },
      error: (error) => {
        console.error('Error creating permission for department managers:', error);
        this.showErrorMessage('Failed to create permission for department managers');
      }
    });
  }

  private processManagersOfBranches(payload: ProcessManagersOfBranchesDto) {
    this.requestPostPermissionsService.processManagersOfBranches(payload, this.currentLang).subscribe({
      next: (response) => {
        this.showSuccessMessage('Permission created successfully for branch managers');
        this.closeCreateModal();
        this.loadRequestPostPermissions();
      },
      error: (error) => {
        console.error('Error creating permission for branch managers:', error);
        this.showErrorMessage('Failed to create permission for branch managers');
      }
    });
  }

  // Helper methods
  private formatDateForApi(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.createForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Check if form has date range error
  hasDateRangeError(): boolean {
    return !!(this.createForm.errors && this.createForm.errors['dateRangeInvalid']);
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.createForm): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
    }
    
    // Check for form-level date range validation
    if (formGroup.errors && formGroup.errors['dateRangeInvalid']) {
      if (fieldName === 'endDate') {
        return 'End date must be after start date';
      }
    }
    
    return '';
  }

  // Get target type display name
  getTargetTypeDisplayName(typeId: number): string {
    const option = this.targetTypeOptions.find(opt => opt.id === typeId);
    return option ? (this.currentLang === 2 ? option.nameAr : option.name) : '';
  }
}
