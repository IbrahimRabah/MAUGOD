import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RoleAssignmentService } from '../../services/role-assignment.service';
import { UserRoleAssignment, AssignUserRolesRequest } from '../../../../core/models/roleAssignment';
import { PaginationRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { Employees } from '../../../../core/models/employee';
import { Departments } from '../../../../core/models/department';
import { Manager } from '../../../../core/models/managers';
import { Branch } from '../../../../core/models/branch';
import { Role } from '../../../../core/models/Role';

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
  selector: 'app-user-role-assignment',
  templateUrl: './user-role-assignment.component.html',
  styleUrl: './user-role-assignment.component.css',
  providers: [MessageService, ConfirmationService]
})
export class UserRoleAssignmentComponent implements OnInit, OnDestroy {
  userRoleAssignments: UserRoleAssignment[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  showAddModal: boolean = false;
  selectedRoleAssignment: UserRoleAssignment | null = null;
  isEditMode: boolean = false;
  private dropdownDataLoaded = {
    employees: false,
    departments: false,
    departmentManagers: false,
    branches: false,
    branchManagers: false,
    roles: false,
  };
  
  // Selection management
  selectedItems: Set<number> = new Set();
  
  // Reactive Forms
  userRoleAssignmentForm!: FormGroup;

  // Multi-select state management
  multiSelectStates: { [key: string]: MultiSelectState } = {
    employees: { available: [], selected: [], searchTerm: '' },
    departments: { available: [], selected: [], searchTerm: '' },
    branches: { available: [], selected: [], searchTerm: '' },
    roles: { available: [], selected: [], searchTerm: '' },
    departmentManagers: { available: [], selected: [], searchTerm: '' },
    branchManagers: { available: [], selected: [], searchTerm: '' }
  };

  // Section visibility checkboxes
  sectionVisibility: { [key: string]: boolean } = {
    employees: false,
    departments: false,
    branches: false,
    roles: false,
    departmentManagers: false,
    branchManagers: false
  };

  // Dynamic data from services
  employees: Employees[] = [];
  departments: Departments[] = [];
  branches: Branch[] = [];
  roles: Role[] = [];
  departmentManagers: Manager[] = [];
  branchManagers: Manager[] = [];
  
  // Loading states for each data type
  loadingEmployees = false;
  loadingDepartments = false;
  loadingBranches = false;
  loadingRoles = false;
  loadingDepartmentManagers = false;
  loadingBranchManagers = false;

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
    lang: 1 // Default to English, can be changed based on app's language settings
  };

