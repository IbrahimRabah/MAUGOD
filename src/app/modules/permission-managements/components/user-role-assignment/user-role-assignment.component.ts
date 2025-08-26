import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RoleAssignmentService } from '../../services/role-assignment.service';
import { UserRoleAssignment } from '../../../../core/models/roleAssignment';
import { PaginationRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { Employees } from '../../../../core/models/employee';
import { Departments } from '../../../../core/models/department';
import { Manager } from '../../../../core/models/managers';
import { Branch } from '../../../../core/models/branch';
import { Role } from '../../../../core/models/Role';

@Component({
  selector: 'app-user-role-assignment',
  templateUrl: './user-role-assignment.component.html',
  styleUrl: './user-role-assignment.component.css',
  providers: [MessageService, ConfirmationService]
})
export class UserRoleAssignmentComponent implements OnInit {
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
    deptManager:false,
    branches:false,
    brancheManager:false,
    roles:false,
  };
  // Selection management
  selectedItems: Set<number> = new Set();
  
  // Reactive Forms
  userRoleAssignmentForm!: FormGroup;

  // Dropdown options (dummy data - replace with actual service calls)
  employees :Employees []= [];
  departments:Departments[] = [];
  deptManager: Manager[] = [];
  branches: Branch[] = [];
  brancheManager: Manager[] = [];
  roles: Role[] = []

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

  initializeForms() {
    this.userRoleAssignmentForm = this.fb.group({
      employeeId: ['', [Validators.required]],
      departmentId: [''],
      managerOfDepartmentId: [''],
      branchId: [''],
      managerOfBranchId: [''],
      roleId: ['', [Validators.required]],
      startDate: [''],
      endDate: [''],
      notes: ['']
    });
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
  }

  closeModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm() {
    this.userRoleAssignmentForm.reset();
    this.selectedRoleAssignment = null;
  }

  submitUserRoleAssignment() {
    if (this.userRoleAssignmentForm.valid) {
      const formData = this.userRoleAssignmentForm.value;
      
      if (this.isEditMode && this.selectedRoleAssignment) {
        // Update existing role assignment
        const updatedRoleAssignment: UserRoleAssignment = {
          ...this.selectedRoleAssignment,
          // Map form data to model properties
          fromEmployeeName: this.employees.find(e => e.value == formData.employeeId)?.label || '',
          fromDepartmentName: this.departments.find(d => d.value == formData.departmentId)?.label || null,
          fromManagerOfDepartmentName: this.deptManager.find(m => m.value == formData.managerOfDepartmentId)?.label || null,
          fromBranchName: this.branches.find(b => b.value == formData.branchId)?.label || null,
          fromManagerOfBranchName: this.brancheManager.find(m => m.value == formData.managerOfBranchId)?.label || null,
          fromRoleName: this.roles.find(r => r.value == formData.roleId)?.label || '',
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          note: formData.notes || null
        };

        this.roleAssignmentService.updateUserRoleAssignment(updatedRoleAssignment,this.langService.getLangValue()).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم تحديث تخصيص الدور بنجاح' : 'User role assignment updated successfully' 
            });
            this.closeModal();
            this.loadUserRoleAssignments();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'حدث خطأ أثناء تحديث تخصيص الدور' : 'An error occurred while updating the user role assignment' 
            });
          }
        });
      } else {
        // Add new role assignment
        const newRoleAssignment: UserRoleAssignment = {
          recId: 0, // This will be set by the backend
          fromEmployeeName: this.employees.find(e => e.value == formData.employeeId)?.label || '',
          fromDepartmentName: this.departments.find(d => d.value == formData.departmentId)?.label || null,
          fromManagerOfDepartmentName: this.deptManager.find(m => m.value == formData.managerOfDepartmentId)?.label || null,
          fromBranchName: this.branches.find(b => b.value == formData.branchId)?.label || null,
          fromManagerOfBranchName: this.brancheManager.find(m => m.value == formData.managerOfBranchId)?.label || null,
          fromRoleName: this.roles.find(r => r.value == formData.roleId)?.label || '',
          startDate: formData.startDate || null,
          startHijriDate: null,
          endDate: formData.endDate || null,
          endHijriDate: null,
          delegateId: null,
          note: formData.notes || null,
          del: "Del",
          sel: ""
        };

        this.roleAssignmentService.addUserRoleAssignment(newRoleAssignment, this.langService.getLangValue()).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم إضافة تخصيص الدور بنجاح' : 'User role assignment added successfully' 
            });
            this.closeModal();
            this.loadUserRoleAssignments();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'حدث خطأ أثناء إضافة تخصيص الدور' : 'An error occurred while adding the user role assignment' 
            });
          }
        });
      }
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
           this.dropdownDataLoaded.deptManager && 
           this.dropdownDataLoaded.branches && 
           this.dropdownDataLoaded.brancheManager && 
           this.dropdownDataLoaded.roles && 
           this.employees.length > 0 &&
           this.departments.length > 0 &&
           this.deptManager.length > 0 &&
           this.branches.length > 0 &&
           this.brancheManager.length > 0 &&
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
      // Only load Employee if not already loaded for this language
      if (!this.dropdownDataLoaded.employees || this.employees.length === 0) {
        console.log('Loading employees...');
        const employeePromise = this.dropdownService.getEmpsDropdownList(currentLang,empId).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.employees = response.data.employees || [];
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

      if (!this.dropdownDataLoaded.departments || this.departments.length === 0) {
        console.log('Loading departments...');
        const departmentPromise = this.dropdownService.getDepartmentsDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.departments = response.data.departments || [];
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

      if (!this.dropdownDataLoaded.deptManager || this.deptManager.length === 0) {
        console.log('Loading deptManager...');
        const departmentPromise = this.dropdownService.getManagersDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.deptManager = response.data.managers || [];
              this.dropdownDataLoaded.deptManager = true;
              console.log('deptManager loaded:', this.deptManager.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading deptManager';
              console.error('Failed to load deptManager:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(departmentPromise);
      }

      if (!this.dropdownDataLoaded.branches || this.branches.length === 0) {
        console.log('Loading branches...');
        const departmentPromise = this.dropdownService.getBranchesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.branches = response.data.parentBranches || [];
              this.dropdownDataLoaded.branches = true;
              console.log('branches loaded:', this.branches.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading branches';
              console.error('Failed to load branches:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(departmentPromise);
      }

      if (!this.dropdownDataLoaded.brancheManager || this.brancheManager.length === 0) {
        console.log('Loading brancheManager...');
        const departmentPromise = this.dropdownService.getBranchManagersDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.brancheManager = response.data.managers || [];
              this.dropdownDataLoaded.brancheManager = true;
              console.log('brancheManager loaded:', this.brancheManager.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading brancheManager';
              console.error('Failed to load brancheManager:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(departmentPromise);
      }

      if (!this.dropdownDataLoaded.roles || this.roles.length === 0) {
        console.log('Loading roles...');
        const departmentPromise = this.dropdownService.getEmployeeRolesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.roles = response.data.dropdownListsForRoleModuleRights || [];
              this.dropdownDataLoaded.roles = true;
              console.log('roles loaded:', this.roles.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading roles';
              console.error('Failed to load roles:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(departmentPromise);
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
    this.isEditMode = true;
    this.selectedRoleAssignment = roleAssignment;
    
    // Find the IDs from the names (reverse lookup)
    const employeeId = this.employees.find(e => e.label === roleAssignment.fromEmployeeName)?.value || '';
    const departmentId = this.departments.find(d => d.label === roleAssignment.fromDepartmentName)?.value || '';
    const managerOfDepartmentId = this.deptManager.find(m => m.label === roleAssignment.fromManagerOfDepartmentName)?.value || '';
    const branchId = this.branches.find(b => b.label === roleAssignment.fromBranchName)?.value || '';
    const managerOfBranchId = this.brancheManager.find(m => m.label === roleAssignment.fromManagerOfBranchName)?.value || '';
    const roleId = this.roles.find(r => r.label === roleAssignment.fromRoleName)?.value || '';
    
    this.userRoleAssignmentForm.patchValue({
      employeeId: employeeId,
      departmentId: departmentId,
      managerOfDepartmentId: managerOfDepartmentId,
      branchId: branchId,
      managerOfBranchId: managerOfBranchId,
      roleId: roleId,
      startDate: roleAssignment.startDate,
      endDate: roleAssignment.endDate,
      notes: roleAssignment.note
    });
    
    this.showAddModal = true;
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
      // Add more validation error messages as needed
    }
    return '';
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
}
