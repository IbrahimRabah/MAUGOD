import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AccessPermissionsService } from '../../services/access-permissions.service';
import { LanguageService } from '../../../../core/services/language.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { DataPermission } from '../../../../core/models/dataPermissions';
import { EmployeePermission } from '../../../../core/models/EmployeePermissions';
import { DepartmentPermission } from '../../../../core/models/DepartmentsPermissions';
import { BranchPermission } from '../../../../core/models/BranchesPermissions';
import { 
  SaveEmployeeManagerPermissionsRequest, 
  SaveDepartmentManagerPermissionsRequest, 
  SaveBranchManagerPermissionsRequest
} from '../../../../core/models/DataPermissionRequests';

interface SelectableItem {
  id: number | string;
  name: string;
}

interface MultiSelectState {
  available: SelectableItem[];
  selected: SelectableItem[];
  searchTerm: string;
}

const TO_TARGET_TYPES = {
  EMPLOYEE: 'employee',
  MANAGER_OF_DEPARTMENT: 'managerOfDepartment',
  DEPARTMENT: 'department',
  MANAGER_OF_BRANCH: 'managerOfBranch',
  BRANCH: 'branch',
  ROLE: 'role'
} as const;

@Component({
  selector: 'app-access-permissions',
  templateUrl: './access-permissions.component.html',
  styleUrl: './access-permissions.component.css',
  providers: [MessageService, ConfirmationService]
})
export class AccessPermissionsComponent implements OnInit, OnDestroy {
  
  // Table selection
  selectedTable: string = 'access'; // access, directManagers, departments, branches
  
  // Loading states
  loading: boolean = false;
  
  // Data arrays
  accessPermissions: DataPermission[] = [];
  directManagersPermissions: EmployeePermission[] = [];
  departmentsPermissions: DepartmentPermission[] = [];
  branchesPermissions: BranchPermission[] = [];
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  
  // Search
  searchTerm: string = '';
  
  // Selected items for bulk actions
  selectedItems: any[] = [];
  selectAll: boolean = false;
  
  // Language
  currentLang: number = 1; // 1 for English, 2 for Arabic
  
  // Modal state
  showCreateModal = false;
  
  // Reactive Forms
  createForm!: FormGroup;
  
  // Subscription for cleanup
  private langSubscription: Subscription = new Subscription();
  
  // Dropdown data for the modal
  employees: SelectableItem[] = [];
  departments: SelectableItem[] = [];
  branches: SelectableItem[] = [];
  roles: SelectableItem[] = [];
  managers: SelectableItem[] = [];
  branchManagers: SelectableItem[] = [];
  
  // Multi-select states for different target types
  toEmployeesMultiSelectState: MultiSelectState = {
    available: [],
    selected: [],
    searchTerm: ''
  };
  
  toDepartmentsMultiSelectState: MultiSelectState = {
    available: [],
    selected: [],
    searchTerm: ''
  };
  
  toBranchesMultiSelectState: MultiSelectState = {
    available: [],
    selected: [],
    searchTerm: ''
  };
  
  toRolesMultiSelectState: MultiSelectState = {
    available: [],
    selected: [],
    searchTerm: ''
  };
  
  toManagersOfDepartmentMultiSelectState: MultiSelectState = {
    available: [],
    selected: [],
    searchTerm: ''
  };
  
  toManagersOfBranchMultiSelectState: MultiSelectState = {
    available: [],
    selected: [],
    searchTerm: ''
  };
  
  // Loading states for dropdown data
  loadingEmployees = false;
  loadingDepartments = false;
  loadingBranches = false;
  loadingRoles = false;
  loadingManagers = false;
  loadingBranchManagers = false;
  loadingToEmployees = false;
  loadingToDepartments = false;
  loadingToBranches = false;
  loadingToRoles = false;
  loadingToManagersOfDepartment = false;
  loadingToManagersOfBranch = false;
  
  // Data loaded flags with language tracking
  private dataLoaded = {
    employees: { loaded: false, language: 0 },
    departments: { loaded: false, language: 0 },
    branches: { loaded: false, language: 0 },
    roles: { loaded: false, language: 0 },
    managers: { loaded: false, language: 0 },
    branchManagers: { loaded: false, language: 0 }
  };

  // Cache for dropdown data to avoid duplicate calls
  private dataCache = {
    employees: [] as SelectableItem[],
    departments: [] as SelectableItem[],
    branches: [] as SelectableItem[],
    roles: [] as SelectableItem[],
    managers: [] as SelectableItem[],
    branchManagers: [] as SelectableItem[]
  };
  
