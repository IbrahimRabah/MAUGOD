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
import { TranslateService } from '@ngx-translate/core';


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
  showAddModal: boolean = false;
  showChangeNumberModal: boolean = false;
  // showChangePasswordModal: boolean = false;
  selectedEmployee: Employee | null = null;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  deletingEmployeeId: number | null = null;
  loadingDropdowns: boolean = false;
  hijriDates: { [key: string]: string } = {};

  // Reactive Forms
  employeeForm!: FormGroup;
  changeNumberForm!: FormGroup;
  // changePasswordForm!: FormGroup;


  maritalStatuses: MaritalStatuses[] = [];

  departments: Departments[] = [];

  statuses: Statuses[] = [];
  nationalities: Nationalities[] = [];
  genders: Genders[] = [];
  jobs: Jobs[] = [];
  languages: Languages[] = [];



  // Smart loading state tracking
  private dropdownDataLoaded = {
    statuses: false,
    departments: false,
    nationalities: false,
    genders: false,
    maritalStatuses: false,
    jobs: false,
    languages: false
  };

  private currentLanguage: string = '';
  private isInitialized = false;

  searchColumns = [
    { column: '', label: 'All Columns' }, // all columns
    { column: 'EMP_NAME', label: 'MENU.GENERAL_DATA.EMPLOYEES_TABLE.EMPLOYEE_NAME' },
    { column: 'DEPT_NAME', label: 'MENU.GENERAL_DATA.EMPLOYEES_TABLE.DEPARTMENT_NAME' },
    { column: 'DIRECT_MGR_NAME', label: 'MENU.GENERAL_DATA.EMPLOYEES_TABLE.DIRECT_MANAGER' },
    { column: 'ACTIVE_FLAG_NAME', label: 'MENU.GENERAL_DATA.EMPLOYEES_TABLE.ACTIVE_FLAG' },
    { column: 'STATUS_NAME', label: 'MENU.GENERAL_DATA.EMPLOYEES_TABLE.STATUS' },
    { column: 'EMAIL', label: 'MENU.GENERAL_DATA.EMPLOYEES_TABLE.EMAIL' },
    { column: 'SMSPHONE', label: 'MENU.GENERAL_DATA.EMPLOYEES_TABLE.SMS_PHONE' },
    { column: 'LANGUAGE_NAME', label: 'MENU.GENERAL_DATA.EMPLOYEES_TABLE.LANGUAGE' },
    { column: 'NOTE', label: 'MENU.GENERAL_DATA.EMPLOYEES_TABLE.NOTE' }
  ];

  selectedColumn: string = '';
  selectedColumnLabel: string = this.searchColumns[0].label;
  searchTerm: string = '';



  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1, // Default to English, can be changed based on app's language settings
    empId: this.getStoredEmpId(),
    searchColumn: this.selectedColumn,
    searchText: this.searchTerm
  };

  constructor(
    private employeeService: EmployeeService,
    public langService: LanguageService,
    private messageService: MessageService,
    // private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private dropdownService: DropdownlistsService,
    private translate: TranslateService

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
      rowId: [''],
      empNumber: [''],
      empArName: [''],
      empEnName: [''],
      deptId: ['', Validators.required],
      activeFlag: [true],
      statusId: [1, Validators.required],
      fingerPrint: [''],
      natId: [3],
      gender: [1],
      email: ['', Validators.email],
      phoneNum: [''],
      homeLandLine: [''],
      PhysicalAddr: [''],
      birthDate: [null],
      maritalstatus: [0],
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
      username: ['', Validators.required],
      password: ['', Validators.required],
      lang: [2, Validators.required],
      note: ['']
    });


    this.initialFormValues = this.employeeForm.value;

    this.changeNumberForm = this.fb.group({
      newNumber: ['', [Validators.required]],
    });
  }

  selectColumn(col: any) {
    this.selectedColumn = col.column;
    this.selectedColumnLabel = col.label;
  }

  onDateChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value) {
      this.hijriDates[controlName] = this.toObservedHijri(value);
    } else {
      this.hijriDates[controlName] = '';
    }
  }

  toObservedHijri(date: Date | string, adjustment: number = -1): string {
    // Ensure date is a Date object
    const d: Date = date instanceof Date ? new Date(date) : new Date(date);
    if (isNaN(d.getTime())) return ''; // handle invalid date

    // Apply adjustment in days
    d.setDate(d.getDate() + adjustment);

    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const parts = formatter.formatToParts(d);

    const year = parts.find(p => p.type === 'year')?.value ?? '0000';
    const month = parts.find(p => p.type === 'month')?.value ?? '00';
    const day = parts.find(p => p.type === 'day')?.value ?? '00';

    return `${year}/${month}/${day}`;
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
    this.paginationRequest.searchColumn = this.selectedColumn;
    this.paginationRequest.searchText = this.searchTerm;
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
        var employeeDetails = responce.data
        console.log('Employee details from API:', employeeDetails);

        const convertedEmployee = {
          rowId: employeeDetails.rowID,
          empId: employeeDetails.empId,
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
          rowId: employeeDetails.rowID || '',
          empNumber: employeeDetails.empId || '',
          empArName: employeeDetails.ar_Name || '',
          empEnName: employeeDetails.en_Name || '',
          deptId: employeeDetails.deptId || '',
          // Normalize API numeric flag (1/0) to boolean for the form control
          activeFlag: employeeDetails.activeFlag,
          statusId: employeeDetails.statusId || 1,
          fingerPrint: employeeDetails.fpid || '',
          natId: employeeDetails.natId || 0,
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
          username: employeeDetails.userName || '',
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
          summary: this.translate.instant("ERROR"),
          detail: this.langService.getCurrentLang() === 'ar'
            ? 'فشل في تحميل تفاصيل الموظف. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'
            : 'Failed to load employee details. Please try again or contact support.'
        });

        // Fallback to using the employee data from the list
        this.employeeForm.patchValue({
          rowId: employee.rowId,
          empNumber: employee.empId || null,
          empArName: employee.empName || null,
          empEnName: employee.empName || null,
          // Map employee list value (could be 1/0 or string) to boolean for the form
          activeFlag: employee.activeFlag == null ? false : Number(employee.activeFlag) === 1,
          statusId: employee.statusId || null,
          deptId: employee.deptId || null,
          natId: employee.natId || null,
          govId: employee.govId || null,
          gender: employee.gender || null,
          email: employee.email || null,
          smsPhone: employee.smsPhone || null,
          maritalStatus: employee.maritalStatus || null,
          jobTypId: employee.jobTypId || null,

          lang: employee.lang || 1,
          note: employee.note || null
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

      if (isNaN(deptId) || isNaN(statusId) || isNaN(lang)) {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: this.langService.getCurrentLang() === 'ar'
            ? 'يرجى التأكد من أن معرف القسم، الحالة، واللغة أرقام صحيحة.'
            : 'Please make sure that Department , Status, and Language are valid numbers.'
        });
        this.isSubmitting = false;
        return;
      }

      // Prepare employee object based on the API requirements
      const employeeData: EmployeeCreateUpdateRequest = {
        rowId: formData.rowId || 0,
        empId: formData.empNumber || null,
        ar: formData.empArName || null,
        en: formData.empEnName || null,
  // API expects 1 or 0 (not null). Convert boolean/form value accordingly.
  activeFlag: formData.activeFlag ? 1 : 0,
        statusId: Number(formData.statusId) || 0,
        fpid: formData.fingerPrint || null,
        deptId: Number(formData.deptId) || 0,
        natId: Number(formData.natId) || 0,
        gender: Number(formData.gender) || null,
        email: formData.email || null,
        smsPhone: formData.phoneNum || null,
        phone: formData.homeLandLine || null,
        physicalAddress: formData.PhysicalAddr || null,
        maritalStatus: formData.maritalStatus || null,
        birthDate: formData.birthDate || null,
        hireSDate: formData.hireStartDate || null,
        hireEDate: formData.hireEndDate || null,
        jobId: formData.jobdescription || null,
        jobTypId: formData.jobTypeId || null,
        jobdesc: formData.jobdescription || null,
        empVatInfo: formData.EmpvatInformation || null,
        govId: formData.nationalNumber || null,
        govIdExpiration: formData.nationalNumberExpiration || null,
        employeeCardNo: formData.employeeCardNumber || null,
        employeeCardExpiration: formData.employeeCardExpiration || null,
        driverLicenceNo: formData.driverLicenseNumber || null,
        driverLicenceExpiration: formData.driverLicenseExpiration || null,
        healthCardNo: formData.healthCardNumber || null,
        healthCardExpiration: formData.healthCardExpiration || null,
        insuranceCardInfo: formData.insuranceCardInformation || null,
        insuranceCardExpiration: formData.insuranceCardExpiration || null,
        passportNo: formData.passportNumber || null,
        passportExpiration: formData.passportExpiration || null,
        userName: formData.username || null,
        passwd: formData.password || null,
        lang: formData.lang || 1,
        note: formData.note || null
      };

      if (this.isEditMode) {
        console.log('Edit Employee Data:', this.employeeForm.value, 'Employee ID:', this.selectedEmployee?.empId);
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.employeeService.updateEmployee(this.selectedEmployee!.empId, employeeData, currentLang).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant("SUCCESS"),
                detail: this.langService.getCurrentLang() === 'ar'
                  ? 'تم تحديث بيانات الموظف بنجاح'
                  : 'Employee updated successfully'
              });
              this.closeModal();
              this.loadEmployees();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant("ERROR"),
                detail: this.langService.getCurrentLang() === 'ar'
                  ? `فشل في تحديث بيانات الموظف. ${'يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'}`
                  : `Failed to update employee. ${'Please try again or contact support.'}`
              });
            }
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating branch:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'فشل في تحديث بيانات الموظف. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'
                : 'Failed to update employee. Please try again or contact support.'
            });
            this.isSubmitting = false;
          }
        });
      } else {
        // Add new employee
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.employeeService.addEmployee(employeeData, currentLang).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant("SUCCESS"),
                detail: this.langService.getCurrentLang() === 'ar'
                  ? 'تم إضافة الموظف بنجاح'
                  : 'Employee added successfully'
              });
              this.closeModal();
              this.loadEmployees();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant("ERROR"),
                detail: this.langService.getCurrentLang() === 'ar'
                  ? `فشل في إضافة الموظف. ${response.message || 'يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'}`
                  : `Failed to add employee. ${response.message || 'Please try again or contact support.'}`
              });
            }
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error adding branch:', error.message);
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'فشل في إضافة الموظف. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'
                : 'Failed to add employee. Please try again or contact support.'
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
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant("ERROR"),
            detail: this.langService.getCurrentLang() === 'ar'
              ? 'فشل تحميل الموظفين، يرجى الاتصال بالدعم إذا استمرت المشكلة.'
              : 'Failed to load employees. Please call support if the issue persists.'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: this.langService.getCurrentLang() === 'ar'
            ? 'فشل تحميل الموظفين، يرجى الاتصال بالدعم إذا استمرت المشكلة.'
            : 'Failed to load employees. Please call support if the issue persists.'
        });
        this.loading = false;
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
    if (this.changeNumberForm.valid && this.selectedEmployee) {

      const newEmployeeId = parseInt(this.changeNumberForm.value.newNumber);

      if (isNaN(newEmployeeId)) {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: this.langService.getCurrentLang() === 'ar'
            ? 'يرجى إدخال رقم صحيح للموظف الجديد'
            : 'Please enter a valid employee number'
        });
        return;
      }

      const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

      this.employeeService.changeEmployeeId(this.selectedEmployee.empId, newEmployeeId, currentLang).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant("SUCCESS"),
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'تم تغيير رقم الموظف بنجاح'
                : 'Employee number changed successfully'
            });
            this.closeChangeNumberModal();
            this.loadEmployees(); // Reload the employees list
          } else {
            console.error('Error changing branch ID:', response.message);
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'فشل في تغيير رقم الموظف. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'
                : 'Failed to change employee number. Please try again or contact support.'
            });
          }

        },
        error: (error) => {
          console.error('Error changing branch ID:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant("ERROR"),
            detail: this.langService.getCurrentLang() === 'ar'
              ? 'فشل في تغيير رقم الموظف. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.'
              : 'Failed to change employee number. Please try again or contact support.'
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
        summary: this.translate.instant("ERROR"),
        detail: currentLang === 2 ? 'رقم الموظف الذى ادخلته غير صحيح' : 'Invalid employee number'
      });
      return;
    }
    if (confirm(currentLang === 2
      ? 'سيتم تعيين كلمة المرور بنفس رقم الموظف .. هل تريد المتابعة؟'
      : 'The password will be reset to the employee number. Do you want to continue?')) {

      this.employeeService.resetEmpPassword(empId, currentLang).subscribe({
        next: () => {
          alert(currentLang === 2
            ? 'تم تغيير كلمة المرور بنجاح'
            : 'Password changed successfully');
        },
        error: (err) => {
          console.error(err);
          alert(currentLang === 2
            ? 'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
            : 'An error occurred while changing the password. Please try again or contact support');
        }
      });
    }

  }


  // getActiveFlagDisplay(activeFlag: string): string {
  //   return activeFlag === '1' ? 'نشط' : 'غير نشط';
  // }

  // getLanguageDisplay(lang: string): string {
  //   return lang === '1' ? 'English' : 'العربية';
  // }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.employeeForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.employeeForm): string {
    const field = formGroup.get(fieldName);
    const isArabic = this.langService.getCurrentLang() === 'ar';

    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return isArabic
          ? 'هذا الحقل مطلوب'
          : 'This field is required';
      }
      if (field.errors['email']) {
        return isArabic
          ? 'يرجى إدخال بريد إلكتروني صحيح'
          : 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return isArabic
          ? `يجب أن تحتوي كلمة المرور على ${field.errors['minlength'].requiredLength} أحرف على الأقل`
          : `Password must be at least ${field.errors['minlength'].requiredLength} characters long`;
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
        this.loadingDropdowns = false;
        return;
      }

      // Wait for all needed API calls to complete
      await Promise.all(loadPromises);
      this.loadingDropdowns = false;

    } catch (error) {
      console.error('Error in smart dropdown loading:', error);
      this.loadingDropdowns = false;
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant("WARNING"),
        detail: this.langService.getCurrentLang() === 'ar'
          ? "فشل في تحميل بعض البيانات. يرجى المحاولة مرة أخرى أو التواصل مع الدعم"
          : "Failed to load some data. Please try again or contact support"
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
      this.maritalStatuses.length > 0 &&
      this.jobs.length > 0 &&
      this.languages.length > 0;
  }

  private resetDropdownState(): void {
    this.dropdownDataLoaded = {
      statuses: false,
      departments: false,
      nationalities: false,
      genders: false,
      maritalStatuses: false,
      jobs: false,
      languages: false
    };
    this.statuses = [];
    this.departments = [];
    this.nationalities = [];
    this.genders = [];
    this.maritalStatuses = [];
    this.jobs = [];
    this.languages = [];
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

    console.log('Current form value:', this.employeeForm.value);

    // Get current form values
    const currentFormValue = this.employeeForm.value;

    // Create a new form value object with all current values
    const newFormValue = {
      empNumber: currentFormValue.empNumber || employee.empId || '',
      empArName: currentFormValue.empArName || employee.empName || '',
      empEnName: currentFormValue.empEnName || employee.empName || '',
  // Preserve explicit false values; prefer current form boolean, otherwise derive from employee value
  activeFlag: (typeof currentFormValue.activeFlag === 'boolean') ? currentFormValue.activeFlag : (Number(employee.activeFlag) === 1),
      deptId: '',
      statusId: '',
      fingerPrint: currentFormValue.fingerPrint || '', // no mapping in Employee
      natId: '',
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
    } else {
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
    } else {
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
    } else {
      console.log('gender ID is null, undefined, or -1, leaving genderId empty');
    }

    // Update jobType selection
    if (employee.jobTypId !== null && employee.jobTypId !== undefined && this.jobs.length > 0) {
      const job = this.jobs.find(pb => pb.value === employee.jobTypId);
      if (job) {
        newFormValue.jobTypeId = job.value.toString();
        console.log('Setting jobTypId to:', job.value.toString());
      } else {
        console.warn('jobType not found in dropdown options');
        // Try to find by converting to string
        const jobStr = this.jobs.find(pb => pb.value.toString() === employee.jobTypId!.toString());
        if (jobStr) {
          newFormValue.jobTypeId = jobStr.value.toString();
        }
      }
    } else {
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
    } else {
      console.log('language ID is null, undefined, or -1, leaving langId empty');
    }

    // Update maritalstatus selection
    if (employee.maritalStatus !== null && employee.maritalStatus !== undefined && this.maritalStatuses.length > 0) {
      const maritalstatus = this.maritalStatuses.find(pb => pb.value.toString() === employee.maritalStatus);
      if (maritalstatus) {
        newFormValue.maritalstatus = maritalstatus.value;
      } else {
        console.warn('language not found in dropdown options');
        // Try to find by converting to string
        const maritalstatusStr = this.maritalStatuses.find(pb => pb.value.toString() === employee.maritalStatus!.toString());
        if (maritalstatusStr) {
          newFormValue.maritalstatus = maritalstatusStr.value;
        }
      }
    } else {
      console.log('language ID is null, undefined, or -1, leaving langId empty');
    }

    console.log('New form value to set:', newFormValue);

    // Use setValue to force all values instead of patchValue
    this.employeeForm.setValue(newFormValue);

    // Force change detection
    this.employeeForm.markAsDirty();
    this.employeeForm.updateValueAndValidity();

    console.log('Form after setValue:', this.employeeForm.value);

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
      alert(this.langService.getCurrentLang() === 'ar'
        ? 'الرجاء اختيار موظف واحد على الأقل'
        : 'Please select at least one employee');
      return;
    }

    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    const confirmMessage = this.langService.getCurrentLang() === 'ar'
      ? 'سيتم تعيين كلمة المرور لكل موظف قيد التحديد بنفس رقم الموظف .. هل تريد المتابعة؟'
      : 'The password for each selected employee will be set to their employee number. Do you want to continue?';

    if (confirm(confirmMessage)) {
      this.employeeService.resetEmpsPassword(this.selectedEmployeeIds, currentLang).subscribe({
        next: () => {
          alert(this.langService.getCurrentLang() === 'ar'
            ? 'تم تغيير كلمات المرور للموظفين المحددين بنجاح'
            : 'Passwords for the selected employees have been successfully changed');
        },
        error: (err) => {
          console.error(err);
          const errorMsg = this.langService.getCurrentLang() === 'ar'
            ? "حدث خطأ أثناء تغيير كلمات المرور. يرجى المحاولة مرة أخرى أو التواصل مع الدعم"
            : "An error occurred while changing passwords. Please try again or contact support";
          alert(errorMsg);

        }
      });
    }
  }

}
function moment(date: string | Date) {
  throw new Error('Function not implemented.');
}

