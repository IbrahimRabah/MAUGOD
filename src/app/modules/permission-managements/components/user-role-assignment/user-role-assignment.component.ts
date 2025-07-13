import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RoleAssignmentService } from '../../services/role-assignment.service';
import { UserRoleAssignment } from '../../../../core/models/roleAssignment';
import { PaginationRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';

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
  
  // Selection management
  selectedItems: Set<number> = new Set();
  
  // Reactive Forms
  userRoleAssignmentForm!: FormGroup;

  // Dropdown options (dummy data - replace with actual service calls)
  employees = [
    { id: 1, name: 'مالك عبدالله مصعب عبدالله' },
    { id: 2, name: 'صالح الصالح' },
    { id: 3, name: 'خالد الخالد' },
    { id: 4, name: 'مانع المانع' },
    { id: 5, name: 'سالم السالم' },
    { id: 6, name: 'فهد الفهد' },
    { id: 7, name: 'طارق سالم عمر طارق' },
    { id: 8, name: 'مدير النظام' }
  ];

  departments = [
    { id: 1, name: 'المركز الرئيسي' },
    { id: 2, name: 'الجامعة' },
    { id: 3, name: 'فرع المجمعة' },
    { id: 4, name: 'فرع الحوطة' },
    { id: 5, name: 'فرع الزلفي' },
    { id: 6, name: 'مشفى سليمان الحبيب' }
  ];

  managers = [
    { id: 1, name: 'مالك عبدالله مصعب عبدالله' },
    { id: 2, name: 'صالح الصالح' },
    { id: 3, name: 'خالد الخالد' },
    { id: 4, name: 'مانع المانع' },
    { id: 5, name: 'سالم السالم' },
    { id: 6, name: 'فهد الفهد' },
    { id: 7, name: 'طارق سالم عمر طارق' },
    { id: 8, name: 'مدير النظام' }
  ];

  branches = [
    { id: 1, name: 'المركز الرئيسي' },
    { id: 2, name: 'الجامعة' },
    { id: 3, name: 'فرع المجمعة' },
    { id: 4, name: 'فرع رماح' },
    { id: 5, name: 'فرع الزلفي' },
    { id: 6, name: 'فرع الغاط' },
    { id: 7, name: 'فرع الحوطة' },
    { id: 8, name: 'فرع حرمة' }
  ];

  roles = [
    { id: 1, name: 'نظام الإتصالات الإدارية - إضافة كلمات مفتاحية' },
    { id: 2, name: 'نظام الإتصالات الإدارية - مدير النظام' },
    { id: 3, name: 'نظام الموارد البشرية - إدارة الموظفين' },
    { id: 4, name: 'نظام الموارد البشرية - مدير النظام' },
    { id: 5, name: 'نظام المحاسبة - محاسب' },
    { id: 6, name: 'نظام المحاسبة - مدير مالي' },
    { id: 7, name: 'نظام التقارير - مراجع' },
    { id: 8, name: 'نظام التقارير - مدير التقارير' }
  ];
  
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
          fromEmployeeName: this.employees.find(e => e.id == formData.employeeId)?.name || '',
          fromDepartmentName: this.departments.find(d => d.id == formData.departmentId)?.name || null,
          fromManagerOfDepartmentName: this.managers.find(m => m.id == formData.managerOfDepartmentId)?.name || null,
          fromBranchName: this.branches.find(b => b.id == formData.branchId)?.name || null,
          fromManagerOfBranchName: this.managers.find(m => m.id == formData.managerOfBranchId)?.name || null,
          fromRoleName: this.roles.find(r => r.id == formData.roleId)?.name || '',
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          note: formData.notes || null
        };

        this.roleAssignmentService.updateUserRoleAssignment(updatedRoleAssignment).subscribe({
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
          fromEmployeeName: this.employees.find(e => e.id == formData.employeeId)?.name || '',
          fromDepartmentName: this.departments.find(d => d.id == formData.departmentId)?.name || null,
          fromManagerOfDepartmentName: this.managers.find(m => m.id == formData.managerOfDepartmentId)?.name || null,
          fromBranchName: this.branches.find(b => b.id == formData.branchId)?.name || null,
          fromManagerOfBranchName: this.managers.find(m => m.id == formData.managerOfBranchId)?.name || null,
          fromRoleName: this.roles.find(r => r.id == formData.roleId)?.name || '',
          startDate: formData.startDate || null,
          startHijriDate: null,
          endDate: formData.endDate || null,
          endHijriDate: null,
          delegateId: null,
          note: formData.notes || null,
          del: "Del",
          sel: ""
        };

        this.roleAssignmentService.addUserRoleAssignment(newRoleAssignment).subscribe({
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
    const employeeId = this.employees.find(e => e.name === roleAssignment.fromEmployeeName)?.id || '';
    const departmentId = this.departments.find(d => d.name === roleAssignment.fromDepartmentName)?.id || '';
    const managerOfDepartmentId = this.managers.find(m => m.name === roleAssignment.fromManagerOfDepartmentName)?.id || '';
    const branchId = this.branches.find(b => b.name === roleAssignment.fromBranchName)?.id || '';
    const managerOfBranchId = this.managers.find(m => m.name === roleAssignment.fromManagerOfBranchName)?.id || '';
    const roleId = this.roles.find(r => r.name === roleAssignment.fromRoleName)?.id || '';
    
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
        this.roleAssignmentService.deleteUserRoleAssignment(roleAssignment.recId).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم حذف تخصيص الدور بنجاح' : 'User role assignment deleted successfully' 
            });
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
          this.roleAssignmentService.deleteUserRoleAssignment(id).subscribe({
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
