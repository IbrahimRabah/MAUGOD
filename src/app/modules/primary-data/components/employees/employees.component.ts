import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee, EmployeeResponse } from '../../../../core/models/employee';
import { PaginationRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css',
  providers: [MessageService, ConfirmationService]
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  showAddModal: boolean = false;
  showChangeNumberModal: boolean = false;
  showChangePasswordModal: boolean = false;
  selectedEmployee: Employee | null = null;
  isEditMode: boolean = false;
  
  // Reactive Forms
  employeeForm!: FormGroup;
  changeNumberForm!: FormGroup;
  changePasswordForm!: FormGroup;

  // Available numbers for dropdown (dummy data)
  availableNumbers = [
    { value: '100', label: '100' },
    { value: '101', label: '101' },
    { value: '102', label: '102' },
    { value: '103', label: '103' },
    { value: '104', label: '104' },
    { value: '105', label: '105' },
    { value: '200', label: '200' },
    { value: '201', label: '201' },
    { value: '202', label: '202' },
    { value: '203', label: '203' },
    { value: '300', label: '300' },
    { value: '301', label: '301' },
    { value: '302', label: '302' },
    { value: '400', label: '400' },
    { value: '401', label: '401' },
    { value: '500', label: '500' }
  ];

  // Dropdown options (dummy data)
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

  departments = [
    { id: 1, name: 'قسم الأسنان' },
    { id: 2, name: 'قسم الطوارئ' },
    { id: 3, name: 'قسم العمليات' },
    { id: 4, name: 'قسم الأطفال' },
    { id: 5, name: 'قسم النساء والولادة' },
    { id: 6, name: 'قسم العظام' },
    { id: 7, name: 'قسم العيون' },
    { id: 8, name: 'قسم الأنف والأذن والحنجرة' }
  ];

  statuses = [
    { id: 1, name: 'يعمل' },
    { id: 2, name: 'معطل' },
    { id: 3, name: 'مفصول' },
    { id: 4, name: 'مستقيل' },
    { id: 5, name: 'منتهي الخدمة' }
  ];

  genders = [
    { id: '1', name: 'ذكر' },
    { id: '2', name: 'أنثى' }
  ];

  maritalStatuses = [
    { id: '0', name: 'غير محدد' },
    { id: '1', name: 'أعزب' },
    { id: '2', name: 'متزوج' },
    { id: '3', name: 'مطلق' },
    { id: '4', name: 'أرمل' }
  ];

  languages = [
    { id: '1', name: 'English' },
    { id: '2', name: 'العربية' }
  ];
  
  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1, // Default to English, can be changed based on app's language settings
    empId: this.getStoredEmpId()
  };

  constructor(
    private employeeService: EmployeeService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1; 
      this.loadEmployees(); // Reload employees when language changes
    });
  }

  ngOnInit() {
    this.loadEmployees();
  }

  initializeForms() {
    this.employeeForm = this.fb.group({
      empName: ['', [Validators.required]],
      directMgrId: ['', [Validators.required]],
      deptId: ['', [Validators.required]],
      activeFlag: ['', [Validators.required]],
      statusId: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      smsPhone: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      maritalStatus: ['', [Validators.required]],
      natId: ['', [Validators.required]],
      govId: ['', [Validators.required]],
      jobTypId: ['', [Validators.required]],
      lang: ['', [Validators.required]],
      note: ['', [Validators.required]]
    });

    this.changeNumberForm = this.fb.group({
      newNumber: ['', [Validators.required]],
      notes: ['', [Validators.required]]
    });

    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }
  getStoredEmpId(): number | undefined {
    const empId = localStorage.getItem('empId');
    return empId ? parseInt(empId, 10) : undefined;
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
      this.loadEmployees();
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
    this.loadEmployees();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadEmployees();
  }
  addEmployee() {
    this.isEditMode = false;
    this.resetForm();
    this.showAddModal = true;
  }

  editEmployee(employee: Employee) {
    this.isEditMode = true;
    this.selectedEmployee = employee;
    this.employeeForm.patchValue({
      empName: employee.empName,
      directMgrId: employee.directMgr?.toString() || '',
      deptId: employee.deptId?.toString() || '',
      activeFlag: employee.activeFlag,
      statusId: employee.statusId || 1,
      email: employee.email || '',
      smsPhone: employee.smsPhone || '',
      gender: employee.gender || '1',
      maritalStatus: employee.maritalStatus || '0',
      natId: employee.natId || '',
      govId: employee.govId || '',
      jobTypId: employee.jobTypId,
      lang: employee.lang || '2',
      note: employee.note || ''
    });
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.isEditMode = false;
    this.selectedEmployee = null;
    this.resetForm();
  }

  resetForm() {
    this.employeeForm.reset({
      empName: '',
      directMgrId: '',
      deptId: '',
      activeFlag: '1',
      statusId: 1,
      email: '',
      smsPhone: '',
      gender: '1',
      maritalStatus: '0',
      natId: '',
      govId: '',
      jobTypId: 0,
      lang: '2',
      note: ''
    });
  }

  submitEmployee() {
    if (this.employeeForm.valid) {
      if (this.isEditMode) {
        console.log('Edit Employee Data:', this.employeeForm.value, 'Employee ID:', this.selectedEmployee?.empId);
        // TODO: Call API to update the employee
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجح', 
          detail: 'تم تحديث الموظف بنجاح' 
        });
      } else {
        console.log('New Employee Data:', this.employeeForm.value);
        // TODO: Call API to save the employee
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجح', 
          detail: 'تم إضافة الموظف بنجاح' 
        });
      }
      this.closeModal();
      // Reload the employees list
      this.loadEmployees();
    } else {
      // Mark all fields as touched to show validation errors
      this.employeeForm.markAllAsTouched();
    }
  }

  loadEmployees() {
    this.loading = true;
    this.employeeService.getEmployees(this.paginationRequest).subscribe({
      next: (response: EmployeeResponse) => {
        if (response.isSuccess) {
          this.employees = response.data.employees;
          this.totalRecords = response.data.totalCount;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load employees' });
        this.loading = false;
      }
    });
  }

  deleteEmployee(employee: Employee) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الموظف "${employee.empName}"؟\nلا يمكن التراجع عن هذا الإجراء.`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        console.log('Delete employee:', employee);
        // TODO: Call API to delete the employee
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجح', 
          detail: 'تم حذف الموظف بنجاح' 
        });
        // Reload the employees list
        this.loadEmployees();
      },
      reject: () => {
        // User cancelled - no action needed
      }
    });
  }

  changeEmployeeNumber(employee: Employee) {
    this.selectedEmployee = employee;
    this.showChangeNumberModal = true;
  }

  closeChangeNumberModal() {
    this.showChangeNumberModal = false;
    this.selectedEmployee = null;
    this.resetChangeNumberForm();
  }

  resetChangeNumberForm() {
    this.changeNumberForm.reset();
  }

  getOldEmployeeNumber(employee: Employee | null): string {
    if (!employee) return '';
    return employee.empId.toString();
  }

  submitChangeNumber() {
    if (this.changeNumberForm.valid) {
      console.log('Change Number Form Data:', {
        empId: this.selectedEmployee?.empId,
        empName: this.selectedEmployee?.empName,
        oldNumber: this.getOldEmployeeNumber(this.selectedEmployee),
        newNumber: this.changeNumberForm.value.newNumber,
        notes: this.changeNumberForm.value.notes
      });
      
      // TODO: Call API to change the employee number
      this.messageService.add({ 
        severity: 'success', 
        summary: 'نجح', 
        detail: 'تم تغيير رقم الموظف بنجاح' 
      });
      this.closeChangeNumberModal();
      // Reload the employees list
      this.loadEmployees();
    } else {
      // Mark all fields as touched to show validation errors
      this.changeNumberForm.markAllAsTouched();
    }
  }

  changePassword(employee: Employee) {
    this.selectedEmployee = employee;
    this.resetChangePasswordForm();
    this.showChangePasswordModal = true;
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
    this.selectedEmployee = null;
    this.resetChangePasswordForm();
  }

  resetChangePasswordForm() {
    this.changePasswordForm.reset();
  }

  submitChangePassword() {
    if (this.changePasswordForm.valid) {
      const formValue = this.changePasswordForm.value;
      
      if (formValue.newPassword !== formValue.confirmPassword) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين' 
        });
        return;
      }

      console.log('Change Password Form Data:', {
        empId: this.selectedEmployee?.empId,
        empName: this.selectedEmployee?.empName,
        newPassword: formValue.newPassword
      });
      
      // TODO: Call API to change the employee password
      this.messageService.add({ 
        severity: 'success', 
        summary: 'نجح', 
        detail: 'تم تغيير كلمة مرور الموظف بنجاح' 
      });
      this.closeChangePasswordModal();
    } else {
      // Mark all fields as touched to show validation errors
      this.changePasswordForm.markAllAsTouched();
    }
  }

  getActiveFlagDisplay(activeFlag: string): string {
    return activeFlag === '1' ? 'نشط' : 'غير نشط';
  }

  getLanguageDisplay(lang: string): string {
    return lang === '1' ? 'English' : 'العربية';
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.employeeForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.employeeForm): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (field.errors['email']) {
        return 'يرجى إدخال بريد إلكتروني صحيح';
      }
      if (field.errors['minlength']) {
        return `يجب أن تحتوي كلمة المرور على ${field.errors['minlength'].requiredLength} أحرف على الأقل`;
      }
    }
    return '';
  }

  // Getter methods for form validation
  get isEmployeeFormValid(): boolean {
    return this.employeeForm.valid;
  }

  get isChangeNumberFormValid(): boolean {
    return this.changeNumberForm.valid;
  }

  get isChangePasswordFormValid(): boolean {
    if (!this.changePasswordForm.valid) return false;
    const formValue = this.changePasswordForm.value;
    return formValue.newPassword === formValue.confirmPassword;
  }

  get passwordsMatch(): boolean {
    const formValue = this.changePasswordForm.value;
    return formValue.newPassword === formValue.confirmPassword;
  }
}