  constructor(
    private roleAssignmentService: RoleAssignmentService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dropdownService: DropdownlistsService,
    private fb: FormBuilder,
    private authService: AuthenticationService
  ) {
    this.initializeForms();
    
    // Set empId from authentication service
    this.paginationRequest.empId = this.authService.getEmpIdAsNumber();
    
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1; 
      this.loadUserRoleAssignments(); // Reload role assignments when language changes
    });
  }

  ngOnInit() {
    this.loadUserRoleAssignments();
    this.loadDropdownData();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  initializeForms() {
    this.userRoleAssignmentForm = this.fb.group({
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      notes: ['']
    }, { validators: this.dateRangeValidator });
  }

  // Custom validator to ensure start date is not after end date
  dateRangeValidator(form: AbstractControl): ValidationErrors | null {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return { dateRangeInvalid: true };
      }
    }
    
    return null;
  }

  // Custom pagination methods
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadUserRoleAssignments();
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
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadUserRoleAssignments();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadUserRoleAssignments();
  }

  // Selection methods
  get isAllSelected(): boolean {
    return this.userRoleAssignments.length > 0 && this.selectedItems.size === this.userRoleAssignments.length;
  }

  get isIndeterminate(): boolean {
    return this.selectedItems.size > 0 && this.selectedItems.size < this.userRoleAssignments.length;
  }

  toggleSelectAll(event: any) {
    if (event.target.checked) {
      this.userRoleAssignments.forEach(item => this.selectedItems.add(item.recId));
    } else {
      this.selectedItems.clear();
    }
  }

  toggleSelectItem(recId: number, event: any) {
    if (event.target.checked) {
      this.selectedItems.add(recId);
    } else {
      this.selectedItems.delete(recId);
    }
  }

  // Modal methods
  addUserRoleAssignment() {
    this.isEditMode = false;
    this.showAddModal = true;
    this.resetForm(); // Reset form and multi-select states
    
    // Pre-load all dropdown data in background so it's available when sections are checked
    this.loadDropdownDataIfNeeded();
  }

  closeModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm() {
    this.userRoleAssignmentForm.reset();
    this.selectedRoleAssignment = null;
    // Reset multi-select states
    Object.keys(this.multiSelectStates).forEach(key => {
      this.multiSelectStates[key].selected = [];
      this.multiSelectStates[key].searchTerm = '';
    });
    // Reset selected IDs
    this.selectedEmployeeIds = [];
    this.selectedDepartmentIds = [];
    this.selectedBranchIds = [];
    this.selectedRoleIds = [];
    this.selectedDepartmentManagerIds = [];
    this.selectedBranchManagerIds = [];
    // Reset section visibility checkboxes
    Object.keys(this.sectionVisibility).forEach(key => {
      this.sectionVisibility[key] = false;
    });
  }

  // Toggle section visibility
  toggleSectionVisibility(section: string) {
    this.sectionVisibility[section] = !this.sectionVisibility[section];
    
    // If section is being enabled, populate its data immediately
    if (this.sectionVisibility[section]) {
      console.log(`Enabling section: ${section}`);
      // Populate from existing data immediately
      this.populateMultiSelectState(section);
      
      // Ensure data is loaded (this will run in background if needed)
      this.loadDropdownDataIfNeeded().then(() => {
        // Populate again in case new data was loaded
        this.populateMultiSelectState(section);
      });
    }
    
    // If section is being hidden, clear its selections
    if (!this.sectionVisibility[section]) {
      console.log(`Disabling section: ${section}`);
      this.multiSelectStates[section].selected = [];
      this.multiSelectStates[section].searchTerm = '';
      
      // Clear corresponding selected IDs
      switch (section) {
        case 'employees':
          this.selectedEmployeeIds = [];
          break;
        case 'departments':
          this.selectedDepartmentIds = [];
          break;
        case 'branches':
          this.selectedBranchIds = [];
          break;
        case 'roles':
          this.selectedRoleIds = [];
          break;
        case 'departmentManagers':
          this.selectedDepartmentManagerIds = [];
          break;
        case 'branchManagers':
          this.selectedBranchManagerIds = [];
          break;
      }
    }
  }

  // Helper method to populate multiSelectState for specific section
  private populateMultiSelectState(section: string) {
    switch (section) {
      case 'employees':
        if (this.employees.length > 0) {
          this.multiSelectStates['employees'].available = this.employees.map(emp => ({
            id: emp.value,
            name: emp.label
          }));
          console.log('Populated employees multiSelectState:', this.multiSelectStates['employees'].available.length);
        }
        break;
      case 'departments':
        if (this.departments.length > 0) {
          this.multiSelectStates['departments'].available = this.departments.map(dept => ({
            id: dept.value,
            name: dept.label
          }));
          console.log('Populated departments multiSelectState:', this.multiSelectStates['departments'].available.length);
        }
        break;
      case 'branches':
        if (this.branches.length > 0) {
          this.multiSelectStates['branches'].available = this.branches.map(branch => ({
            id: branch.value,
            name: branch.label
          }));
          console.log('Populated branches multiSelectState:', this.multiSelectStates['branches'].available.length);
        }
        break;
      case 'roles':
        if (this.roles.length > 0) {
          this.multiSelectStates['roles'].available = this.roles.map(role => ({
            id: role.value,
            name: role.label
          }));
          console.log('Populated roles multiSelectState:', this.multiSelectStates['roles'].available.length);
        }
        break;
      case 'departmentManagers':
        if (this.departmentManagers.length > 0) {
          this.multiSelectStates['departmentManagers'].available = this.departmentManagers.map(mgr => ({
            id: mgr.value,
            name: mgr.label
          }));
          console.log('Populated departmentManagers multiSelectState:', this.multiSelectStates['departmentManagers'].available.length);
        }
        break;
      case 'branchManagers':
        if (this.branchManagers.length > 0) {
          this.multiSelectStates['branchManagers'].available = this.branchManagers.map(mgr => ({
            id: mgr.value,
            name: mgr.label
          }));
          console.log('Populated branchManagers multiSelectState:', this.multiSelectStates['branchManagers'].available.length);
        }
        break;
    }
  }

  submitUserRoleAssignment() {
    if (this.userRoleAssignmentForm.valid) {
      const formData = this.userRoleAssignmentForm.value;
      
      // Prepare the payload according to AssignUserRolesRequest interface
      const payload: AssignUserRolesRequest = {
        assignedRoles: this.selectedRoleIds,
        empIds: this.selectedEmployeeIds,
        mgrOfDeptIds: this.selectedDepartmentManagerIds,
        deptIds: this.selectedDepartmentIds,
        mgrOfBranchIds: this.selectedBranchManagerIds,
        branchIds: this.selectedBranchIds,
        roleIds: this.selectedRoleIds,
        fromDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
        toDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
        notes: formData.notes || '',
        currentEmpId: this.authService.getEmpIdAsNumber() || 0
      };

      // Console.log values before submission
      console.log('=== USER ROLE ASSIGNMENT SUBMISSION ===');
      console.log('Selected Employees:', this.selectedEmployeeIds);
      console.log('Selected Departments:', this.selectedDepartmentIds);
      console.log('Selected Department Managers:', this.selectedDepartmentManagerIds);
      console.log('Selected Branches:', this.selectedBranchIds);
      console.log('Selected Branch Managers:', this.selectedBranchManagerIds);
      console.log('Selected Roles:', this.selectedRoleIds);
      console.log('Start Date:', formData.startDate);
      console.log('End Date:', formData.endDate);
      console.log('Current Employee ID:', this.authService.getEmpIdAsNumber());
      console.log('Complete Payload:', payload);
      console.log('=======================================');

      // Call the assignUserRoles endpoint
      this.roleAssignmentService.assignUserRoles(this.langService.getLangValue(), payload).subscribe({
        next: (response) => {
          console.log('Assignment Response:', response);
          this.messageService.add({ 
            severity: 'success', 
            summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
            detail: this.langService.getCurrentLang() === 'ar' ? 'تم تخصيص الأدوار بنجاح' : 'User roles assigned successfully' 
          });
          this.closeModal();
          this.loadUserRoleAssignments();
        },
        error: (error) => {
          console.error('Assignment Error:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
            detail: this.langService.getCurrentLang() === 'ar' ? 'حدث خطأ أثناء تخصيص الأدوار' : 'An error occurred while assigning user roles' 
          });
        }
      });
    } else {
      this.markFormGroupTouched(this.userRoleAssignmentForm);
    }
  }

  getStoredEmpId(): number  {
    const empId = localStorage.getItem('empId');
    return Number(empId);
  }

  async loadDropdownData() {
    await this.loadDropdownDataIfNeeded();
  }

