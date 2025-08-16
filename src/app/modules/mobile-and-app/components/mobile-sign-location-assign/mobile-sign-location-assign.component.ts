import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MobileSignLocationAssign, MobileSignLocationAssignCreateRequest } from '../../../../core/models/mobileSignLocationAssign';
import { MobileSignLocationAssignService } from '../../services/mobile-sign-location-assign.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';

interface SelectableItem {
  id: number | string;
  name: string;
}

interface MultiSelectState {
  available: SelectableItem[];
  selected: SelectableItem[];
  searchTerm: string;
}

interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
  lang: number;
}

@Component({
  selector: 'app-mobile-sign-location-assign',
  templateUrl: './mobile-sign-location-assign.component.html',
  styleUrl: './mobile-sign-location-assign.component.css',
  providers: [MessageService, ConfirmationService]
})
export class MobileSignLocationAssignComponent implements OnInit, OnDestroy {
  // Core component state
  mobileSignLocationAssigns: MobileSignLocationAssign[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  selectedItems: MobileSignLocationAssign[] = [];
  showAddModal = false;
  isEditMode = false;
  selectedAssignment: MobileSignLocationAssign | null = null;
  
  private langSubscription: Subscription = new Subscription();
  private isInitialized = false;
  private currentLang = 2; // Default to Arabic (2)
  
  // Reactive Forms
  searchForm!: FormGroup;
  assignmentForm!: FormGroup;

  // Multi-select state management
  multiSelectStates: { [key: string]: MultiSelectState } = {
    employees: { available: [], selected: [], searchTerm: '' },
    departments: { available: [], selected: [], searchTerm: '' },
    branches: { available: [], selected: [], searchTerm: '' },
    roles: { available: [], selected: [], searchTerm: '' },
    departmentManagers: { available: [], selected: [], searchTerm: '' },
    branchManagers: { available: [], selected: [], searchTerm: '' }
  };

  // Dynamic data from services
  employees: any[] = [];
  departments: any[] = [];
  branches: any[] = [];
  roles: any[] = [];
  departmentManagers: any[] = [];
  branchManagers: any[] = [];
  locations: any[] = [];
  
  // Loading states for each data type
  loadingEmployees = false;
  loadingDepartments = false;
  loadingBranches = false;
  loadingRoles = false;
  loadingDepartmentManagers = false;
  loadingBranchManagers = false;
  loadingLocations = false;

  // Selected IDs for form submission
  selectedEmployeeIds: number[] = [];
  selectedDepartmentIds: number[] = [];
  selectedBranchIds: number[] = [];
  selectedRoleIds: number[] = [];
  selectedDepartmentManagerIds: number[] = [];
  selectedBranchManagerIds: number[] = [];

  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 2
  };

