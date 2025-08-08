import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SalariesDetailsService } from '../../services/salaries-details.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { SalariesDetailsData, EmployeeContractDetails } from '../../../../core/models/salariesDetails';

@Component({
  selector: 'app-salaries-details',
  templateUrl: './salaries-details.component.html',
  styleUrl: './salaries-details.component.css',
  providers: [MessageService, ConfirmationService]
})
export class SalariesDetailsComponent implements OnInit, OnDestroy {
  // Core component state
  salariesDetails: SalariesDetailsData[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  showAddModal = false;
  selectedSalaryDetail: SalariesDetailsData | null = null;
  isEditMode = false;
  
  // Authentication and Language
  private langSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to English
  private empId: number = 0;

  // Dropdown data
  employees: any[] = [];
  filteredEmployees: any[] = [];
  banks: any[] = [];
  employeeSearchTerm: string = '';
  showEmployeeDropdown: boolean = false;
  selectedEmployeeLabel: string = '';
  selectedEmployee: any = null;
  loadingEmployees: boolean = false;

  // Reactive Forms
  salaryDetailForm!: FormGroup;
  searchForm!: FormGroup;

  constructor(
    private salariesDetailsService: SalariesDetailsService,
    public langService: LanguageService,
    private authService: AuthenticationService,
    private dropdownService: DropdownlistsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.currentLang = this.langService.getLangValue();
    this.empId = this.authService.getEmpIdAsNumber() || 0;
  }

  ngOnInit() {
    // Subscribe to language changes
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      console.log('Language changed to:', this.currentLang);
      this.loadSalariesDetails();
    });

    // Load initial data
    this.loadDropdownData();
    this.loadSalariesDetails();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForms() {
    this.salaryDetailForm = this.fb.group({
      empId: [0, [Validators.required]],
      employeeAutoComplete: [null], // Initialize as null for object storage
      contractStart: ['', [Validators.required]],
      salType: [1, [Validators.required]],
      monthSal: [0],
      hourSal: [0],
      freeLate: [0, [Validators.min(0)]],
      includeFreeLateAfterExceedLimit: [false],
      minutes2Days: [0, [Validators.min(0)]],
      countParialLate: [false],
      separateOvertime: [false],
      overtimeHrCost: [0, [Validators.min(0)]],
      maxOvertime: [0, [Validators.min(0)]],
      absentPerMY: [0, [Validators.required, Validators.min(0), Validators.max(1)]], // Default to Monthly (0), must be 0 or 1
      absent1Day: [0],
      absent2Day: [0],
      absent3Day: [0],
      absent4Day: [0],
      absent5Day: [0],
      absent6Day: [0],
      absent7Day: [0],
      absentMoreDay: [0],
      noSignoutPerMY: [0, [Validators.required, Validators.min(0), Validators.max(1)]], // Default to Monthly (0), must be 0 or 1
      noSignout1Day: [0],
      noSignout2Day: [0],
      noSignout3Day: [0],
      noSignout4Day: [0],
      noSignout5Day: [0],
      noSignout6Day: [0],
      noSignout7Day: [0],
      noSignoutMoreDay: [0],
      bankId: [0, [Validators.required]],
      accountNumber: [''],
      accountIban: [''],
      contractType: [''],
      contractUrl: [''],
      note: ['']
    });

    this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [10]
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

  // Form validation getters
  get isSalaryDetailFormValid(): boolean {
    return this.salaryDetailForm.valid;
  }

  get searchTerm(): string {
    return this.searchForm.get('searchTerm')?.value || '';
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSalariesDetails();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSalariesDetails();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSalariesDetails();
    }
  }

  onPageSizeChange() {
    this.pageSize = parseInt(this.searchForm.get('pageSize')?.value);
    this.currentPage = 1;
    this.loadSalariesDetails();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadSalariesDetails();
  }

  // Modal and form methods
  addSalaryDetail() {
    this.isEditMode = false;
    this.selectedSalaryDetail = null;
    this.resetForm();
    this.showAddModal = true;
  }