private areAllDropdownsLoaded(): boolean {
    return this.dropdownDataLoaded.employees && 
           this.dropdownDataLoaded.departments && 
           this.dropdownDataLoaded.departmentManagers && 
           this.dropdownDataLoaded.branches && 
           this.dropdownDataLoaded.branchManagers && 
           this.dropdownDataLoaded.roles && 
           this.employees.length > 0 &&
           this.departments.length > 0 &&
           this.branches.length > 0 &&
           this.roles.length > 0 ;
  }

private async loadDropdownDataIfNeeded(): Promise<void> {
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const langKey = this.langService.getCurrentLang();
    const empId = this.getStoredEmpId();

    // Check if we already have data for this language
    if (this.areAllDropdownsLoaded()) {
      console.log('Dropdown data already loaded for current language, skipping API calls');
      return Promise.resolve();
    }

    console.log('Loading dropdown data for language:', langKey, 'API lang code:', currentLang);

    try {
      const loadPromises: Promise<any>[] = [];
      
      // Load Employees
      if (!this.dropdownDataLoaded.employees || this.employees.length === 0) {
        console.log('Loading employees...');
        const employeePromise = this.dropdownService.getEmpsDropdownList(currentLang, empId).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.employees = response.data.employees || [];
              this.multiSelectStates['employees'].available = this.employees.map(emp => ({
                id: emp.value,
                name: emp.label
              }));
              this.dropdownDataLoaded.employees = true;
              console.log('Employees loaded:', this.employees.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading employees';
              console.error('Failed to load employees:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(employeePromise);
      }

      // Load Departments
      if (!this.dropdownDataLoaded.departments || this.departments.length === 0) {
        console.log('Loading departments...');
        const departmentPromise = this.dropdownService.getDepartmentsDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.departments = response.data.departments || [];
              this.multiSelectStates['departments'].available = this.departments.map(dept => ({
                id: dept.value,
                name: dept.label
              }));
              this.dropdownDataLoaded.departments = true;
              console.log('Departments loaded:', this.departments.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading departments';
              console.error('Failed to load departments:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(departmentPromise);
      }

      // Load Department Managers (use same departments endpoint)
      if (!this.dropdownDataLoaded.departmentManagers || this.departmentManagers.length === 0) {
        console.log('Loading department managers...');
        const deptManagerPromise = this.dropdownService.getDepartmentsDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.departmentManagers = response.data.departments || [];
              this.multiSelectStates['departmentManagers'].available = this.departmentManagers.map(mgr => ({
                id: mgr.value,
                name: mgr.label
              }));
              this.dropdownDataLoaded.departmentManagers = true;
              console.log('Department managers loaded:', this.departmentManagers.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading department managers';
              console.error('Failed to load department managers:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(deptManagerPromise);
      }

      // Load Branches
      if (!this.dropdownDataLoaded.branches || this.branches.length === 0) {
        console.log('Loading branches...');
        const branchPromise = this.dropdownService.getBranchesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.branches = response.data.parentBranches || [];
              this.multiSelectStates['branches'].available = this.branches.map(branch => ({
                id: branch.value,
                name: branch.label
              }));
              this.dropdownDataLoaded.branches = true;
              console.log('Branches loaded:', this.branches.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading branches';
              console.error('Failed to load branches:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(branchPromise);
      }

      // Load Branch Managers (use same branches endpoint)
      if (!this.dropdownDataLoaded.branchManagers || this.branchManagers.length === 0) {
        console.log('Loading branch managers...');
        const branchManagerPromise = this.dropdownService.getBranchesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.branchManagers = response.data.parentBranches || [];
              this.multiSelectStates['branchManagers'].available = this.branchManagers.map(mgr => ({
                id: mgr.value,
                name: mgr.label
              }));
              this.dropdownDataLoaded.branchManagers = true;
              console.log('Branch managers loaded:', this.branchManagers.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading branch managers';
              console.error('Failed to load branch managers:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(branchManagerPromise);
      }

      // Load Roles
      if (!this.dropdownDataLoaded.roles || this.roles.length === 0) {
        console.log('Loading roles...');
        const rolePromise = this.dropdownService.getEmployeeRolesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.roles = response.data.dropdownListsForRoleModuleRights || [];
              this.multiSelectStates['roles'].available = this.roles.map(role => ({
                id: role.value,
                name: role.label
              }));
              this.dropdownDataLoaded.roles = true;
              console.log('Roles loaded:', this.roles.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading roles';
              console.error('Failed to load roles:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(rolePromise);
      }

      // If no API calls needed, resolve immediately
      if (loadPromises.length === 0) {
        console.log('All dropdown data already available');
        return;
      }

      // Wait for all needed API calls to complete
      await Promise.all(loadPromises);
      console.log('Smart dropdown loading completed');

    } catch (error) {
      console.error('Error in smart dropdown loading:', error);
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'فشل في تحميل بعض البيانات'
      });
    }
  }

  loadUserRoleAssignments() {
    this.loading = true;
    
    // Set empId from authentication service
    this.paginationRequest.empId = this.authService.getEmpIdAsNumber();
    this.roleAssignmentService.getAllUserRoleAssignments(this.paginationRequest).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.userRoleAssignments = response.data.userRoleAssignments;
          this.totalRecords = response.data.totalCount;
          this.selectedItems.clear(); // Clear selection when loading new data
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
            detail: response.message 
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
          detail: this.langService.getCurrentLang() === 'ar' ? 'حدث خطأ أثناء تحميل البيانات' : 'An error occurred while loading data' 
        });
        this.loading = false;
      }
    });
  }

  editUserRoleAssignment(roleAssignment: UserRoleAssignment) {
    // Edit functionality is not implemented in the new modal structure
    // The new modal is designed for creating assignments only
    this.messageService.add({
      severity: 'info',
      summary: this.langService.getCurrentLang() === 'ar' ? 'معلومات' : 'Info',
      detail: this.langService.getCurrentLang() === 'ar' ? 'وظيفة التعديل غير متاحة في النسخة الجديدة' : 'Edit functionality is not available in the new version'
    });
  }

  deleteUserRoleAssignment(roleAssignment: UserRoleAssignment) {
    this.confirmationService.confirm({
      message: this.langService.getCurrentLang() === 'ar' ? 
        `هل أنت متأكد من حذف تخصيص الدور للموظف "${roleAssignment.fromEmployeeName}"؟\nلا يمكن التراجع عن هذا الإجراء.` :
        `Are you sure you want to delete the role assignment for employee "${roleAssignment.fromEmployeeName}"?\nThis action cannot be undone.`,
      header: this.langService.getCurrentLang() === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.langService.getCurrentLang() === 'ar' ? 'نعم، احذف' : 'Yes, Delete',
      rejectLabel: this.langService.getCurrentLang() === 'ar' ? 'إلغاء' : 'Cancel',
      accept: () => {
        this.roleAssignmentService.deleteUserRoleAssignment(this.langService.getLangValue(), roleAssignment.recId).subscribe({
          next: (response) => {
            if(response.isSuccess){
              this.messageService.add({ 
                severity: 'success', 
                summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
                detail: response.message
              });
            }
            else{
              this.messageService.add({ 
                severity: 'faild', 
                summary: this.langService.getCurrentLang() === 'ar' ? 'فشل' : 'faild', 
                detail: response.message
              });
            }
            this.loadUserRoleAssignments();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'حدث خطأ أثناء حذف تخصيص الدور' : 'An error occurred while deleting the user role assignment' 
            });
          }
        });
      },
      reject: () => {
        // User cancelled the deletion
      }
    });
  }

  deleteSelectedRoleAssignments() {
    if (this.selectedItems.size === 0) {
      return;
    }

    const selectedCount = this.selectedItems.size;
    this.confirmationService.confirm({
      message: this.langService.getCurrentLang() === 'ar' ? 
        `هل أنت متأكد من حذف ${selectedCount} تخصيص دور؟\nلا يمكن التراجع عن هذا الإجراء.` :
        `Are you sure you want to delete ${selectedCount} role assignment(s)?\nThis action cannot be undone.`,
      header: this.langService.getCurrentLang() === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.langService.getCurrentLang() === 'ar' ? 'نعم، احذف' : 'Yes, Delete',
      rejectLabel: this.langService.getCurrentLang() === 'ar' ? 'إلغاء' : 'Cancel',
      accept: () => {
        // Convert Set to Array for processing
        const selectedIds = Array.from(this.selectedItems);
        let deletedCount = 0;
        let errorCount = 0;

        selectedIds.forEach(id => {
          this.roleAssignmentService.deleteUserRoleAssignment(this.langService.getLangValue(),id).subscribe({
            next: (response) => {
              deletedCount++;
              if (deletedCount + errorCount === selectedIds.length) {
                this.handleBulkDeleteComplete(deletedCount, errorCount);
              }
            },
            error: (error) => {
              errorCount++;
              if (deletedCount + errorCount === selectedIds.length) {
                this.handleBulkDeleteComplete(deletedCount, errorCount);
              }
            }
          });
        });
      },
      reject: () => {
        // User cancelled the deletion
      }
    });
  }

  private handleBulkDeleteComplete(deletedCount: number, errorCount: number) {
    if (deletedCount > 0) {
      this.messageService.add({ 
        severity: 'success', 
        summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
        detail: this.langService.getCurrentLang() === 'ar' ? 
          `تم حذف ${deletedCount} تخصيص دور بنجاح` : 
          `${deletedCount} role assignment(s) deleted successfully` 
      });
    }
    
    if (errorCount > 0) {
      this.messageService.add({ 
        severity: 'error', 
        summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
        detail: this.langService.getCurrentLang() === 'ar' ? 
          `فشل في حذف ${errorCount} تخصيص دور` : 
          `Failed to delete ${errorCount} role assignment(s)` 
      });
    }
    
    this.selectedItems.clear();
    this.loadUserRoleAssignments();
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.userRoleAssignmentForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.userRoleAssignmentForm): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return this.langService.getCurrentLang() === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
      }
    }
    
    // Check for form-level date range validation error
    if (formGroup.errors && formGroup.errors['dateRangeInvalid']) {
      if (fieldName === 'startDate' || fieldName === 'endDate') {
        return this.langService.getCurrentLang() === 'ar' ? 
          'تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية' : 
          'Start date must be before or equal to end date';
      }
    }
    
    return '';
  }

  // Check if form has date range error
  get hasDateRangeError(): boolean {
    return !!(this.userRoleAssignmentForm.errors && 
              this.userRoleAssignmentForm.errors['dateRangeInvalid'] && 
              (this.userRoleAssignmentForm.get('startDate')?.touched || 
               this.userRoleAssignmentForm.get('endDate')?.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for form validation
  get isUserRoleAssignmentFormValid(): boolean {
    return this.userRoleAssignmentForm.valid;
  }

  // Multi-select management methods
  filterAvailableItems(type: string, searchTerm: string) {
    const state = this.multiSelectStates[type];
    if (!searchTerm) {
      // Show all available items that are not already selected
      return state.available.filter(item => 
        !state.selected.some(selected => selected.id === item.id)
      );
    }
    return state.available.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !state.selected.some(selected => selected.id === item.id)
    );
  }

  addToSelected(type: string, item: SelectableItem) {
    const state = this.multiSelectStates[type];
    if (!state.selected.some(selected => selected.id === item.id)) {
      state.selected.push(item);
      this.updateSelectedIds(type);
    }
  }

  removeFromSelected(type: string, item: SelectableItem) {
    const state = this.multiSelectStates[type];
    state.selected = state.selected.filter(selected => selected.id !== item.id);
    this.updateSelectedIds(type);
  }

  addAllToSelected(type: string) {
    const state = this.multiSelectStates[type];
    const filteredItems = this.filterAvailableItems(type, state.searchTerm);
    filteredItems.forEach(item => {
      if (!state.selected.some(selected => selected.id === item.id)) {
        state.selected.push(item);
      }
    });
    this.updateSelectedIds(type);
  }

  removeAllFromSelected(type: string) {
    const state = this.multiSelectStates[type];
    state.selected = [];
    this.updateSelectedIds(type);
  }

  private updateSelectedIds(type: string) {
    const state = this.multiSelectStates[type];
    const selectedIds = state.selected.map(item => Number(item.id));
    
    switch (type) {
      case 'employees':
        this.selectedEmployeeIds = selectedIds;
        break;
      case 'departments':
        this.selectedDepartmentIds = selectedIds;
        break;
      case 'branches':
        this.selectedBranchIds = selectedIds;
        break;
      case 'roles':
        this.selectedRoleIds = selectedIds;
        break;
      case 'departmentManagers':
        this.selectedDepartmentManagerIds = selectedIds;
        break;
      case 'branchManagers':
        this.selectedBranchManagerIds = selectedIds;
        break;
    }
  }

  getSelectedCount(type: string): number {
    return this.multiSelectStates[type].selected.length;
  }

  getAvailableCount(type: string): number {
    return this.filterAvailableItems(type, this.multiSelectStates[type].searchTerm).length;
  }
}