  constructor(
    private mobileSignLocationAssignService: MobileSignLocationAssignService,
    private dropdownlistsService: DropdownlistsService,
    public langService: LanguageService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.initializeMultiSelectStates();
    
    // Initialize current language
    this.currentLang = this.langService.getLangValue();
    
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      this.paginationRequest.lang = this.currentLang;
      
      if (this.isInitialized) {
        this.loadMobileSignLocationAssigns();
        this.loadAllData();
      }
    });
  }

  ngOnInit() {
    // Initialize current language from service
    this.currentLang = this.langService.getLangValue();
    this.paginationRequest.lang = this.currentLang;
    
    this.loadMobileSignLocationAssigns();
    this.loadAllData();
    this.isInitialized = true;
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  getStoredEmpId(): number | undefined {
    const empId = this.authService.getEmpIdAsNumber();
    return empId || undefined;
  }

  // Load all data from services
  private loadAllData() {
    this.loadEmployees();
    this.loadDepartments();
    this.loadBranches();
    this.loadRoles();
    this.loadDepartmentManagers();
    this.loadBranchManagers();
    this.loadLocations();
  }

  private loadEmployees() {
    this.loadingEmployees = true;
    const empId = this.getStoredEmpId();
    if (!empId) {
      this.loadingEmployees = false;
      return;
    }

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.employees = response.data.employees || [];
            this.updateMultiSelectState('employees', 
              this.employees.map(emp => ({ id: emp.value, name: emp.label }))
            );
          }
          this.loadingEmployees = false;
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.loadingEmployees = false;
        }
      });
  }

  private loadDepartments() {
    this.loadingDepartments = true;
    this.dropdownlistsService.getDepartmentsDropdownList(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.departments = response.data.departments || [];
            this.updateMultiSelectState('departments', 
              this.departments.map(dept => ({ id: dept.value, name: dept.label }))
            );
          }
          this.loadingDepartments = false;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
          this.loadingDepartments = false;
        }
      });
  }

  private loadBranches() {
    this.loadingBranches = true;
    this.dropdownlistsService.getBranchesDropdownList(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.branches = response.data.parentBranches || [];
            this.updateMultiSelectState('branches', 
              this.branches.map(branch => ({ id: branch.value, name: branch.label }))
            );
          }
          this.loadingBranches = false;
        },
        error: (error) => {
          console.error('Error loading branches:', error);
          this.loadingBranches = false;
        }
      });
  }

  private loadRoles() {
    this.loadingRoles = true;
    this.dropdownlistsService.getEmployeeRolesDropdownList(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.roles = response.data.dropdownListsForRoleModuleRights || [];
            this.updateMultiSelectState('roles',
              this.roles.map(role => ({ id: role.value, name: role.label }))
            );
          }
          this.loadingRoles = false;
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          this.loadingRoles = false;
        }
      });
  }

  private loadDepartmentManagers() {
    this.loadingDepartmentManagers = true;
    this.dropdownlistsService.getDepartmentsDropdownList(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            // Use departments data for department managers (same source)
            const deptManagers = response.data.departments || [];
            this.departmentManagers = deptManagers;
            this.updateMultiSelectState('departmentManagers', 
              this.departmentManagers.map(dept => ({ id: dept.value, name: dept.label }))
            );
          }
          this.loadingDepartmentManagers = false;
        },
        error: (error) => {
          console.error('Error loading department managers:', error);
          this.loadingDepartmentManagers = false;
        }
      });
  }

  private loadBranchManagers() {
    this.loadingBranchManagers = true;
    this.dropdownlistsService.getBranchesDropdownList(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            // Use branches data for branch managers (same source)
            const branchMgrs = response.data.parentBranches || [];
            this.branchManagers = branchMgrs;
            this.updateMultiSelectState('branchManagers', 
              this.branchManagers.map(branch => ({ id: branch.value, name: branch.label }))
            );
          }
          this.loadingBranchManagers = false;
        },
        error: (error) => {
          console.error('Error loading branch managers:', error);
          this.loadingBranchManagers = false;
        }
      });
  }

  private loadLocations() {
    this.loadingLocations = true;
    this.dropdownlistsService.getLocationsDropdownList(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.locations = response.data.locations || [];
          }
          this.loadingLocations = false;
        },
        error: (error) => {
          console.error('Error loading locations:', error);
          this.loadingLocations = false;
        }
      });
  }

  private updateMultiSelectState(category: string, items: SelectableItem[]) {
    if (this.multiSelectStates[category]) {
      this.multiSelectStates[category].available = items;
      this.multiSelectStates[category].selected = [];
      this.multiSelectStates[category].searchTerm = '';
    }
  }

  private initializeForms() {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [10]
    });

    this.assignmentForm = this.fb.group({
      assignType: ['everyone', Validators.required], // 'everyone' or 'group'
      locationId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      note: [''],
      groupTypes: this.fb.group({
        employees: [false],
        departments: [false],
        branches: [false],
        roles: [false],
        departmentManagers: [false],
        branchManagers: [false]
      })
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

  // Pagination computed properties
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.paginationRequest.pageSize);
  }

  get currentPageStart(): number {
    return (this.currentPage - 1) * this.paginationRequest.pageSize + 1;
  }

  get currentPageEnd(): number {
    const end = this.currentPage * this.paginationRequest.pageSize;
    return Math.min(end, this.totalRecords);
  }

  get searchTerm(): string {
    return this.searchForm.get('searchTerm')?.value || '';
  }

  // Selection state getters
  get isAllSelected(): boolean {
    return this.mobileSignLocationAssigns.length > 0 && 
           this.selectedItems.length === this.mobileSignLocationAssigns.length;
  }

  get isPartiallySelected(): boolean {
    return this.selectedItems.length > 0 && 
           this.selectedItems.length < this.mobileSignLocationAssigns.length;
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadMobileSignLocationAssigns();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  onPageSizeChange() {
    const newPageSize = this.searchForm.get('pageSize')?.value;
    if (newPageSize && newPageSize !== this.paginationRequest.pageSize) {
      this.paginationRequest.pageSize = newPageSize;
      this.currentPage = 1;
      this.paginationRequest.pageNumber = 1;
      this.loadMobileSignLocationAssigns();
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadMobileSignLocationAssigns();
  }

  // Core business methods
  loadMobileSignLocationAssigns() {
    this.loading = true;
    const empId = this.getStoredEmpId();
    
    if (!empId) {
      this.messageService.add({
        severity: 'error',
        summary: this.translateService.instant('ERROR'),
        detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.EMPLOYEE_ID_NOT_FOUND')
      });
      this.loading = false;
      return;
    }

    this.mobileSignLocationAssignService.getMobileSignLocationAssign(
      this.paginationRequest.lang,
      empId,
      this.paginationRequest.pageNumber,
      this.paginationRequest.pageSize
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.mobileSignLocationAssigns = response.data.mobileSignLocationsAssign || [];
          this.totalRecords = this.mobileSignLocationAssigns.length;
        } else {
          this.mobileSignLocationAssigns = [];
          this.totalRecords = 0;
          this.messageService.add({
            severity: 'warn',
            summary: 'WARNING',
            detail: response.message || 'MOBILE_SIGN_LOCATION_ASSIGN.NO_DATA_FOUND'
          });
        }
        this.loading = false;
        this.selectedItems = [];
      },
      error: (error) => {
        console.error('Error loading mobile sign location assigns:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'ERROR',
          detail: 'MOBILE_SIGN_LOCATION_ASSIGN.LOAD_ERROR'
        });
        this.loading = false;
        this.mobileSignLocationAssigns = [];
        this.totalRecords = 0;
      }
    });
  }

  editMobileSignLocationAssign(item: MobileSignLocationAssign) {
    this.isEditMode = true;
    this.selectedAssignment = item;
    this.showAddModal = true;
      
    // Load the specific assignment data
    this.loading = true;
    const empId = this.getStoredEmpId();
    
    if (!empId) {
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR',
        detail: 'MOBILE_SIGN_LOCATION_ASSIGN.EMPLOYEE_ID_NOT_FOUND'
      });
      this.loading = false;
      return;
    }

    this.mobileSignLocationAssignService.getMobileSignLocationAssignById(
      this.currentLang,
      empId,
      item.recId
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data && response.data.mobileSignLocationsAssign && response.data.mobileSignLocationsAssign.length > 0) {
          const assignmentData = response.data.mobileSignLocationsAssign[0];
          this.patchFormWithData(assignmentData);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'ERROR',
            detail: 'MOBILE_SIGN_LOCATION_ASSIGN.LOAD_ASSIGNMENT_ERROR'
          });
          this.closeModal();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading assignment for edit:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'ERROR',
          detail: 'MOBILE_SIGN_LOCATION_ASSIGN.LOAD_ASSIGNMENT_ERROR'
        });
        this.closeModal();
        this.loading = false;
      }
    });
  }

  private patchFormWithData(assignmentData: any) {
    // Determine assignment type based on forEveryone flag
    const assignType = assignmentData.forEveryone ? 'everyone' : 'group';
    
    // Convert date strings to proper format for date inputs
    const startDate = assignmentData.sDate ? new Date(assignmentData.sDate).toISOString().split('T')[0] : '';
    const endDate = assignmentData.eDate ? new Date(assignmentData.eDate).toISOString().split('T')[0] : '';
    
    // Patch basic form values
    this.assignmentForm.patchValue({
      assignType: assignType,
      locationId: assignmentData.locId?.toString() || '',
      startDate: startDate,
      endDate: endDate,
      note: assignmentData.note || ''
    });

    // If it's a group assignment, parse and set the group selections
    if (!assignmentData.forEveryone) {
      this.parseAndSetGroupSelections(assignmentData);
    }
  }

  private parseAndSetGroupSelections(assignmentData: any) {
    // Parse all possible ID fields (handle both single values and comma-separated strings)
    const empIds = this.parseIdValue(assignmentData.empIds || assignmentData.empId);
    const deptIds = this.parseIdValue(assignmentData.deptIds || assignmentData.deptId);
    const branchIds = this.parseIdValue(assignmentData.branchIds || assignmentData.branchId);
    const roleIds = this.parseIdValue(assignmentData.roleIds || assignmentData.roleId);
    const deptMgrIds = this.parseIdValue(assignmentData.deptMgrIds || assignmentData.deptIdMgr);
    const branchMgrIds = this.parseIdValue(assignmentData.branchMgrIds || assignmentData.branchIdMgr);

    // Set group type checkboxes based on which IDs are present
    this.assignmentForm.patchValue({
      groupTypes: {
        employees: empIds.length > 0,
        departments: deptIds.length > 0,
        branches: branchIds.length > 0,
        roles: roleIds.length > 0,
        departmentManagers: deptMgrIds.length > 0,
        branchManagers: branchMgrIds.length > 0
      }
    });

    // Set selected IDs and update multi-select states
    this.setSelectedIdsAndUpdateStates(empIds, deptIds, branchIds, roleIds, deptMgrIds, branchMgrIds);
  }

  private parseIdValue(value: string | number | null | undefined): number[] {
    if (!value) return [];
    
    // If it's already a number, return it as array
    if (typeof value === 'number') {
      return [value];
    }
    
    // If it's a string, split by comma and parse
    if (typeof value === 'string') {
      return value.split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id));
    }
    
    return [];
  }

  private setSelectedIdsAndUpdateStates(
    empIds: number[], 
    deptIds: number[], 
    branchIds: number[], 
    roleIds: number[], 
    deptMgrIds: number[], 
    branchMgrIds: number[]
  ) {
    // Set selected ID arrays
    this.selectedEmployeeIds = empIds;
    this.selectedDepartmentIds = deptIds;
    this.selectedBranchIds = branchIds;
    this.selectedRoleIds = roleIds;
    this.selectedDepartmentManagerIds = deptMgrIds;
    this.selectedBranchManagerIds = branchMgrIds;

    // Update multi-select states with selected items - use multiple attempts to handle async data loading
    const updateSelections = () => {
      this.updateMultiSelectSelectedItems('employees', empIds);
      this.updateMultiSelectSelectedItems('departments', deptIds);
      this.updateMultiSelectSelectedItems('branches', branchIds);
      this.updateMultiSelectSelectedItems('roles', roleIds);
      this.updateMultiSelectSelectedItems('departmentManagers', deptMgrIds);
      this.updateMultiSelectSelectedItems('branchManagers', branchMgrIds);
    };

    // Initial attempt
    setTimeout(updateSelections, 100);
    // Second attempt to ensure data is loaded
    setTimeout(updateSelections, 500);
    // Final attempt
    setTimeout(updateSelections, 1000);
  }

  private updateMultiSelectSelectedItems(category: string, selectedIds: number[]) {
    if (!this.multiSelectStates[category] || selectedIds.length === 0) return;
    
    const availableItems = this.multiSelectStates[category].available;
    
    // Only update if we have available items loaded
    if (availableItems.length === 0) return;
    
    const selectedItems = availableItems.filter(item => 
      selectedIds.includes(Number(item.id))
    );
    
    this.multiSelectStates[category].selected = selectedItems;
    
    console.log(`Updated ${category} selections:`, {
      selectedIds,
      availableCount: availableItems.length,
      selectedCount: selectedItems.length,
      selectedItems: selectedItems.map(item => ({ id: item.id, name: item.name }))
    });
  }

  deleteMobileSignLocationAssign(item: MobileSignLocationAssign) {
    this.confirmationService.confirm({
      message: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.DELETE_CONFIRMATION_MESSAGE'),
      header: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.DELETE_CONFIRMATION_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.mobileSignLocationAssignService.deleteMobileSignLocationAssign(
          this.paginationRequest.lang,
          item.recId
        ).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('SUCCESS'),
              detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.DELETE_SUCCESS')
            });
            this.loadMobileSignLocationAssigns();
          },
          error: (error) => {
            console.error('Error deleting mobile sign location assign:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translateService.instant('ERROR'),
              detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.DELETE_ERROR')
            });
            this.loading = false;
          }
        });
      }
    });
  }

  deleteSelected() {
    if (this.selectedItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('WARNING'),
        detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.SELECT_ITEMS_FIRST')
      });
      return;
    }

    this.confirmationService.confirm({
      message: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.DELETE_SELECTED_CONFIRMATION_MESSAGE'),
      header: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.DELETE_CONFIRMATION_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        const recIds = this.selectedItems.map(item => item.recId);
        
        this.mobileSignLocationAssignService.deleteSelectedMobileSignLocationAssign(
          this.paginationRequest.lang,
          recIds
        ).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('SUCCESS'),
              detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.DELETE_SELECTED_SUCCESS')
            });
            this.loadMobileSignLocationAssigns();
          },
          error: (error) => {
            console.error('Error deleting selected mobile sign location assigns:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translateService.instant('ERROR'),
              detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.DELETE_SELECTED_ERROR')
            });
            this.loading = false;
          }
        });
      }
    });
  }

  // Selection methods
  isSelected(item: MobileSignLocationAssign): boolean {
    return this.selectedItems.some(selected => selected.recId === item.recId);
  }

  toggleSelection(item: MobileSignLocationAssign) {
    const index = this.selectedItems.findIndex(selected => selected.recId === item.recId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
  }

  toggleSelectAll() {
    if (this.isAllSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.mobileSignLocationAssigns];
    }
  }

  // Utility methods for displaying data
  getForEveryoneText(forEveryoneId: number): string {
    return forEveryoneId === 1 ? 'COMMON.YES' : 'COMMON.NO';
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  // Form validation getters
  get isAssignmentFormValid(): boolean {
    return this.assignmentForm.valid && this.isDateRangeValid() && this.validateGroupSelectionForUI();
  }

  private validateGroupSelectionForUI(): boolean {
    const assignType = this.assignmentForm.get('assignType')?.value;
    
    if (assignType === 'everyone') {
      return true; // No additional validation needed for "For Everyone"
    }
    
    // For group assignment, check if at least one group type is selected with items
    const groupTypes = this.assignmentForm.get('groupTypes')?.value;
    const hasEmployees = groupTypes.employees && this.selectedEmployeeIds.length > 0;
    const hasDepartments = groupTypes.departments && this.selectedDepartmentIds.length > 0;
    const hasBranches = groupTypes.branches && this.selectedBranchIds.length > 0;
    const hasRoles = groupTypes.roles && this.selectedRoleIds.length > 0;
    const hasDepartmentManagers = groupTypes.departmentManagers && this.selectedDepartmentManagerIds.length > 0;
    const hasBranchManagers = groupTypes.branchManagers && this.selectedBranchManagerIds.length > 0;
    
    return hasEmployees || hasDepartments || hasBranches || hasRoles || hasDepartmentManagers || hasBranchManagers;
  }

  isDateRangeValid(): boolean {
    const startDate = this.assignmentForm.get('startDate')?.value;
    const endDate = this.assignmentForm.get('endDate')?.value;
    
    if (!startDate || !endDate) return true; // Let required validation handle empty dates
    
    return new Date(endDate) >= new Date(startDate);
  }

  // Modal and form methods
  addMobileSignLocationAssign() {
    this.isEditMode = false;
    this.selectedAssignment = null;
    this.resetForm();
    this.showAddModal = true;

  }

  closeModal() {
    this.showAddModal = false;
    this.resetForm();
    this.selectedAssignment = null;
  }

  private resetForm() {
    this.assignmentForm.patchValue({
      assignType: 'everyone',
      locationId: '',
      startDate: '',
      endDate: '',
      note: '',
      groupTypes: {
        employees: false,
        departments: false,
        branches: false,
        roles: false,
        departmentManagers: false,
        branchManagers: false
      }
    });

    // Clear all multi-select selections
    Object.keys(this.multiSelectStates).forEach(category => {
      this.multiSelectStates[category].selected = [];
      this.multiSelectStates[category].searchTerm = '';
    });

    // Reset selected IDs arrays
    this.selectedEmployeeIds = [];
    this.selectedDepartmentIds = [];
    this.selectedBranchIds = [];
    this.selectedRoleIds = [];
    this.selectedDepartmentManagerIds = [];
    this.selectedBranchManagerIds = [];
  }

  // Form workflow event handlers
  onAssignTypeChange() {
    const assignType = this.assignmentForm.get('assignType')?.value;
    if (assignType === 'everyone') {
      // Clear group selections when switching to "For Everyone"
      this.assignmentForm.patchValue({
        groupTypes: {
          employees: false,
          departments: false,
          branches: false,
          roles: false,
          departmentManagers: false,
          branchManagers: false
        }
      });
      // Clear all selections when switching to "For Everyone"
      Object.keys(this.multiSelectStates).forEach(category => {
        this.clearSelection(category);
      });
    }
  }

  onGroupTypeChange(groupType: string) {
    // Clear selections for this group type when unchecked
    const isChecked = this.assignmentForm.get(`groupTypes.${groupType}`)?.value;
    if (!isChecked) {
      this.clearSelection(groupType);
    }
  }

  // Generic multi-select methods
  getFilteredItems(category: string): SelectableItem[] {
    if (!this.multiSelectStates[category]) return [];
    
    const searchTerm = this.multiSelectStates[category].searchTerm.toLowerCase();
    return this.multiSelectStates[category].available.filter(item =>
      item.name.toLowerCase().includes(searchTerm)
    );
  }

  isItemSelected(category: string, item: SelectableItem): boolean {
    if (!this.multiSelectStates[category]) return false;
    return this.multiSelectStates[category].selected.some(selected => selected.id === item.id);
  }

  toggleItemSelection(category: string, item: SelectableItem): void {
    if (!this.multiSelectStates[category]) return;
    
    const selected = this.multiSelectStates[category].selected;
    const index = selected.findIndex(selected => selected.id === item.id);
    
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(item);
    }
    
    this.updateSelectedIds(category);
  }

  clearSelection(category: string): void {
    if (this.multiSelectStates[category]) {
      this.multiSelectStates[category].selected = [];
      this.multiSelectStates[category].searchTerm = '';
      this.updateSelectedIds(category);
    }
  }

  private clearAllSelections() {
    Object.keys(this.multiSelectStates).forEach(category => {
      this.clearSelection(category);
    });
  }

  updateSearchTerm(category: string, searchTerm: string): void {
    if (this.multiSelectStates[category]) {
      this.multiSelectStates[category].searchTerm = searchTerm;
    }
  }

  onSearchInput(event: Event, category: string): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.updateSearchTerm(category, target.value);
    }
  }

  getSelectedCount(category: string): number {
    return this.multiSelectStates[category]?.selected.length || 0;
  }

  // Methods for Select All functionality in dropdowns
  selectAllItems(category: string): void {
    if (!this.multiSelectStates[category]) return;
    
    const filteredItems = this.getFilteredItems(category);
    this.multiSelectStates[category].selected = [...filteredItems];
    this.updateSelectedIds(category);
  }

  hasSelectableItems(category: string): boolean {
    return this.getFilteredItems(category).length > 0;
  }

  areAllItemsSelected(category: string): boolean {
    const filteredItems = this.getFilteredItems(category);
    const selected = this.multiSelectStates[category]?.selected || [];
    return filteredItems.length > 0 && filteredItems.every(item => 
      selected.some(selected => selected.id === item.id)
    );
  }

  private updateSelectedIds(category: string) {
    const selected = this.multiSelectStates[category]?.selected || [];
    const ids = selected.map(item => Number(item.id));
    
    switch (category) {
      case 'employees':
        this.selectedEmployeeIds = ids;
        break;
      case 'departments':
        this.selectedDepartmentIds = ids;
        break;
      case 'branches':
        this.selectedBranchIds = ids;
        break;
      case 'roles':
        this.selectedRoleIds = ids;
        break;
      case 'departmentManagers':
        this.selectedDepartmentManagerIds = ids;
        break;
      case 'branchManagers':
        this.selectedBranchManagerIds = ids;
        break;
    }
  }

  // Core business methods for create and update
  submitMobileSignLocationAssign() {
    if (!this.isAssignmentFormValid) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('WARNING'),
        detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.FORM_VALIDATION_ERROR')
      });
      return;
    }

    const formData = this.assignmentForm.value;
    const assignType = formData.assignType;

    // Validate assignment type requirements
    if (assignType === 'group') {
      const hasGroupSelection = Object.values(formData.groupTypes).some((selected: any) => selected);
      if (!hasGroupSelection) {
        this.messageService.add({
          severity: 'warn',
          summary: this.translateService.instant('WARNING'),
          detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.SELECT_GROUP_TYPE_ERROR')
        });
        return;
      }

      // Check if any groups are selected but have no items
      const groupValidation = this.validateGroupSelections(formData.groupTypes);
      if (!groupValidation.isValid) {
        this.messageService.add({
          severity: 'warn',
          summary: this.translateService.instant('WARNING'),
          detail: this.translateService.instant(groupValidation.message)
        });
        return;
      }
    }

    // Validate date range
    if (!this.isDateRangeValid()) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('WARNING'),
        detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.END_DATE_BEFORE_START_DATE_ERROR')
      });
      return;
    }

    const requestData: MobileSignLocationAssignCreateRequest = {
      mobileSignLocationAssignCreateDto: {
        locId: Number(formData.locationId),
        forEveryone: assignType === 'everyone',
        sDate: formData.startDate,
        eDate: formData.endDate,
        note: formData.note || '',
        empIds: this.selectedEmployeeIds.join(','),
        deptIds: this.selectedDepartmentIds.join(','),
        branchIds: this.selectedBranchIds.join(','),
        roleIds: this.selectedRoleIds.join(','),
        deptMgrIds: this.selectedDepartmentManagerIds.join(','),
        branchMgrIds: this.selectedBranchManagerIds.join(','),
        ...(this.isEditMode && this.selectedAssignment && { recId: this.selectedAssignment.recId })
      }
    };

    this.loading = true;

    if (this.isEditMode && this.selectedAssignment) {
      // Update existing assignment
      this.mobileSignLocationAssignService.updateMobileSignLocationAssign(
        this.paginationRequest.lang,
        requestData
      ).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('SUCCESS'),
            detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.UPDATE_SUCCESS')
          });
          this.closeModal();
          this.loadMobileSignLocationAssigns();
        },
        error: (error) => {
          console.error('Error updating mobile sign location assign:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ERROR'),
            detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.UPDATE_ERROR')
          });
          this.loading = false;
        }
      });
    } else {
      // Create new assignment
      this.mobileSignLocationAssignService.createMobileSignLocationAssign(
        this.paginationRequest.lang,
        requestData
      ).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('SUCCESS'),
            detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.CREATE_SUCCESS')
          });
          this.closeModal();
          this.loadMobileSignLocationAssigns();
        },
        error: (error) => {
          console.error('Error creating mobile sign location assign:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ERROR'),
            detail: this.translateService.instant('MOBILE_SIGN_LOCATION_ASSIGN.CREATE_ERROR')
          });
          this.loading = false;
        }
      });
    }
  }

  private validateGroupSelections(groupTypes: any): { isValid: boolean; message: string } {
    const groupValidations = [
      { key: 'employees', ids: this.selectedEmployeeIds, message: 'MOBILE_SIGN_LOCATION_ASSIGN.SELECT_EMPLOYEES_ERROR' },
      { key: 'departments', ids: this.selectedDepartmentIds, message: 'MOBILE_SIGN_LOCATION_ASSIGN.SELECT_DEPARTMENTS_ERROR' },
      { key: 'branches', ids: this.selectedBranchIds, message: 'MOBILE_SIGN_LOCATION_ASSIGN.SELECT_BRANCHES_ERROR' },
      { key: 'roles', ids: this.selectedRoleIds, message: 'MOBILE_SIGN_LOCATION_ASSIGN.SELECT_ROLES_ERROR' },
      { key: 'departmentManagers', ids: this.selectedDepartmentManagerIds, message: 'MOBILE_SIGN_LOCATION_ASSIGN.SELECT_DEPT_MANAGERS_ERROR' },
      { key: 'branchManagers', ids: this.selectedBranchManagerIds, message: 'MOBILE_SIGN_LOCATION_ASSIGN.SELECT_BRANCH_MANAGERS_ERROR' }
    ];

    for (const validation of groupValidations) {
      if (groupTypes[validation.key] && validation.ids.length === 0) {
        return { isValid: false, message: validation.message };
      }
    }

    return { isValid: true, message: '' };
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.assignmentForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.assignmentForm): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `MOBILE_SIGN_LOCATION_ASSIGN.${fieldName.toUpperCase()}_REQUIRED`;
      }
    }
    return '';
  }
}