  editSalaryDetail(detail: SalariesDetailsData) {
    this.isEditMode = true;
    this.selectedSalaryDetail = detail;
    
    // Find and set the selected employee for AutoComplete
    const employee = this.employees.find(emp => emp.value === detail.empId);
    if (employee) {
      this.selectedEmployee = employee;
      this.selectedEmployeeLabel = employee.label;
    }
    
    // Convert the display data to form data structure
    this.salaryDetailForm.patchValue({
      empId: detail.empId,
      employeeAutoComplete: employee || null, // Set the full object back
      contractStart: detail.contractStart,
      salType: detail.salType,
      // Set salary based on type
      monthSal: detail.salType === 0 ? detail.salary : 0,
      hourSal: detail.salType === 1 ? detail.salary : 0,
      freeLate: detail.freeLate,
      includeFreeLateAfterExceedLimit: detail.includeFreeLateAfterExceedLimit,
      minutes2Days: detail.minutes2Days,
      countParialLate: detail.countParialLate,
      separateOvertime: detail.separateOvertime,
      overtimeHrCost: detail.overtimeHrCost,
      maxOvertime: detail.maxOvertime,
      absentPerMY: detail.absentPerMY,
      noSignoutPerMY: detail.noSignoutPerMY,
      bankId: detail.bankId,
      note: detail.note || ''
    });
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.selectedSalaryDetail = null;
    this.resetForm();
  }

  private resetForm() {
    this.salaryDetailForm.reset({
      empId: 0,
      employeeAutoComplete: null, // Reset back to null
      contractStart: '',
      salType: 1,
      monthSal: 0,
      hourSal: 0,
      freeLate: 0,
      includeFreeLateAfterExceedLimit: false,
      minutes2Days: 0,
      countParialLate: false,
      separateOvertime: false,
      overtimeHrCost: 0,
      maxOvertime: 0,
      absentPerMY: 1, // Default to Monthly
      absent1Day: 0,
      absent2Day: 0,
      absent3Day: 0,
      absent4Day: 0,
      absent5Day: 0,
      absent6Day: 0,
      absent7Day: 0,
      absentMoreDay: 0,
      noSignoutPerMY: 1, // Default to Monthly
      noSignout1Day: 0,
      noSignout2Day: 0,
      noSignout3Day: 0,
      noSignout4Day: 0,
      noSignout5Day: 0,
      noSignout6Day: 0,
      noSignout7Day: 0,
      noSignoutMoreDay: 0,
      bankId: 0,
      accountNumber: '',
      accountIban: '',
      contractType: '',
      contractUrl: '',
      note: ''
    });
    
    // Reset employee selection state
    this.selectedEmployeeLabel = '';
    this.employeeSearchTerm = '';
    this.selectedEmployee = null;
    this.showEmployeeDropdown = false;
  }

  // Core business methods
  submitSalaryDetail() {
    if (!this.isSalaryDetailFormValid) {
      this.markFormGroupTouched(this.salaryDetailForm);
      return;
    }

    const formData = this.salaryDetailForm.value;
    
    if (this.isEditMode && this.selectedSalaryDetail) {
      console.log('Updating salary detail:', formData);
      this.updateSalaryDetail(formData);
    } else {
      this.createSalaryDetail(formData);
    }
  }

