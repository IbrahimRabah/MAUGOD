import { Component, numberAttribute, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee, EmployeeCreateUpdateRequest, EmployeeResponse } from '../../../../core/models/employee';
import { PaginationRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { Departments } from '../../../../core/models/department';
import { Statuses } from '../../../../core/models/status';
import { Nationalities } from '../../../../core/models/nationality ';
import { Genders } from '../../../../core/models/gender';
import { MaritalStatuses } from '../../../../core/models/maritalStatus';
import { Jobs } from '../../../../core/models/jobs';
import { Languages } from '../../../../core/models/language';

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
  // showChangePasswordModal: boolean = false;
  selectedEmployee: Employee | null = null;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  deletingEmployeeId: number | null = null;
  loadingDropdowns: boolean = false;
  
  // Reactive Forms
  employeeForm!: FormGroup;
  changeNumberForm!: FormGroup;
  // changePasswordForm!: FormGroup;


  maritalStatuses:MaritalStatuses[] = [];

  departments:Departments[] = [];
  
  statuses :Statuses []= [];
  nationalities :Nationalities []= [];
  genders:Genders[] =[];
  jobs:Jobs[] =[];
  languages:Languages[]= [];

  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1, // Default to English, can be changed based on app's language settings
    empId: this.getStoredEmpId()
  };


  // Smart loading state tracking
  private dropdownDataLoaded = {
    statuses: false,
    departments: false,
    nationalities:false,
    genders:false,
    maritalStatuses:false,
    jobs:false,
    languages:false
  };

  private currentLanguage: string = '';
  private isInitialized = false;

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



  constructor(
    private employeeService: EmployeeService,
    public langService: LanguageService,
    private messageService: MessageService,
    // private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private dropdownService: DropdownlistsService
  ) {
    this.initializeForms();
    
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1; 

      // Only reload branches if component is already initialized (not first time)
      if (this.isInitialized) {
        this.loadEmployees(); // Reload employees when language changes
         this.resetDropdownState();
      }
      
    });
  }

  ngOnInit() {
    this.isInitialized = true;
    this.loadEmployees();
  }

  initialFormValues: any;

  initializeForms() {
   this.employeeForm = this.fb.group({
      rowId:[''],
      empNumber: [''],
      empArName: [''],
      empEnName: [''],
      deptId: ['', Validators.required],
      activeFlag: [false],
      statusId: ['', Validators.required],
      fingerPrint: [''],
      natId: [''],
      gender: [''],
      email: ['', Validators.email],
      phoneNum: [''],
      homeLandLine: [''],
      PhysicalAddr: [''],
      birthDate: [null],
      maritalstatus: [''],
      hireStartDate: [null],
      hireEndDate: [null],
      EmpvatInformation: [''],
      jobTypeId: [''],
      jobdescription: [''],
      nationalNumber: [''],
      nationalNumberExpiration: [null],
      driverLicenseNumber: [''],
      driverLicenseExpiration: [null],
      insuranceCardInformation: [''],
      insuranceCardExpiration: [null],
      employeeCardNumber: [''],
      employeeCardExpiration: [null],
      healthCardNumber: [''],
      healthCardExpiration: [null],
      passportNumber: [''],
      passportExpiration: [null],
      username: [''],
      password: [''],
      lang: ['', Validators.required],
      note: ['']
    });


  this.initialFormValues = this.employeeForm.value;

    this.changeNumberForm = this.fb.group({
      newNumber: ['', [Validators.required]],
    });

    // this.changePasswordForm = this.fb.group({
    //   newPassword: ['', [Validators.required, Validators.minLength(6)]],
    //   confirmPassword: ['', [Validators.required]]
    // });
  }


  getStoredEmpId(): number | undefined {
    const empId = localStorage.getItem('empId');
    return empId ? parseInt(empId, 10) : undefined;
  }

    isRequired(fieldName: string): boolean {
  const control = this.employeeForm.get(fieldName);
  if (!control || !control.validator) {
    return false;
  }
  const validator = control.validator({} as any);
  return validator && validator['required'] ? true : false;
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
    // this.resetForm();
    this.showAddModal = true;
    this.loadDropdownDataIfNeeded();
  }

  async editEmployee(employee: Employee) {

    // console.log('=== Edit Employee Called ===');
    // console.log('Employee to edit:', employee);
    
    this.isEditMode = true;
    this.selectedEmployee = employee;    
    // Reset form first
    this.employeeForm.reset();
    
    // Show modal first
    this.showAddModal = true;

    // Load dropdown data only if needed
    await this.loadDropdownDataIfNeeded();

    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    this.employeeService.getEmployeeById(employee.empId, currentLang).subscribe({
          next: (responce: any) => {
            var employeeDetails=responce.data
            console.log('Employee details from API:', employeeDetails);
            
            const convertedEmployee = {
                rowId: employeeDetails.rowID,
                empId: employeeDetails.empId === -1 ? null : employeeDetails.empId,
                empName: currentLang === 1 ? employeeDetails.en_Name : employeeDetails.ar_Name,// Or combine ar_Name & en_Name if needed
                directMgrName: '', // Will be filled from dropdown or API
                deptName: '',      // Will be filled from dropdown or API
                activeFlag: employeeDetails.activeFlag,
                statusId: employeeDetails.statusId,
                statusStr: '',     // Will be filled from status lookup
                deptId: employeeDetails.deptId,
                directMgr: null,   // Will be filled from dropdown or API
                natId: employeeDetails.natId,
                govId: employeeDetails.govId || '',
                gender: employeeDetails.gender,
                email: employeeDetails.email || '',
                smsPhone: employeeDetails.smsPhone || '',
                maritalStatus: employeeDetails.maritalStatus,
                jobTypId: employeeDetails.jobTypId,
                lang: employeeDetails.lang,
                note: employeeDetails.note || '',
                reset: '',         // Not needed now, may be handled later
                updatePk: ''       // Not needed now, may be handled later
            };

            
            console.log('Converted employee data:', convertedEmployee);
            this.selectedEmployee = convertedEmployee as Employee; // Update with complete data
            
            // Set basic form values immediately (non-dropdown fields)
            this.employeeForm.patchValue({
              rowId:employeeDetails.rowID,
              empNumber: employeeDetails.empId || '',
              empArName: employeeDetails.ar_Name || '',
              empEnName: employeeDetails.en_Name || '',
              deptId: employeeDetails.deptId || '',
              activeFlag: employeeDetails.activeFlag,
              statusId: employeeDetails.statusId || '',
              fingerPrint: employeeDetails.fpid || '',
              natId: employeeDetails.natId || '',
              gender: employeeDetails.gender || 0,
              email: employeeDetails.email || '',
              phoneNum: employeeDetails.smsPhone || '',
              homeLandLine: employeeDetails.phone || '',
              PhysicalAddr: employeeDetails.physicalAddress || '',
              birthDate: employeeDetails.birthDate ? this.formatDateForInput(employeeDetails.birthDate) : null,
              maritalstatus: employeeDetails.maritalStatus || 0,
              hireStartDate: employeeDetails.hireSDate ? this.formatDateForInput(employeeDetails.hireSDate) : null,
              hireEndDate: employeeDetails.hireEDate ? this.formatDateForInput(employeeDetails.hireEDate) : null,
              EmpvatInformation: employeeDetails.empVatInfo || '',
              jobTypeId: employeeDetails.jobTypId || '',
              jobdescription: employeeDetails.jobId || '',
              nationalNumber: employeeDetails.govId || '',
              nationalNumberExpiration: employeeDetails.govIdExpiration ? this.formatDateForInput(employeeDetails.govIdExpiration) : null,
              driverLicenseNumber: employeeDetails.driverLicenceNo || '',
              driverLicenseExpiration: employeeDetails.driverLicenceExpiration ? this.formatDateForInput(employeeDetails.driverLicenceExpiration) : null,
              insuranceCardInformation: employeeDetails.insuranceCardInfo || '',
              insuranceCardExpiration: employeeDetails.insuranceCardExpiration ? this.formatDateForInput(employeeDetails.insuranceCardExpiration) : null,
              employeeCardNumber: employeeDetails.employeeCardNo || '',
              employeeCardExpiration: employeeDetails.employeeCardExpiration ? this.formatDateForInput(employeeDetails.employeeCardExpiration) : null,
              healthCardNumber: employeeDetails.healthCardNo || '',
              healthCardExpiration: employeeDetails.healthCardExpiration ? this.formatDateForInput(employeeDetails.healthCardExpiration) : null,
              passportNumber: employeeDetails.passportNo || '',
              passportExpiration: employeeDetails.passportExpiration ? this.formatDateForInput(employeeDetails.passportExpiration) : null,
              username: employeeDetails.userName === '-1' ? '' : employeeDetails.userName || '',
              password: employeeDetails.passwd || '',
              lang: employeeDetails.lang || 2,
              note: employeeDetails.note || ''
            });
            console.log('Form after basic patch with API data:', this.employeeForm.value);
            
            // Since we already awaited dropdown loading, update form selections immediately
            this.updateFormDropdownSelections();
          },
          error: (error) => {
            console.error('Error loading Employee details:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'فشل في تحميل تفاصيل الفرع'
            });
            
            // Fallback to using the employee data from the list
            this.employeeForm.patchValue({
                rowId:employee.rowId,
                empNumber: employee.empId || '',
                empArName:employee.empName||'',
                empEnName:employee.empName||'',
                activeFlag: employee.activeFlag || '',
                statusId: employee.statusId || '1',
                deptId: employee.deptId || '',
                natId: employee.natId || '',
                govId: employee.govId || '',
                gender: employee.gender || '0',
                email: employee.email || '',
                smsPhone: employee.smsPhone || '',
                maritalStatus: employee.maritalStatus || '0',
                jobTypId: employee.jobTypId || '',
                lang: employee.lang || '2',
                note: employee.note || ''
            });
          }
        });
    this.showAddModal = true;
  }

  private formatDateForInput(dateString: string | Date | null): string | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  // Convert to YYYY-MM-DD format (required by HTML date input)
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

  closeModal() {
    this.showAddModal = false;
    this.isEditMode = false;
    // this.loadingDropdowns=true
    // this.selectedEmployee = null;
    this.resetForm();
  }

  resetForm() {
    this.employeeForm.reset();
     this.employeeForm.reset(this.initialFormValues);

  }

  submitEmployee() {
    if (this.employeeForm.valid && !this.isSubmitting) {

      this.isSubmitting = true;
            const formData = this.employeeForm.value;
            
            // Validate numeric fields
            const deptId = parseInt(formData.deptId);
            const statusId = parseInt(formData.statusId);
            const lang = parseInt(formData.lang);
            
            if (isNaN(deptId) || isNaN(statusId) ||isNaN(lang)) {
              this.messageService.add({ 
                severity: 'error', 
                summary: 'خطأ', 
                detail: 'يرجى التأكد من صحة البيانات المدخلة' 
              });
              this.isSubmitting = false;
              return;
            }
            
            // Prepare employee object based on the API requirements
            const employeeData: EmployeeCreateUpdateRequest = {
              rowId: formData.rowId ||0,
              empId: formData.empNumber || 0,
              ar: formData.empArName || '',
              en: formData.empEnName || '',
              activeFlag: formData.activeFlag ? Number(formData.activeFlag) : 0,
              statusId: Number(formData.statusId)||0,
              fpid: formData.fingerPrint||'',
              deptId: Number(formData.deptId)||0,
              natId: Number(formData.natId)||0,
              gender: Number(formData.gender)||0,
              email: formData.email ||'',
              smsPhone: formData.phoneNum||'',
              phone: formData.homeLandLine||'',
              physicalAddress: formData.PhysicalAddr ||'',
              maritalStatus:formData.maritalStatus||0,
              birthDate: formData.birthDate || null,
              hireSDate: formData.hireStartDate || null,
              hireEDate: formData.hireEndDate || null,
              jobId:formData.jobdescription ||'',
              jobTypId: formData.jobTypeId ||1,
              jobdesc:formData.jobdescription||'',
              empVatInfo: formData.EmpvatInformation||'',
              govId:formData.nationalNumber||'',
              govIdExpiration:formData.nationalNumberExpiration ||null,
              employeeCardNo: formData.employeeCardNo||'',
              employeeCardExpiration: formData.employeeCardExpiration || null,
              driverLicenceNo: formData.driverLicenceNo||'',
              driverLicenceExpiration: formData.driverLicenceExpiration || null,
              healthCardNo: formData.healthCardNo||'',
              healthCardExpiration: formData.healthCardExpiration || null,
              insuranceCardInfo: formData.insuranceCardInfo|| '',
              insuranceCardExpiration: formData.insuranceCardExpiration || null,
              passportNo: formData.passportNo||'',
              passportExpiration: formData.passportExpiration || null,
              userName: formData.userName||'',
              passwd: formData.passwd||'',
              lang:formData.lang||2,
              note: formData.note || ''
            };

      if (this.isEditMode) {
        console.log('Edit Employee Data:', this.employeeForm.value, 'Employee ID:', this.selectedEmployee?.empId);
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.employeeService.updateEmployee(this.selectedEmployee!.empId, employeeData, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم تحديث الموظف بنجاح' 
            });
            this.closeModal();
            this.loadEmployees();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating branch:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في تحديث الموظف. يرجى المحاولة مرة أخرى.' 
            });
            this.isSubmitting = false;
          }
        });
      } else {
        // Add new employee
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.employeeService.addEmployee(employeeData, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم إضافة الموظف بنجاح' 
            });
            this.closeModal();
            this.loadEmployees();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error adding branch:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في إضافة الموظف. يرجى المحاولة مرة أخرى.' 
            });
            this.isSubmitting = false;
          }
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

  // deleteEmployee(employee: Employee) {
  //   this.confirmationService.confirm({
  //     message: `هل أنت متأكد من حذف الموظف "${employee.empName}"؟\nلا يمكن التراجع عن هذا الإجراء.`,
  //     header: 'تأكيد الحذف',
  //     icon: 'pi pi-exclamation-triangle',
  //     acceptLabel: 'نعم، احذف',
  //     rejectLabel: 'إلغاء',
  //     accept: () => {
  //       this.deletingEmployeeId = employee.empId;
  //       // Call API to delete the branch
  //       this.employeeService.deleteEmployee(employee.empId).subscribe({
  //         next: (response) => {
  //           this.messageService.add({ 
  //             severity: 'success', 
  //             summary: 'نجح', 
  //             detail: 'تم حذف الفرع بنجاح' 
  //           });
  //           this.loadEmployees();
  //           this.deletingEmployeeId = null;
  //         },
  //         error: (error) => {
  //           console.error('Error deleting branch:', error);
  //           this.messageService.add({ 
  //             severity: 'error', 
  //             summary: 'خطأ', 
  //             detail: 'فشل في حذف الفرع. يرجى المحاولة مرة أخرى.' 
  //           });
  //           this.deletingEmployeeId = null;
  //         }
  //       });
  //     },
  //     reject: () => {
  //       // User cancelled - no action needed
  //     }
  //   });
  // }

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
    if (this.changeNumberForm.valid && this.selectedEmployee) {

      const newEmployeeId = parseInt(this.changeNumberForm.value.newNumber);

      if (isNaN(newEmployeeId)) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: 'يرجى إدخال رقم صحيح للموظف الجديد' 
        });
        return;
      }

      console.log('Change Number Form Data:', {
        empId: this.selectedEmployee?.empId,
        empName: this.selectedEmployee?.empName,
        oldNumber: this.getOldEmployeeNumber(this.selectedEmployee),
        newNumber:newEmployeeId,
        notes: this.changeNumberForm.value.notes
      });

      const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

      this.employeeService.changeEmployeeId(this.selectedEmployee.empId, newEmployeeId, currentLang).subscribe({
        next: (response) => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'نجح', 
            detail: 'تم تغيير رقم الموظف بنجاح' 
          });
          this.closeChangeNumberModal();
          this.loadEmployees(); // Reload the employees list
        },
        error: (error) => {
          console.error('Error changing branch ID:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'خطأ', 
            detail: 'فشل في تغيير رقم الموظف. يرجى المحاولة مرة أخرى.' 
          });
        }
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


    const empId = employee.empId;

    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
     if (isNaN(empId)) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: 'رقم الموظف غير صحيح' 
        });
        return;
      }
    if (confirm('سيتم تعيين كلمة المرور بنفس رقم الموظف .. هل تريد المتابعة؟')) {
      this.employeeService.resetEmpPassword(empId, currentLang).subscribe({
        next: () => {
          alert('تم تغيير كلمة المرور بنجاح');
        },
        error: (err) => {
          console.error(err);
          alert('حدث خطأ أثناء تغيير كلمة المرور');
        }
      });
    }

  }

  // closeChangePasswordModal() {
  //   this.showChangePasswordModal = false;
  //   this.selectedEmployee = null;
  //   this.resetChangePasswordForm();
  // }

  // resetChangePasswordForm() {
  //   this.changePasswordForm.reset();
  // }

  // submitChangePassword() {
  //   if (this.changePasswordForm.valid) {
  //     const formValue = this.changePasswordForm.value;
      
  //     if (formValue.newPassword !== formValue.confirmPassword) {
  //       this.messageService.add({ 
  //         severity: 'error', 
  //         summary: 'خطأ', 
  //         detail: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين' 
  //       });
  //       return;
  //     }

  //     console.log('Change Password Form Data:', {
  //       empId: this.selectedEmployee?.empId,
  //       empName: this.selectedEmployee?.empName,
  //       newPassword: formValue.newPassword
  //     });
      
  //     // TODO: Call API to change the employee password
  //     this.messageService.add({ 
  //       severity: 'success', 
  //       summary: 'نجح', 
  //       detail: 'تم تغيير كلمة مرور الموظف بنجاح' 
  //     });
  //     this.closeChangePasswordModal();
  //   } else {
  //     // Mark all fields as touched to show validation errors
  //     this.changePasswordForm.markAllAsTouched();
  //   }
  // }

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

  // get isChangePasswordFormValid(): boolean {
  //   if (!this.changePasswordForm.valid) return false;
  //   const formValue = this.changePasswordForm.value;
  //   return formValue.newPassword === formValue.confirmPassword;
  // }

  // get passwordsMatch(): boolean {
  //   const formValue = this.changePasswordForm.value;
  //   return formValue.newPassword === formValue.confirmPassword;
  // }


  private async loadDropdownDataIfNeeded(): Promise<void> {
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const langKey = this.langService.getCurrentLang();

    // Check if we already have data for this language
    if (this.currentLanguage === langKey && this.areAllDropdownsLoaded()) {
      console.log('Dropdown data already loaded for current language, skipping API calls');
      return Promise.resolve();
    }

    // Update current language
    this.currentLanguage = langKey;
    this.loadingDropdowns = true;

    console.log('Loading dropdown data for language:', langKey, 'API lang code:', currentLang);

    try {
      const loadPromises: Promise<any>[] = [];

      // Only load statuses if not already loaded for this language
      if (!this.dropdownDataLoaded.statuses || this.statuses.length === 0) {
        console.log('Loading statuses...');
        const managerPromise = this.dropdownService.getEmployeeStatusesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.statuses = response.data.statuses || [];
              this.dropdownDataLoaded.statuses = true;
              console.log('Statuses loaded:', this.statuses.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading statuses';
              console.error('Failed to load statuses:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(managerPromise);
      }

      // Only load department if not already loaded for this language
      if (!this.dropdownDataLoaded.departments || this.departments.length === 0) {
        console.log('Loading departments...');
        const locationPromise = this.dropdownService.getDepartmentsDropdownList(currentLang).toPromise()
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
        loadPromises.push(locationPromise);
      }

      // Only load nationality if not already loaded for this language
      if (!this.dropdownDataLoaded.nationalities || this.nationalities.length === 0) {
        console.log('Loading nationalities...');
        const locationPromise = this.dropdownService.getNationalitiesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.nationalities = response.data.nationalities || [];
              this.dropdownDataLoaded.nationalities = true;
              console.log('Nationalities loaded:', this.nationalities.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading nationalities';
              console.error('Failed to load nationalities:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(locationPromise);
      }

      // Only load gender if not already loaded for this language
      if (!this.dropdownDataLoaded.genders || this.genders.length === 0) {
        console.log('Loading genders...');
        const locationPromise = this.dropdownService.getGendersDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.genders = response.data.genders || [];
              this.dropdownDataLoaded.genders = true;
              console.log('Genders loaded:', this.genders.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading genders';
              console.error('Failed to load genders:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(locationPromise);
      }

      // Only load MaritalStatus if not already loaded for this language
      if (!this.dropdownDataLoaded.maritalStatuses || this.maritalStatuses.length === 0) {
        console.log('Loading maritalStatuses...');
        const locationPromise = this.dropdownService.getMaritalStatusesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.maritalStatuses = response.data.maritalStatuses || [];
              this.dropdownDataLoaded.maritalStatuses = true;
              console.log('MaritalStatuses loaded:', this.genders.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading maritalStatuses';
              console.error('Failed to load maritalStatuses:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(locationPromise);
      }

      // Only load Jobs if not already loaded for this language
      if (!this.dropdownDataLoaded.jobs || this.jobs.length === 0) {
        console.log('Loading jobs...');
        const locationPromise = this.dropdownService.getJobTypesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.jobs = response.data.jobTypes || [];
              this.dropdownDataLoaded.jobs = true;
              console.log('Jobs loaded:', this.jobs.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading jobs';
              console.error('Failed to load jobs:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(locationPromise);
      }

      // Only load Languages if not already loaded for this language
      if (!this.dropdownDataLoaded.languages || this.languages.length === 0) {
        console.log('Loading languages...');
        const locationPromise = this.dropdownService.getLanguagesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.languages = response.data.languages || [];
              this.dropdownDataLoaded.languages = true;
              console.log('Languages loaded:', this.languages.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading languages';
              console.error('Failed to load languages:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(locationPromise);
      }

      // If no API calls needed, resolve immediately
      if (loadPromises.length === 0) {
        console.log('All dropdown data already available');
        this.loadingDropdowns = false;
        return;
      }

      // Wait for all needed API calls to complete
      await Promise.all(loadPromises);
      this.loadingDropdowns = false;
      console.log('Smart dropdown loading completed');

    } catch (error) {
      console.error('Error in smart dropdown loading:', error);
      this.loadingDropdowns = false;
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'فشل في تحميل بعض البيانات'
      });
    }
  }

  private areAllDropdownsLoaded(): boolean {
    return this.dropdownDataLoaded.statuses && 
           this.dropdownDataLoaded.departments && 
           this.dropdownDataLoaded.nationalities &&
           this.dropdownDataLoaded.genders &&
           this.dropdownDataLoaded.maritalStatuses &&
           this.dropdownDataLoaded.jobs &&
           this.dropdownDataLoaded.languages &&
           this.statuses.length > 0 &&
           this.departments.length > 0 &&
           this.nationalities.length > 0 &&
           this.genders.length > 0 &&
           this.maritalStatuses.length > 0&&
           this.jobs.length > 0 &&
           this.languages.length > 0 ;
  }

   private resetDropdownState(): void {
    this.dropdownDataLoaded = {
      statuses: false,
      departments: false,
      nationalities:false,
      genders:false,
      maritalStatuses:false,
      jobs:false,
      languages:false
    };
    this.statuses = [];
    this.departments = [];
    this.nationalities = [];
    this.genders=[];
    this.maritalStatuses=[];
    this.jobs=[];
    this.languages=[];
    this.currentLanguage = '';
  }

  loadDropdownData() {
    return this.loadDropdownDataIfNeeded();
  }

    // Getter methods for form validation
  get isBranchFormValid(): boolean {
    return this.employeeForm.valid && !this.isSubmitting;
  }

  private updateFormDropdownSelections() {
    if (!this.selectedEmployee) {
      console.warn('No selected employee for form update');
      return;
    }

    // Check if dropdown data is available
    if (this.maritalStatuses.length === 0 || this.departments.length === 0 || this.statuses.length === 0
      || this.nationalities.length === 0 || this.genders.length === 0 || this.jobs.length === 0
      || this.languages.length === 0) {
      console.warn('Dropdown data not yet loaded, skipping form update');
      return;
    }

    const employee = this.selectedEmployee;
    // console.log('=== Updating form selections for employee ===');
    // console.log('Employee data:', employee);
    // console.log('Available maritalStatuses:', this.maritalStatuses);
    // console.log('Available departments:', this.departments);
    // console.log('Available statuses:', this.statuses);
    // console.log('Available statuses:', this.nationalities);
    // console.log('Available statuses:', this.genders);
    // console.log('Available statuses:', this.jobs);
    // console.log('Available statuses:', this.languages);

    console.log('Current form value:', this.employeeForm.value);
    
    // Get current form values
    const currentFormValue = this.employeeForm.value;
    
    // Create a new form value object with all current values
    const newFormValue = {
      empNumber: currentFormValue.empNumber || employee.empId || '',
      empArName: currentFormValue.empArName || employee.empName || '',
      empEnName: currentFormValue.empEnName ||  employee.empName || '',
      activeFlag:currentFormValue.activeFlag || employee.activeFlag,
      deptId: '',
      statusId:'',
      fingerPrint: currentFormValue.fingerPrint || '', // no mapping in Employee
      natId:  '',
      gender: 0,
      email: currentFormValue.email || employee.email || '',
      phoneNum: currentFormValue.phoneNum || employee.smsPhone || '',
      homeLandLine: currentFormValue.homeLandLine || '', // no mapping in Employee
      PhysicalAddr: currentFormValue.PhysicalAddr || '', // no mapping in Employee
      birthDate: currentFormValue.birthDate ? new Date(currentFormValue.birthDate) : null, // no mapping in Employee
      maritalstatus: 0,
      hireStartDate: currentFormValue.hireStartDate ? new Date(currentFormValue.hireStartDate) : null, // no mapping in Employee
      hireEndDate: currentFormValue.hireEndDate ? new Date(currentFormValue.hireEndDate) : null,
      EmpvatInformation: currentFormValue.EmpvatInformation || '', // no mapping in Employee
      jobTypeId: '',
      jobdescription: currentFormValue.jobdescription || '', // no mapping in Employee
      nationalNumber: currentFormValue.nationalNumber || employee.govId || '',
      nationalNumberExpiration: currentFormValue.nationalNumberExpiration ? new Date(currentFormValue.nationalNumberExpiration) : null,
      driverLicenseNumber: currentFormValue.driverLicenseNumber || '',
      driverLicenseExpiration: currentFormValue.driverLicenseExpiration ? new Date(currentFormValue.driverLicenseExpiration) : null,
      insuranceCardInformation: currentFormValue.insuranceCardInformation || '',
      insuranceCardExpiration: currentFormValue.insuranceCardExpiration ? new Date(currentFormValue.insuranceCardExpiration) : null,
      employeeCardNumber: currentFormValue.employeeCardNumber || '',
      employeeCardExpiration: currentFormValue.employeeCardExpiration ? new Date(currentFormValue.employeeCardExpiration) : null,
      healthCardNumber: currentFormValue.healthCardNumber || '',
      healthCardExpiration: currentFormValue.healthCardExpiration ? new Date(currentFormValue.healthCardExpiration) : null,
      passportNumber: currentFormValue.passportNumber || '',
      passportExpiration: currentFormValue.passportExpiration ? new Date(currentFormValue.passportExpiration) : null,
      username: currentFormValue.username || '', // no mapping in Employee
      password: currentFormValue.password || '', // no mapping in Employee
      lang: '',
      note: currentFormValue.note || employee.note || ''
    };
    
    // Update department selection
    // console.log('=== department Selection Debug ===');
    // console.log('Processing manager ID:', branch.mgrId, 'Type:', typeof branch.mgrId);
    // console.log('Available managers:', this.managers);
    // console.log('Manager values:', this.managers.map(m => ({ value: m.value, type: typeof m.value, label: m.label })));
    if (employee.deptId !== null && employee.deptId !== undefined && this.departments.length > 0) {
      const department = this.departments.find(m => m.value === employee.deptId);
      // console.log('Looking for department with ID:',employee.deptId, 'Found:', department);
      if (department) {
        newFormValue.deptId = department.value.toString();
        console.log('Setting mgrId to:', department.value.toString());
      } 
      else {
        console.warn('department not found in dropdown options');
        // Try to find by converting to string
        const departmentStr = this.departments.find(m => m.value.toString() === employee.deptId!.toString());
        console.log('Trying string conversion for department ID:', employee.deptId!.toString(), 'Found:', departmentStr);
        if (departmentStr) {
          newFormValue.deptId = departmentStr.value.toString();
          console.log('Found department by string conversion:', departmentStr.value.toString());
        } else {
          console.error('Department still not found even with string conversion!');
          console.log('Available department values as strings:', this.departments.map(m => m.value.toString()));
        }
      }
    } else {
      console.log('department ID is null, undefined, or -1, leaving deptId empty');
    }
    
    // Update status selection
    if (employee.statusId !== null && employee.statusId !== undefined && this.statuses.length > 0) {
      const status = this.statuses.find(l => l.value === employee.statusId);
      console.log('Looking for status with ID:', employee.statusId, 'Found:', status);
      if (status) {
        newFormValue.statusId = status.value.toString();
        console.log('Setting locId to:', status.value.toString());
      } else {
        console.warn('status not found in dropdown options');
        // Try to find by converting to string
        const statusStr = this.statuses.find(l => l.value.toString() === employee.statusId!.toString());
        if (statusStr) {
          newFormValue.statusId = statusStr.value.toString();
          console.log('Found status by string conversion:', statusStr.value.toString());
        }
      }
    }else {
      console.log('status ID is null, undefined, or -1, leaving statusId empty');
    }
    
    // Update nationalitiy selection
    if (employee.natId !== null && employee.natId !== undefined && this.nationalities.length > 0) {
      const nationalitiy = this.nationalities.find(pb => pb.value.toString() === employee.natId);
      console.log('Looking for nationalitiy with ID:', employee.natId, 'Found:', nationalitiy);
      if (nationalitiy) {
        newFormValue.natId = nationalitiy.value.toString();
        console.log('Setting nationalitiyid to:', nationalitiy.value.toString());
      } else {
        console.warn('Nationalitiy not found in dropdown options');
        // Try to find by converting to string
        const nationalitiyStr = this.nationalities.find(pb => pb.value.toString() === employee.natId!.toString());
        if (nationalitiyStr) {
          newFormValue.natId = nationalitiyStr.value.toString();
          console.log('Found nationalitiy by string conversion:', nationalitiyStr.value.toString());
        }
      }
    }else {
      console.log('nationalitiy ID is null, undefined, or -1, leaving nationalitiyId empty');
    }

    // Update gender selection
    if (employee.gender !== null && employee.gender !== undefined && this.genders.length > 0) {
      const gender = this.genders.find(pb => pb.value.toString() === employee.gender);
      console.log('Looking for gender with ID:', employee.gender, 'Found:', gender);
      if (gender) {
        newFormValue.gender = gender.value;
        console.log('Setting genderid to:', gender.value.toString());
      } else {
        console.warn('gender not found in dropdown options');
        // Try to find by converting to string
        const genderStr = this.genders.find(pb => pb.value.toString() === employee.gender!.toString());
        if (genderStr) {
          newFormValue.gender = genderStr.value;
          console.log('Found gender by string conversion:', genderStr.value.toString());
        }
      }
    }else {
      console.log('gender ID is null, undefined, or -1, leaving genderId empty');
    }
    
    // Update jobType selection
    if (employee.jobTypId !== null && employee.jobTypId !== undefined && this.jobs.length > 0) {
      const job = this.jobs.find(pb => pb.value === employee.jobTypId);
      console.log('Looking for job with ID:', employee.jobTypId, 'Found:', job);
      if (job) {
        newFormValue.jobTypeId = job.value.toString();
        console.log('Setting jobTypId to:', job.value.toString());
      } else {
        console.warn('jobType not found in dropdown options');
        // Try to find by converting to string
        const jobStr = this.jobs.find(pb => pb.value.toString() === employee.jobTypId!.toString());
        if (jobStr) {
          newFormValue.jobTypeId = jobStr.value.toString();
          console.log('Found jobType by string conversion:', jobStr.value.toString());
        }
      }
    }else {
      console.log('jobType ID is null, undefined, or -1, leaving jobTypId empty');
    }

    // Update language selection
    if (employee.lang !== null && employee.lang !== undefined && this.languages.length > 0) {
      const language = this.languages.find(pb => pb.value.toString() === employee.lang);
      console.log('Looking for language with ID:', employee.lang, 'Found:', language);
      if (language) {
        newFormValue.lang = language.value.toString();
        console.log('Setting langId to:', language.value.toString());
      } else {
        console.warn('language not found in dropdown options');
        // Try to find by converting to string
        const languageStr = this.languages.find(pb => pb.value.toString() === employee.lang!.toString());
        if (languageStr) {
          newFormValue.lang = languageStr.value.toString();
          console.log('Found language by string conversion:', languageStr.value.toString());
        }
      }
    }else {
      console.log('language ID is null, undefined, or -1, leaving langId empty');
    }

    // Update maritalstatus selection
    if (employee.maritalStatus !== null && employee.maritalStatus !== undefined && this.maritalStatuses.length > 0) {
      const maritalstatus = this.maritalStatuses.find(pb => pb.value.toString() === employee.maritalStatus);
      // console.log('Looking for language with ID:', employee.maritalStatus, 'Found:', language);
      if (maritalstatus) {
        newFormValue.maritalstatus = maritalstatus.value;
        // console.log('Setting langId to:', maritalstatus.value);
      } else {
        console.warn('language not found in dropdown options');
        // Try to find by converting to string
        const maritalstatusStr = this.maritalStatuses.find(pb => pb.value.toString() === employee.maritalStatus!.toString());
        if (maritalstatusStr) {
          newFormValue.maritalstatus = maritalstatusStr.value;
          // console.log('Found language by string conversion:', languageStr.value.toString());
        }
      }
    }else {
      console.log('language ID is null, undefined, or -1, leaving langId empty');
    }
    
    console.log('New form value to set:', newFormValue);
    
    // Use setValue to force all values instead of patchValue
    this.employeeForm.setValue(newFormValue);
    
    // Force change detection
    this.employeeForm.markAsDirty();
    this.employeeForm.updateValueAndValidity();
    
    console.log('Form after setValue:', this.employeeForm.value);
    
    // Log individual form control values
    // console.log('Individual form controls:');
    // console.log('mgrId control value:', this.employeeForm.get('mgrId')?.value);
    // console.log('locId control value:', this.employeeForm.get('locId')?.value);
    // console.log('parentBranchId control value:', this.employeeForm.get('parentBranchId')?.value);
  }

  selectedEmployeeIds: number[] = [];

  toggleEmployeeSelection(empId: number, event: any) {
    if (event.target.checked) {
      this.selectedEmployeeIds.push(empId);
    } else {
      this.selectedEmployeeIds = this.selectedEmployeeIds.filter(id => id !== empId);
    }
  }

  resetPasswordsForSelected() {
    if (this.selectedEmployeeIds.length === 0) {
      alert('الرجاء اختيار موظف واحد على الأقل');
      return;
    }

    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    if (confirm('سيتم تعيين كلمة المرور لكل موظف قيد التحديد بنفس رقم الموظف .. هل تريد المتابعة؟')) {
      this.employeeService.resetEmpsPassword(this.selectedEmployeeIds, currentLang).subscribe({
        next: () => {
          alert('تم تغيير كلمات المرور للموظفين المحددين بنجاح');
        },
        error: (err) => {
          console.error(err);
          alert('حدث خطأ أثناء تغيير كلمات المرور');
        }
      });
    }
  }
  
}