  constructor(
    private accessPermissionsService: AccessPermissionsService,
    public langService: LanguageService,
    private dropdownlistsService: DropdownlistsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    // Set current language
    this.currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    
    // Subscribe to language changes
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      const newLang = lang === 'ar' ? 2 : 1;
      if (this.currentLang !== newLang) {
        this.currentLang = newLang;
        this.clearDataCache(); // Clear cache when language changes
        this.loadData(); // Only reload main table data
      }
    });
    
    // Initialize form
    this.initializeForm();
    
    // Load access permissions data by default when component initializes
    this.loadData();
    this.loadBasicDropdownData();

  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  // Cache management methods
  private clearDataCache() {
    this.dataLoaded = {
      employees: { loaded: false, language: 0 },
      departments: { loaded: false, language: 0 },
      branches: { loaded: false, language: 0 },
      roles: { loaded: false, language: 0 },
      managers: { loaded: false, language: 0 },
      branchManagers: { loaded: false, language: 0 }
    };
    this.dataCache = {
      employees: [],
      departments: [],
      branches: [],
      roles: [],
      managers: [],
      branchManagers: []
    };
  }

  private isDataLoadedForCurrentLanguage(dataType: keyof typeof this.dataLoaded): boolean {
    return this.dataLoaded[dataType].loaded && this.dataLoaded[dataType].language === this.currentLang;
  }

  private markDataAsLoaded(dataType: keyof typeof this.dataLoaded) {
    this.dataLoaded[dataType] = { loaded: true, language: this.currentLang };
  }

  private initializeForm() {
    this.createForm = this.fb.group({
      // TO target type selection
      toTargetType: [TO_TARGET_TYPES.EMPLOYEE, Validators.required],
      
      // FROM fields - all available simultaneously
      fromEmpId: [0],
      fromMgrOfDeptId: [0],
      fromDeptId: [0],
      fromMgrOfBranchId: [0],
      fromBranchId: [0],
      fromRoleId: [0],
      
      // Additional fields
      changeDataEmp: [0],
      sDate: [''],
      eDate: [''],
      note: ['']
    });

    // Watch for target type changes
    this.createForm.get('toTargetType')?.valueChanges.subscribe(value => {
      if (value && this.showCreateModal) {
        // Only load data for the specific selected target type
        this.loadToTargetData(value);
        this.clearAllToSelections();
      }
    });
  }

  // Table Selection Methods
  onTableChange(tableType: string) {
    this.selectedTable = tableType;
    this.currentPage = 1;
    this.selectedItems = [];
    this.selectAll = false;
    this.searchTerm = '';
    this.loadData();
  }

  // Data Loading Methods
  loadData() {
    this.loading = true;
    
    switch (this.selectedTable) {
      case 'access':
        this.loadAccessPermissions();
        break;
      case 'directManagers':
        this.loadDirectManagersPermissions();
        break;
      case 'departments':
        this.loadDepartmentsPermissions();
        break;
      case 'branches':
        this.loadBranchesPermissions();
        break;
      default:
        this.loading = false;
    }
  }

  loadAccessPermissions() {
    this.accessPermissionsService.getPermissions(this.currentLang, this.currentPage - 1, this.pageSize)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data?.dataPermissions) {
            this.accessPermissions = response.data.dataPermissions;
            // Note: API might not return total count, using array length for now
            this.totalRecords = this.accessPermissions.length;
          } else {
            this.accessPermissions = [];
            this.totalRecords = 0;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to load access permissions'
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this.accessPermissions = [];
          this.totalRecords = 0;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load access permissions'
          });
          this.loading = false;
        }
      });
  }

  loadDirectManagersPermissions() {
    this.accessPermissionsService.getDirectManagersPermissions(this.currentLang, this.currentPage - 1, this.pageSize)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data?.items) {
            this.directManagersPermissions = response.data.items;
            this.totalRecords = this.directManagersPermissions.length;
          } else {
            this.directManagersPermissions = [];
            this.totalRecords = 0;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to load direct managers permissions'
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this.directManagersPermissions = [];
          this.totalRecords = 0;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load direct managers permissions'
          });
          this.loading = false;
        }
      });
  }

  loadDepartmentsPermissions() {
    this.accessPermissionsService.getDepartmentsManagerPermissions(this.currentLang, this.currentPage - 1, this.pageSize)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data?.items) {
            this.departmentsPermissions = response.data.items;
            this.totalRecords = this.departmentsPermissions.length;
          } else {
            this.departmentsPermissions = [];
            this.totalRecords = 0;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to load departments permissions'
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this.departmentsPermissions = [];
          this.totalRecords = 0;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load departments permissions'
          });
          this.loading = false;
        }
      });
  }

  loadBranchesPermissions() {
    this.accessPermissionsService.getBranchesManagerPermissions(this.currentLang, this.currentPage - 1, this.pageSize)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data?.items) {
            this.branchesPermissions = response.data.items;
            this.totalRecords = this.branchesPermissions.length;
          } else {
            this.branchesPermissions = [];
            this.totalRecords = 0;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to load branches permissions'
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this.branchesPermissions = [];
          this.totalRecords = 0;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load branches permissions'
          });
          this.loading = false;
        }
      });
  }

  // Pagination Methods
  get totalPages(): number {
    return this.totalRecords > 0 ? Math.ceil(this.totalRecords / this.pageSize) : 1;
  }

  get currentPageStart(): number {
    return this.totalRecords > 0 ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get currentPageEnd(): number {
    if (this.totalRecords === 0) return 0;
    const end = this.currentPage * this.pageSize;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadData();
  }

  // Search Methods
  onSearch() {
    this.currentPage = 1;
    this.loadData();
  }

  // Selection Methods
  onSelectAll(event: any) {
    this.selectAll = event.target.checked;
    if (this.selectAll) {
      switch (this.selectedTable) {
        case 'access':
          this.selectedItems = [...this.accessPermissions];
          break;
        case 'directManagers':
          this.selectedItems = [...this.directManagersPermissions];
          break;
        case 'departments':
          this.selectedItems = [...this.departmentsPermissions];
          break;
        case 'branches':
          this.selectedItems = [...this.branchesPermissions];
          break;
      }
    } else {
      this.selectedItems = [];
    }
  }

  onItemSelect(item: any, event: any) {
    if (event.target.checked) {
      this.selectedItems.push(item);
    } else {
      const index = this.selectedItems.findIndex(selected => {
        switch (this.selectedTable) {
          case 'access':
            return selected.recId === item.recId;
          case 'directManagers':
            return selected.empId === item.empId;
          case 'departments':
            return selected.deptId === item.deptId;
          case 'branches':
            return selected.branchId === item.branchId;
          default:
            return false;
        }
      });
      if (index > -1) {
        this.selectedItems.splice(index, 1);
      }
    }
    
    // Update select all checkbox
    const totalItems = this.getCurrentTableData().length;
    this.selectAll = this.selectedItems.length === totalItems;
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.some(selected => {
      switch (this.selectedTable) {
        case 'access':
          return selected.recId === item.recId;
        case 'directManagers':
          return selected.empId === item.empId;
        case 'departments':
          return selected.deptId === item.deptId;
        case 'branches':
          return selected.branchId === item.branchId;
        default:
          return false;
      }
    });
  }

  getCurrentTableData(): any[] {
    switch (this.selectedTable) {
      case 'access':
        return this.accessPermissions;
      case 'directManagers':
        return this.directManagersPermissions;
      case 'departments':
        return this.departmentsPermissions;
      case 'branches':
        return this.branchesPermissions;
      default:
        return [];
    }
  }

  // Action Methods
  deleteSelected() {
    if (this.selectedItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select items to delete'
      });
      return;
    }

    // Only implement delete for access permissions table
    if (this.selectedTable !== 'access') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Delete functionality is only available for Access Permissions'
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected items?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteSelectedAccessPermissions();
      }
    });
  }

  deleteSelectedAccessPermissions() {
    // Extract permission IDs from selected items
    const permissionIds = this.selectedItems.map(item => item.recId).filter(id => id != null);
    
    if (permissionIds.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No valid permissions selected for deletion'
      });
      return;
    }

    this.loading = true;
    this.accessPermissionsService.deleteSelectedAccessPermissions(permissionIds, this.currentLang)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Selected permissions deleted successfully'
          });
          this.selectedItems = [];
          this.selectAll = false;
          this.loadData();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete selected permissions'
          });
          this.loading = false;
        }
      });
  }

  // Modal Methods
  openCreateModal() {
    this.showCreateModal = true;
    this.resetCreateForm();
    this.clearAllToSelections();
    // Only load basic dropdown data, target-specific data will be loaded on demand
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetCreateForm();
    this.clearAllToSelections();
  }

  private resetCreateForm() {
    this.createForm.reset();
    this.createForm.patchValue({
      toTargetType: TO_TARGET_TYPES.EMPLOYEE,
      fromEmpId: 0,
      fromMgrOfDeptId: 0,
      fromDeptId: 0,
      fromMgrOfBranchId: 0,
      fromBranchId: 0,
      fromRoleId: 0,
      changeDataEmp: 0,
      note: ''
    });
  }

  createNew() {
    this.openCreateModal();
  }

  submitCreate() {
    if (this.createForm.valid) {
      console.log('Creating new access permission...');
      console.log('Form Value:', this.createForm.value);  
      this.loading = true;
      
      const formValue = this.createForm.value;
      const targetType = formValue.toTargetType;
      
      // Build the base payload structure
      const payload: any = {
        fromEmpId: formValue.fromEmpId || 0,
        fromMgrOfDeptId: formValue.fromMgrOfDeptId || 0,
        fromDeptId: formValue.fromDeptId || 0,
        fromMgrOfBranchId: formValue.fromMgrOfBranchId || 0,
        fromBranchId: formValue.fromBranchId || 0,
        fromRoleId: formValue.fromRoleId || 0,
        changeDataEmp: formValue.changeDataEmp || 0,
        sDate: formValue.sDate ? new Date(formValue.sDate).toISOString() : new Date().toISOString(),
        eDate: formValue.eDate ? new Date(formValue.eDate).toISOString() : new Date().toISOString(),
        note: formValue.note || ''
      };

      // Add target-specific arrays based on the selected target type
      switch (targetType) {
        case TO_TARGET_TYPES.EMPLOYEE:
          payload.toEmpId = this.toEmployeesMultiSelectState.selected.length > 0 
            ? this.toEmployeesMultiSelectState.selected.map(emp => emp.id) 
            : [0];
            this.accessPermissionsService.processPermissionsToEmployees(payload, this.currentLang).subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message
                });
                this.closeCreateModal();
                this.loadData();
                this.loading = false;
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to create access permission'
                });
                this.loading = false;
              }
            });
          break;
        case TO_TARGET_TYPES.DEPARTMENT:
          payload.toDeptId = this.toDepartmentsMultiSelectState.selected.length > 0
            ? this.toDepartmentsMultiSelectState.selected.map(dept => dept.id)
            : [0];
            this.accessPermissionsService.processPermissionsToDepartments(payload, this.currentLang).subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message
                });
                this.closeCreateModal();
                this.loadData();
                this.loading = false;
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to create access permission'
                });
                this.loading = false;
              }
            });
          break;
        case TO_TARGET_TYPES.MANAGER_OF_DEPARTMENT:
          payload.toMgrOfDeptId = this.toManagersOfDepartmentMultiSelectState.selected.length > 0
            ? this.toManagersOfDepartmentMultiSelectState.selected.map(mgr => mgr.id)
            : [0];
            this.accessPermissionsService.processPermissionsToDepartmentManagers(payload, this.currentLang).subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message
                });
                this.closeCreateModal();
                this.loadData();
                this.loading = false;
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to create access permission'
                });
                this.loading = false;
              }
            });
          break;
        case TO_TARGET_TYPES.MANAGER_OF_BRANCH:
          payload.toMgrOfBranchId = this.toManagersOfBranchMultiSelectState.selected.length > 0
            ? this.toManagersOfBranchMultiSelectState.selected.map(mgr => mgr.id)
            : [0];
            this.accessPermissionsService.processPermissionsToBranchManagers(payload, this.currentLang).subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message
                });
                this.closeCreateModal();
                this.loadData();
                this.loading = false;
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to create access permission'
                });
                this.loading = false;
              }
            });
          break;
        case TO_TARGET_TYPES.BRANCH:
          payload.toBranchId = this.toBranchesMultiSelectState.selected.length > 0
            ? this.toBranchesMultiSelectState.selected.map(branch => branch.id)
            : [0];
            this.accessPermissionsService.processPermissionsToBranches(payload, this.currentLang).subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message
                });
                this.closeCreateModal();
                this.loadData();
                this.loading = false;
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to create access permission'
                });
                this.loading = false;
              }
            });
          break;
        case TO_TARGET_TYPES.ROLE:
          payload.toRoleId = this.toRolesMultiSelectState.selected.length > 0
            ? this.toRolesMultiSelectState.selected.map(role => role.id)
            : [0];
            this.accessPermissionsService.processPermissionsToRoles(payload, this.currentLang).subscribe({
              next: (response) => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message
                });
                this.closeCreateModal();
                this.loadData();
                this.loading = false;
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to create access permission'
                });
                this.loading = false;
              }
            });
          break;
        default:
          // Default to empty employee array if no valid target type
          payload.toEmpId = [0];
      }
   
    }
  }

  // Dropdown Data Loading Methods
  private loadDropdownData() {
    // Only load FROM dropdown data when modal is opened
    // TO target data is loaded on-demand based on target type selection
    this.loadBasicDropdownData();
  }

  private loadBasicDropdownData() {
    // Load only basic dropdown data that's always needed
    this.loadEmployeesIfNeeded();
    this.loadDepartmentsIfNeeded();
    this.loadBranchesIfNeeded();
    this.loadRolesIfNeeded();
  }

  private loadToTargetData(targetType: string) {
    // Only load data for the specific target type to avoid unnecessary API calls
    switch (targetType) {
      case TO_TARGET_TYPES.EMPLOYEE:
        this.loadEmployeesForMultiSelect();
        break;
      case TO_TARGET_TYPES.DEPARTMENT:
        this.loadDepartmentsForMultiSelect();
        break;
      case TO_TARGET_TYPES.BRANCH:
        this.loadBranchesForMultiSelect();
        break;
      case TO_TARGET_TYPES.ROLE:
        this.loadRolesForMultiSelect();
        break;
      case TO_TARGET_TYPES.MANAGER_OF_DEPARTMENT:
        this.loadManagersOfDepartmentForMultiSelect();
        break;
      case TO_TARGET_TYPES.MANAGER_OF_BRANCH:
        this.loadManagersOfBranchForMultiSelect();
        break;
    }
  }

  // Method to preload specific data type if not already loaded
  private preloadDataIfNeeded(dataType: 'employees' | 'departments' | 'branches' | 'roles' | 'branchManagers') {
    if (!this.isDataLoadedForCurrentLanguage(dataType)) {
      switch (dataType) {
        case 'employees':
          this.loadEmployeesIfNeeded();
          break;
        case 'departments':
          this.loadDepartmentsIfNeeded();
          break;
        case 'branches':
          this.loadBranchesIfNeeded();
          break;
        case 'roles':
          this.loadRolesIfNeeded();
          break;
        case 'branchManagers':
          this.loadManagersOfBranchForMultiSelect();
          break;
      }
    }
  }

  private clearAllToSelections() {
    this.toEmployeesMultiSelectState.selected = [];
    this.toDepartmentsMultiSelectState.selected = [];
    this.toBranchesMultiSelectState.selected = [];
    this.toRolesMultiSelectState.selected = [];
    this.toManagersOfDepartmentMultiSelectState.selected = [];
    this.toManagersOfBranchMultiSelectState.selected = [];
  }

  getStoredEmpId(): number | undefined {
    const empId = localStorage.getItem('empId');
    return empId ? parseInt(empId, 10) : undefined;
  }

  private loadEmployeesIfNeeded() {
    if (this.isDataLoadedForCurrentLanguage('employees')) {
      this.employees = [...this.dataCache.employees];
      return;
    }

    if (this.loadingEmployees) return; // Prevent duplicate calls

    this.loadingEmployees = true;
    const empId = this.getStoredEmpId() || 0;

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const employeeData = response.data.employees.map((emp: any) => ({
            id: emp.value,
            name: emp.label
          }));
          this.employees = employeeData;
          this.dataCache.employees = [...employeeData];
          this.markDataAsLoaded('employees');
        } else {
          this.employees = [];
          this.dataCache.employees = [];
        }
        this.loadingEmployees = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employees'
        });
        this.employees = [];
        this.dataCache.employees = [];
        this.loadingEmployees = false;
      }
    });
  }

  private loadDepartmentsIfNeeded() {
    if (this.isDataLoadedForCurrentLanguage('departments')) {
      this.departments = [...this.dataCache.departments];
      return;
    }

    if (this.loadingDepartments) return; // Prevent duplicate calls

    this.loadingDepartments = true;

    this.dropdownlistsService.getDepartmentsDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const departmentData = response.data.departments.map((dept: any) => ({
            id: dept.value,
            name: dept.label
          }));
          this.departments = departmentData;
          this.dataCache.departments = [...departmentData];
          this.markDataAsLoaded('departments');
        } else {
          this.departments = [];
          this.dataCache.departments = [];
        }
        this.loadingDepartments = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load departments'
        });
        this.departments = [];
        this.dataCache.departments = [];
        this.loadingDepartments = false;
      }
    });
  }

  private loadBranchesIfNeeded() {
    if (this.isDataLoadedForCurrentLanguage('branches')) {
      this.branches = [...this.dataCache.branches];
      return;
    }

    if (this.loadingBranches) return; // Prevent duplicate calls

    this.loadingBranches = true;

    this.dropdownlistsService.getBranchesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const branchData = response.data.parentBranches.map((branch: any) => ({
            id: branch.value,
            name: branch.label
          }));
          this.branches = branchData;
          this.dataCache.branches = [...branchData];
          this.markDataAsLoaded('branches');
        } else {
          this.branches = [];
          this.dataCache.branches = [];
        }
        this.loadingBranches = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load branches'
        });
        this.branches = [];
        this.dataCache.branches = [];
        this.loadingBranches = false;
      }
    });
  }

  private loadRolesIfNeeded() {
    if (this.isDataLoadedForCurrentLanguage('roles')) {
      this.roles = [...this.dataCache.roles];
      return;
    }

    if (this.loadingRoles) return; // Prevent duplicate calls

    this.loadingRoles = true;

    this.dropdownlistsService.getEmployeeRolesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const roleData = response.data.dropdownListsForRoleModuleRights.map((role: any) => ({
            id: role.value,
            name: role.label
          }));
          this.roles = roleData;
          this.dataCache.roles = [...roleData];
          this.markDataAsLoaded('roles');
        } else {
          this.roles = [];
          this.dataCache.roles = [];
        }
        this.loadingRoles = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load roles'
        });
        this.roles = [];
        this.dataCache.roles = [];
        this.loadingRoles = false;
      }
    });
  }

  private loadEmployeesForMultiSelect() {
    // Reuse cached employee data if available
    if (this.isDataLoadedForCurrentLanguage('employees')) {
      this.toEmployeesMultiSelectState.available = [...this.dataCache.employees];
      return;
    }

    if (this.loadingToEmployees) return; // Prevent duplicate calls

    this.loadingToEmployees = true;
    const empId = this.getStoredEmpId() || 0;

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const employeeData = response.data.employees.map((emp: any) => ({
            id: emp.value,
            name: emp.label
          }));
          this.toEmployeesMultiSelectState.available = employeeData;
          
          // Cache the data for reuse
          this.dataCache.employees = [...employeeData];
          this.employees = [...employeeData];
          this.markDataAsLoaded('employees');
        } else {
          this.toEmployeesMultiSelectState.available = [];
        }
        this.loadingToEmployees = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load target employees'
        });
        this.toEmployeesMultiSelectState.available = [];
        this.loadingToEmployees = false;
      }
    });
  }

  private loadDepartmentsForMultiSelect() {
    // Reuse cached department data if available
    if (this.isDataLoadedForCurrentLanguage('departments')) {
      this.toDepartmentsMultiSelectState.available = [...this.dataCache.departments];
      return;
    }

    if (this.loadingToDepartments) return; // Prevent duplicate calls

    this.loadingToDepartments = true;

    this.dropdownlistsService.getDepartmentsDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const departmentData = response.data.departments.map((dept: any) => ({
            id: dept.value,
            name: dept.label
          }));
          this.toDepartmentsMultiSelectState.available = departmentData;
          
          // Cache the data for reuse
          this.dataCache.departments = [...departmentData];
          this.departments = [...departmentData];
          this.markDataAsLoaded('departments');
        } else {
          this.toDepartmentsMultiSelectState.available = [];
        }
        this.loadingToDepartments = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load target departments'
        });
        this.toDepartmentsMultiSelectState.available = [];
        this.loadingToDepartments = false;
      }
    });
  }

  private loadBranchesForMultiSelect() {
    // Reuse cached branch data if available
    if (this.isDataLoadedForCurrentLanguage('branches')) {
      this.toBranchesMultiSelectState.available = [...this.dataCache.branches];
      return;
    }

    if (this.loadingToBranches) return; // Prevent duplicate calls

    this.loadingToBranches = true;

    this.dropdownlistsService.getBranchesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const branchData = response.data.parentBranches.map((branch: any) => ({
            id: branch.value,
            name: branch.label
          }));
          this.toBranchesMultiSelectState.available = branchData;
          
          // Cache the data for reuse
          this.dataCache.branches = [...branchData];
          this.branches = [...branchData];
          this.markDataAsLoaded('branches');
        } else {
          this.toBranchesMultiSelectState.available = [];
        }
        this.loadingToBranches = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load target branches'
        });
        this.toBranchesMultiSelectState.available = [];
        this.loadingToBranches = false;
      }
    });
  }

  private loadRolesForMultiSelect() {
    // Reuse cached role data if available
    if (this.isDataLoadedForCurrentLanguage('roles')) {
      this.toRolesMultiSelectState.available = [...this.dataCache.roles];
      return;
    }

    if (this.loadingToRoles) return; // Prevent duplicate calls

    this.loadingToRoles = true;

    this.dropdownlistsService.getEmployeeRolesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const roleData = response.data.dropdownListsForRoleModuleRights.map((role: any) => ({
            id: role.value,
            name: role.label
          }));
          this.toRolesMultiSelectState.available = roleData;
          
          // Cache the data for reuse
          this.dataCache.roles = [...roleData];
          this.roles = [...roleData];
          this.markDataAsLoaded('roles');
        } else {
          this.toRolesMultiSelectState.available = [];
        }
        this.loadingToRoles = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load target roles'
        });
        this.toRolesMultiSelectState.available = [];
        this.loadingToRoles = false;
      }
    });
  }

  private loadManagersOfDepartmentForMultiSelect() {
    // Reuse cached employee data for department managers (same data source)
    if (this.isDataLoadedForCurrentLanguage('employees')) {
      this.toManagersOfDepartmentMultiSelectState.available = [...this.dataCache.employees];
      return;
    }

    if (this.loadingToManagersOfDepartment) return; // Prevent duplicate calls

    this.loadingToManagersOfDepartment = true;
    const empId = this.getStoredEmpId() || 0;

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const employeeData = response.data.employees.map((emp: any) => ({
            id: emp.value,
            name: emp.label
          }));
          this.toManagersOfDepartmentMultiSelectState.available = employeeData;
          
          // Cache the data for reuse
          this.dataCache.employees = [...employeeData];
          this.employees = [...employeeData];
          this.markDataAsLoaded('employees');
        } else {
          this.toManagersOfDepartmentMultiSelectState.available = [];
        }
        this.loadingToManagersOfDepartment = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load target managers of department'
        });
        this.toManagersOfDepartmentMultiSelectState.available = [];
        this.loadingToManagersOfDepartment = false;
      }
    });
  }

  private loadManagersOfBranchForMultiSelect() {
    // Check if branch managers data is already loaded for current language
    if (this.isDataLoadedForCurrentLanguage('branchManagers')) {
      this.toManagersOfBranchMultiSelectState.available = [...this.dataCache.branchManagers];
      return;
    }

    if (this.loadingToManagersOfBranch) return; // Prevent duplicate calls

    this.loadingToManagersOfBranch = true;
   const empId = this.getStoredEmpId() || 0;
    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data) {
          const branchManagerData = response.data.employees.map((manager: any) => ({
            id: manager.value,
            name: manager.label
          }));
          this.toManagersOfBranchMultiSelectState.available = branchManagerData;
          
          // Cache the data for reuse
          this.dataCache.branchManagers = [...branchManagerData];
          this.branchManagers = [...branchManagerData];
          this.markDataAsLoaded('branchManagers');
        } else {
          this.toManagersOfBranchMultiSelectState.available = [];
        }
        this.loadingToManagersOfBranch = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load target managers of branch'
        });
        this.toManagersOfBranchMultiSelectState.available = [];
        this.loadingToManagersOfBranch = false;
      }
    });
  }

  // Form Validation Helper Methods
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.createForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.createForm): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'This field is required';
      }
      // Add more validation error messages as needed
    }
    return '';
  }

  savePermissions() {
    // Only save permissions for tables with checkboxes (directManagers, departments, branches)
    if (this.selectedTable === 'access') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Save functionality is not available for Access Permissions table'
      });
      return;
    }

    this.loading = true;
    let saveObservable;

    try {
      switch (this.selectedTable) {
        case 'directManagers':
          saveObservable = this.saveEmployeeManagerPermissions();
          break;
        case 'departments':
          saveObservable = this.saveDepartmentManagerPermissions();
          break;
        case 'branches':
          saveObservable = this.saveBranchManagerPermissions();
          break;
        default:
          this.loading = false;
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Invalid table selected'
          });
          return;
      }

      saveObservable.subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Permissions saved successfully'
          });
          this.loadData(); // Reload data to reflect changes
          this.loading = false;
        },
        error: (error) => {
          console.error('Error saving permissions:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save permissions. Please try again.'
          });
          this.loading = false;
        }
      });

    } catch (error) {
      console.error('Error preparing save request:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to prepare save request'
      });
      this.loading = false;
    }
  }

  private saveEmployeeManagerPermissions() {
    const employeeData = this.directManagersPermissions;
    
    const noPermissionEmployees = employeeData
      .filter(emp => emp.cannotView && emp.empId !== -1)
      .map(emp => emp.empId);

    const viewOnlyEmployees = employeeData
      .filter(emp => emp.canView && emp.empId !== -1)
      .map(emp => emp.empId);

    const fullAccessEmployees = employeeData
      .filter(emp => emp.canModify && emp.empId !== -1)
      .map(emp => emp.empId);

    const accessEmpChildren = employeeData
      .filter(emp => emp.accessChild && emp.empId !== -1)
      .map(emp => emp.empId);

    const request: SaveEmployeeManagerPermissionsRequest = {
      noPermissionEmployees,
      viewOnlyEmployees,
      fullAccessEmployees,
      accessEmpChildren
    };

    return this.accessPermissionsService.saveEmployeeManagerPermissions(request, this.currentLang);
  }

  private saveDepartmentManagerPermissions() {
    const departmentData = this.departmentsPermissions;
    
    const noPermissionDepartments = departmentData
      .filter(dept => dept.cannotView && dept.deptId !== -1)
      .map(dept => dept.deptId);

    const viewOnlyDepartments = departmentData
      .filter(dept => dept.canView && dept.deptId !== -1)
      .map(dept => dept.deptId);

    const fullAccessDepartments = departmentData
      .filter(dept => dept.canModify && dept.deptId !== -1)
      .map(dept => dept.deptId);

    const accessDeptChildren = departmentData
      .filter(dept => dept.accessChild && dept.deptId !== -1)
      .map(dept => dept.deptId);

    const request: SaveDepartmentManagerPermissionsRequest = {
      noPermissionDepartments,
      viewOnlyDepartments,
      fullAccessDepartments,
      accessDeptChildren
    };

    return this.accessPermissionsService.saveDepartmentManagerPermissions(request, this.currentLang);
  }

  private saveBranchManagerPermissions() {
    const branchData = this.branchesPermissions;
    
    const noPermissionBranches = branchData
      .filter(branch => branch.cannotView && branch.branchId !== -1)
      .map(branch => branch.branchId);

    const viewOnlyBranches = branchData
      .filter(branch => branch.canView && branch.branchId !== -1)
      .map(branch => branch.branchId);

    const fullAccessBranches = branchData
      .filter(branch => branch.canModify && branch.branchId !== -1)
      .map(branch => branch.branchId);

    const accessBranchChildren = branchData
      .filter(branch => branch.accessChild && branch.branchId !== -1)
      .map(branch => branch.branchId);

    const request: SaveBranchManagerPermissionsRequest = {
      noPermissionBranches,
      viewOnlyBranches,
      fullAccessBranches,
      accessBranchChildren
    };

    return this.accessPermissionsService.saveBranchManagerPermissions(request, this.currentLang);
  }

  editItem(item: any) {
    // Implement edit logic
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Edit functionality to be implemented'
    });
  }

  deleteItem(item: any) {
    // Only implement delete for access permissions table
    if (this.selectedTable !== 'access') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Delete functionality is only available for Access Permissions'
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteSingleAccessPermission(item);
      }
    });
  }

  deleteSingleAccessPermission(item: DataPermission) {
    if (!item.recId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Invalid permission ID'
      });
      return;
    }

    this.loading = true;
    this.accessPermissionsService.deleteAccessPermission(item.recId, this.currentLang)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Permission deleted successfully'
          });
          this.loadData();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete permission'
          });
          this.loading = false;
        }
      });
  }

  // Checkbox change handlers for permission tables
  onPermissionChange(item: any, permissionType: string, event: any) {
    // Update the specific permission
    item[permissionType] = event.target.checked;
    
    // If this is a radio-button style behavior, uncheck other options
    if (permissionType === 'cannotView' && event.target.checked) {
      item.canView = false;
      item.canModify = false;
    } else if (permissionType === 'canView' && event.target.checked) {
      item.cannotView = false;
      item.canModify = false;
    } else if (permissionType === 'canModify' && event.target.checked) {
      item.cannotView = false;
      item.canView = false;
    }
    
    // You can implement auto-save logic here or save on button click
  }

  // Handle access children checkbox change
  onAccessChildrenChange(item: any, event: any) {
    item.accessChild = event.target.checked;
  }

  // Select all permissions for a specific type
  selectAllPermissions(permissionType: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    const data = this.getCurrentTableData();
    
    data.forEach(item => {
      if (permissionType === 'cannotView' && checked) {
        item.cannotView = true;
        item.canView = false;
        item.canModify = false;
      } else if (permissionType === 'canView' && checked) {
        item.cannotView = false;
        item.canView = true;
        item.canModify = false;
      } else if (permissionType === 'canModify' && checked) {
        item.cannotView = false;
        item.canView = false;
        item.canModify = true;
      } else if (permissionType === 'accessChild') {
        item.accessChild = checked;
      } else {
        // Uncheck the specific permission type if unchecked
        item[permissionType] = checked;
      }
    });
  }

  // Helper method to check if all items have a specific permission
  areAllPermissionsSelected(permissionType: string): boolean {
    const data = this.getCurrentTableData();
    return data.length > 0 && data.every(item => item[permissionType]);
  }

  // Helper method to check if some items have a specific permission (for indeterminate state)
  areSomePermissionsSelected(permissionType: string): boolean {
    const data = this.getCurrentTableData();
    return data.some(item => item[permissionType]) && !this.areAllPermissionsSelected(permissionType);
  }

  // New methods for target type functionality
  getCurrentToTargetType(): string {
    return this.createForm.get('toTargetType')?.value || TO_TARGET_TYPES.EMPLOYEE;
  }

  // Multi-select methods for all target types
  // Employees Multi-select methods
  getFilteredToEmployees(): SelectableItem[] {
    if (!this.toEmployeesMultiSelectState.searchTerm) {
      return this.toEmployeesMultiSelectState.available;
    }
    return this.toEmployeesMultiSelectState.available.filter((item: SelectableItem) =>
      item.name.toLowerCase().includes(this.toEmployeesMultiSelectState.searchTerm.toLowerCase())
    );
  }

  isToEmployeeSelected(item: SelectableItem): boolean {
    return this.toEmployeesMultiSelectState.selected.some(selected => selected.id === item.id);
  }

  toggleToEmployeeSelection(item: SelectableItem): void {
    const index = this.toEmployeesMultiSelectState.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      this.toEmployeesMultiSelectState.selected.splice(index, 1);
    } else {
      this.toEmployeesMultiSelectState.selected.push(item);
    }
  }

  clearToEmployeesSelection(): void {
    this.toEmployeesMultiSelectState.selected = [];
  }

  updateToEmployeesSearchTerm(searchTerm: string): void {
    this.toEmployeesMultiSelectState.searchTerm = searchTerm;
  }

  getToEmployeesSelectedCount(): number {
    return this.toEmployeesMultiSelectState.selected.length;
  }

  selectAllToEmployees(): void {
    this.toEmployeesMultiSelectState.selected = [...this.toEmployeesMultiSelectState.available];
  }

  hasSelectableToEmployees(): boolean {
    return this.toEmployeesMultiSelectState.available.length > 0;
  }

  areAllToEmployeesSelected(): boolean {
    return this.toEmployeesMultiSelectState.available.length > 0 && 
           this.toEmployeesMultiSelectState.selected.length === this.toEmployeesMultiSelectState.available.length;
  }

  // Departments Multi-select methods
  getFilteredToDepartments(): SelectableItem[] {
    if (!this.toDepartmentsMultiSelectState.searchTerm) {
      return this.toDepartmentsMultiSelectState.available;
    }
    return this.toDepartmentsMultiSelectState.available.filter((item: SelectableItem) =>
      item.name.toLowerCase().includes(this.toDepartmentsMultiSelectState.searchTerm.toLowerCase())
    );
  }

  isToDepartmentSelected(item: SelectableItem): boolean {
    return this.toDepartmentsMultiSelectState.selected.some(selected => selected.id === item.id);
  }

  toggleToDepartmentSelection(item: SelectableItem): void {
    const index = this.toDepartmentsMultiSelectState.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      this.toDepartmentsMultiSelectState.selected.splice(index, 1);
    } else {
      this.toDepartmentsMultiSelectState.selected.push(item);
    }
  }

  clearToDepartmentsSelection(): void {
    this.toDepartmentsMultiSelectState.selected = [];
  }

  updateToDepartmentsSearchTerm(searchTerm: string): void {
    this.toDepartmentsMultiSelectState.searchTerm = searchTerm;
  }

  getToDepartmentsSelectedCount(): number {
    return this.toDepartmentsMultiSelectState.selected.length;
  }

  selectAllToDepartments(): void {
    this.toDepartmentsMultiSelectState.selected = [...this.toDepartmentsMultiSelectState.available];
  }

  hasSelectableToDepartments(): boolean {
    return this.toDepartmentsMultiSelectState.available.length > 0;
  }

  areAllToDepartmentsSelected(): boolean {
    return this.toDepartmentsMultiSelectState.available.length > 0 && 
           this.toDepartmentsMultiSelectState.selected.length === this.toDepartmentsMultiSelectState.available.length;
  }

  // Branches Multi-select methods
  getFilteredToBranches(): SelectableItem[] {
    if (!this.toBranchesMultiSelectState.searchTerm) {
      return this.toBranchesMultiSelectState.available;
    }
    return this.toBranchesMultiSelectState.available.filter((item: SelectableItem) =>
      item.name.toLowerCase().includes(this.toBranchesMultiSelectState.searchTerm.toLowerCase())
    );
  }

  isToBranchSelected(item: SelectableItem): boolean {
    return this.toBranchesMultiSelectState.selected.some(selected => selected.id === item.id);
  }

  toggleToBranchSelection(item: SelectableItem): void {
    const index = this.toBranchesMultiSelectState.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      this.toBranchesMultiSelectState.selected.splice(index, 1);
    } else {
      this.toBranchesMultiSelectState.selected.push(item);
    }
  }

  clearToBranchesSelection(): void {
    this.toBranchesMultiSelectState.selected = [];
  }

  updateToBranchesSearchTerm(searchTerm: string): void {
    this.toBranchesMultiSelectState.searchTerm = searchTerm;
  }

  getToBranchesSelectedCount(): number {
    return this.toBranchesMultiSelectState.selected.length;
  }

  selectAllToBranches(): void {
    this.toBranchesMultiSelectState.selected = [...this.toBranchesMultiSelectState.available];
  }

  hasSelectableToBranches(): boolean {
    return this.toBranchesMultiSelectState.available.length > 0;
  }

  areAllToBranchesSelected(): boolean {
    return this.toBranchesMultiSelectState.available.length > 0 && 
           this.toBranchesMultiSelectState.selected.length === this.toBranchesMultiSelectState.available.length;
  }

  // Roles Multi-select methods
  getFilteredToRoles(): SelectableItem[] {
    if (!this.toRolesMultiSelectState.searchTerm) {
      return this.toRolesMultiSelectState.available;
    }
    return this.toRolesMultiSelectState.available.filter((item: SelectableItem) =>
      item.name.toLowerCase().includes(this.toRolesMultiSelectState.searchTerm.toLowerCase())
    );
  }

  isToRoleSelected(item: SelectableItem): boolean {
    return this.toRolesMultiSelectState.selected.some(selected => selected.id === item.id);
  }

  toggleToRoleSelection(item: SelectableItem): void {
    const index = this.toRolesMultiSelectState.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      this.toRolesMultiSelectState.selected.splice(index, 1);
    } else {
      this.toRolesMultiSelectState.selected.push(item);
    }
  }

  clearToRolesSelection(): void {
    this.toRolesMultiSelectState.selected = [];
  }

  updateToRolesSearchTerm(searchTerm: string): void {
    this.toRolesMultiSelectState.searchTerm = searchTerm;
  }

  getToRolesSelectedCount(): number {
    return this.toRolesMultiSelectState.selected.length;
  }

  selectAllToRoles(): void {
    this.toRolesMultiSelectState.selected = [...this.toRolesMultiSelectState.available];
  }

  hasSelectableToRoles(): boolean {
    return this.toRolesMultiSelectState.available.length > 0;
  }

  areAllToRolesSelected(): boolean {
    return this.toRolesMultiSelectState.available.length > 0 && 
           this.toRolesMultiSelectState.selected.length === this.toRolesMultiSelectState.available.length;
  }

  // Managers of Department Multi-select methods
  getFilteredToManagersOfDepartment(): SelectableItem[] {
    if (!this.toManagersOfDepartmentMultiSelectState.searchTerm) {
      return this.toManagersOfDepartmentMultiSelectState.available;
    }
    return this.toManagersOfDepartmentMultiSelectState.available.filter((item: SelectableItem) =>
      item.name.toLowerCase().includes(this.toManagersOfDepartmentMultiSelectState.searchTerm.toLowerCase())
    );
  }

  isToManagerOfDepartmentSelected(item: SelectableItem): boolean {
    return this.toManagersOfDepartmentMultiSelectState.selected.some(selected => selected.id === item.id);
  }

  toggleToManagerOfDepartmentSelection(item: SelectableItem): void {
    const index = this.toManagersOfDepartmentMultiSelectState.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      this.toManagersOfDepartmentMultiSelectState.selected.splice(index, 1);
    } else {
      this.toManagersOfDepartmentMultiSelectState.selected.push(item);
    }
  }

  clearToManagersOfDepartmentSelection(): void {
    this.toManagersOfDepartmentMultiSelectState.selected = [];
  }

  updateToManagersOfDepartmentSearchTerm(searchTerm: string): void {
    this.toManagersOfDepartmentMultiSelectState.searchTerm = searchTerm;
  }

  getToManagersOfDepartmentSelectedCount(): number {
    return this.toManagersOfDepartmentMultiSelectState.selected.length;
  }

  selectAllToManagersOfDepartment(): void {
    this.toManagersOfDepartmentMultiSelectState.selected = [...this.toManagersOfDepartmentMultiSelectState.available];
  }

  hasSelectableToManagersOfDepartment(): boolean {
    return this.toManagersOfDepartmentMultiSelectState.available.length > 0;
  }

  areAllToManagersOfDepartmentSelected(): boolean {
    return this.toManagersOfDepartmentMultiSelectState.available.length > 0 && 
           this.toManagersOfDepartmentMultiSelectState.selected.length === this.toManagersOfDepartmentMultiSelectState.available.length;
  }

  // Managers of Branch Multi-select methods
  getFilteredToManagersOfBranch(): SelectableItem[] {
    if (!this.toManagersOfBranchMultiSelectState.searchTerm) {
      return this.toManagersOfBranchMultiSelectState.available;
    }
    return this.toManagersOfBranchMultiSelectState.available.filter((item: SelectableItem) =>
      item.name.toLowerCase().includes(this.toManagersOfBranchMultiSelectState.searchTerm.toLowerCase())
    );
  }

  isToManagerOfBranchSelected(item: SelectableItem): boolean {
    return this.toManagersOfBranchMultiSelectState.selected.some(selected => selected.id === item.id);
  }

  toggleToManagerOfBranchSelection(item: SelectableItem): void {
    const index = this.toManagersOfBranchMultiSelectState.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      this.toManagersOfBranchMultiSelectState.selected.splice(index, 1);
    } else {
      this.toManagersOfBranchMultiSelectState.selected.push(item);
    }
  }

  clearToManagersOfBranchSelection(): void {
    this.toManagersOfBranchMultiSelectState.selected = [];
  }

  updateToManagersOfBranchSearchTerm(searchTerm: string): void {
    this.toManagersOfBranchMultiSelectState.searchTerm = searchTerm;
  }

  getToManagersOfBranchSelectedCount(): number {
    return this.toManagersOfBranchMultiSelectState.selected.length;
  }

  selectAllToManagersOfBranch(): void {
    this.toManagersOfBranchMultiSelectState.selected = [...this.toManagersOfBranchMultiSelectState.available];
  }

  hasSelectableToManagersOfBranch(): boolean {
    return this.toManagersOfBranchMultiSelectState.available.length > 0;
  }

  areAllToManagersOfBranchSelected(): boolean {
    return this.toManagersOfBranchMultiSelectState.available.length > 0 && 
           this.toManagersOfBranchMultiSelectState.selected.length === this.toManagersOfBranchMultiSelectState.available.length;
  }
}