  private createSalaryDetail(formData: any) {
    this.loading = true;
    const detail: EmployeeContractDetails = this.mapFormToEmployeeContractDetails(formData);
    
    this.salariesDetailsService.addSalaryDetail(detail, this.currentLang).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Salary detail added successfully'
        });
        this.closeModal();
        this.loadSalariesDetails();
      },
      error: (error) => {
        console.error('Error adding salary detail:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add salary detail'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private updateSalaryDetail(formData: any) {
    if (!this.selectedSalaryDetail) return;
    
    this.loading = true;
    const detail: EmployeeContractDetails = this.mapFormToEmployeeContractDetails(formData);
    
    this.salariesDetailsService.updateSalaryDetail(this.selectedSalaryDetail.empId, detail, this.currentLang).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Salary detail updated successfully'
        });
        this.closeModal();
        this.loadSalariesDetails();
      },
      error: (error) => {
        console.error('Error updating salary detail:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update salary detail'
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private mapFormToEmployeeContractDetails(formData: any): EmployeeContractDetails {
    return {
      empId: formData.empId,
      contractStart: formData.contractStart,
      salType: formData.salType,
      monthSal: formData.monthSal || 0,
      hourSal: formData.hourSal || 0,
      freeLate: formData.freeLate || 0,
      includeFreeLateAfterExceedLimit: formData.includeFreeLateAfterExceedLimit || false,
      minutes2Days: formData.minutes2Days || 0,
      countParialLate: formData.countParialLate || false,
      separateOvertime: formData.separateOvertime || false,
      overtimeHrCost: formData.overtimeHrCost || 0,
      maxOvertime: formData.maxOvertime || 0,
      absentPerMY: formData.absentPerMY || 0,
      absent1Day: formData.absent1Day || 0,
      absent2Day: formData.absent2Day || 0,
      absent3Day: formData.absent3Day || 0,
      absent4Day: formData.absent4Day || 0,
      absent5Day: formData.absent5Day || 0,
      absent6Day: formData.absent6Day || 0,
      absent7Day: formData.absent7Day || 0,
      absentMoreDay: formData.absentMoreDay || 0,
      noSignoutPerMY: formData.noSignoutPerMY || 0,
      noSignout1Day: formData.noSignout1Day || 0,
      noSignout2Day: formData.noSignout2Day || 0,
      noSignout3Day: formData.noSignout3Day || 0,
      noSignout4Day: formData.noSignout4Day || 0,
      noSignout5Day: formData.noSignout5Day || 0,
      noSignout6Day: formData.noSignout6Day || 0,
      noSignout7Day: formData.noSignout7Day || 0,
      noSignoutMoreDay: formData.noSignoutMoreDay || 0,
      bankId: formData.bankId || 0,
      accountNumber: formData.accountNumber || '',
      accountIban: formData.accountIban || '',
      contractType: formData.contractType || '',
      contractUrl: formData.contractUrl || '',
      note: formData.note || ''
    };
  }

  loadSalariesDetails() {
    this.loading = true;
    
    console.log('Loading salaries details with params:', {
      currentLang: this.currentLang,
      empId: this.empId,
      currentPage: this.currentPage,
      pageSize: this.pageSize
    });
    
    // Test with exact Swagger parameters first
    console.log('Testing with Swagger parameters: mgrId=1515, pageIndex=1, pageSize=10, lang=1');
    
    this.salariesDetailsService.getAllSalaryDetails(
      this.currentLang,
       this.empId,
       this.currentPage,
       this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.salariesDetails = response.data || [];
          this.totalRecords = response.totalCount || 0;
        } else {
          console.error('API returned error:', response.message);
          this.salariesDetails = [];
          this.totalRecords = 0;
        }
      },
      error: (error) => {
        console.error('Error loading salary details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        let errorMessage = 'Failed to load salary details';
        if (error.status === 500) {
          errorMessage = `Server Error (500): ${error.error?.message || error.message || 'Internal server error'}`;
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized access - please login again';
        } else if (error.status === 403) {
          errorMessage = 'Access forbidden - insufficient permissions';
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.salariesDetails = [];
        this.totalRecords = 0;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  deleteSalaryDetail(detail: SalariesDetailsData) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this salary detail?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      
      accept: () => {
        this.loading = true;
        this.salariesDetailsService.deleteSalaryDetail(detail.empId, this.currentLang).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Salary detail deleted successfully'
            });
            this.loadSalariesDetails();
          },
          error: (error) => {
            console.error('Error deleting salary detail:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete salary detail'
            });
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    });
  }

  private loadDropdownData() {
    // Load employees
    this.loadingEmployees = true;
    this.dropdownService.getEmpsDropdownList(this.currentLang, this.empId).subscribe({
      next: (response) => {
        console.log('Employees response:', response);
        this.employees = response.data?.employees || [];
        this.filteredEmployees = [...this.employees];
        
        // If we're in edit mode and have an empId, pre-select the employee
        const currentEmpId = this.salaryDetailForm.get('empId')?.value;
        if (currentEmpId && currentEmpId > 0) {
          const selectedEmp = this.employees.find(emp => emp.value === currentEmpId);
          if (selectedEmp) {
            this.selectedEmployee = selectedEmp;
            this.selectedEmployeeLabel = selectedEmp.label;
            this.salaryDetailForm.patchValue({ 
              employeeAutoComplete: selectedEmp // Set the full object
            });
          }
        }
        
        this.loadingEmployees = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loadingEmployees = false;
      }
    });

    // Load banks
    this.dropdownService.getBanksDropdownList(this.currentLang).subscribe({
      next: (response) => {
        this.banks = response.data?.banks || [];
      },
      error: (error) => {
        console.error('Error loading banks:', error);
      }
    });
  }

  // Employee search methods
  filterEmployees() {
    if (!this.employeeSearchTerm.trim()) {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(emp => 
        emp.label.toLowerCase().includes(this.employeeSearchTerm.toLowerCase())
      );
    }
  }

  selectEmployee(employee: any) {
    this.salaryDetailForm.patchValue({ empId: employee.value });
    this.employeeSearchTerm = employee.label;
    this.selectedEmployeeLabel = employee.label;
    this.showEmployeeDropdown = false;
  }

  onEmployeeInputFocus() {
    this.showEmployeeDropdown = true;
    this.filterEmployees();
  }

  onEmployeeInputBlur() {
    // Delay hiding to allow click on dropdown items
    setTimeout(() => {
      this.showEmployeeDropdown = false;
    }, 200);
  }

  onEmployeeSearchChange() {
    this.filterEmployees();
    this.showEmployeeDropdown = true;
  }

  toggleEmployeeDropdown() {
    this.showEmployeeDropdown = !this.showEmployeeDropdown;
    if (this.showEmployeeDropdown) {
      this.filterEmployees();
    }
  }


  isEmployeeSelected(employee: any): boolean {
    return this.salaryDetailForm.get('empId')?.value === employee.value;
  }

  // PrimeNG AutoComplete methods
  searchEmployee(event: any): void {
    const query = event.query.toLowerCase();
    if (!query || query.length === 0) {
      // Show all employees when dropdown is opened without typing
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(emp => 
        emp.label.toLowerCase().includes(query)
      );
    }
  }

  onEmployeeSelect(event: any): void {
    this.selectedEmployee = event;
    this.salaryDetailForm.patchValue({ 
      empId: event.value,
      employeeAutoComplete: event // Set the full object back
    });
    this.selectedEmployeeLabel = event.label;
    
    // Mark the empId field as touched to trigger validation
    this.salaryDetailForm.get('empId')?.markAsTouched();
  }


  // Display function for AutoComplete
  getEmployeeDisplayValue(employee: any): string {
    return employee ? employee.label || '' : '';
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.salaryDetailForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.salaryDetailForm): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['min']) {
        if (fieldName === 'noSignoutPerMY') {
          return 'NoSignoutPerMY must be 0 (Monthly) or 1 (Yearly)';
        }
        if (fieldName === 'absentPerMY') {
          return 'AbsentPerMY must be 0 (Monthly) or 1 (Yearly)';
        }
        return `${fieldName} must be greater than or equal to ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        if (fieldName === 'noSignoutPerMY') {
          return 'NoSignoutPerMY must be 0 (Monthly) or 1 (Yearly)';
        }
        if (fieldName === 'absentPerMY') {
          return 'AbsentPerMY must be 0 (Monthly) or 1 (Yearly)';
        }
        return `${fieldName} must be less than or equal to ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for display
  getSalaryTypeText(salType: number): string {
    switch (salType) {
      case 1: return 'SALARIES_DETAILS.MONTHLY';
      case 2: return 'SALARIES_DETAILS.HOURLY';
      case 3: return 'SALARIES_DETAILS.YEARLY';
      default: return '';
    }
  }

  getAbsentPerText(absentPer: number): string {
    switch (absentPer) {
      case 1: return 'SALARIES_DETAILS.MONTHLY';
      case 2: return 'SALARIES_DETAILS.YEARLY';
      default: return '';
    }
  }

  getNoSignoutPerText(noSignoutPer: number): string {
    switch (noSignoutPer) {
      case 1: return 'SALARIES_DETAILS.MONTHLY';
      case 2: return 'SALARIES_DETAILS.YEARLY';
      default: return '';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  hasContractFile(contractFileSize: number): boolean {
    return contractFileSize > 0;
  }
}
