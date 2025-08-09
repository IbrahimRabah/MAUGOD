import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LanguageService } from '../../../../core/services/language.service';
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

const TRANSFER_TYPES = {
  EMPLOYEE: 'employee',
  MANAGER_OF_DEPARTMENT: 'managerOfDepartment',
  DEPARTMENT: 'department',
  MANAGER_OF_BRANCH: 'managerOfBranch',
  BRANCH: 'branch',
  ROLE: 'role'
} as const;

@Component({
  selector: 'app-data-transfer-form',
  templateUrl: './data-transfer-form.component.html',
  styleUrl: './data-transfer-form.component.css',
  providers: [MessageService, ConfirmationService]
})
export class DataTransferFormComponent implements OnInit, OnDestroy {
  // Core component state
  loading = false;
  showModal = false;
  
  private langSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to Arabic (2)
  
  // Reactive Forms
  dataTransferForm!: FormGroup;
  
  // Multi-select state management for "To" employees
  toEmployeesMultiSelectState: MultiSelectState = {
    available: [],
    selected: [],
    searchTerm: ''
  };
  
  // Dropdown data for "From" fields
  fromEmployees: SelectableItem[] = [];
  fromManagers: SelectableItem[] = [];
  fromDepartments: SelectableItem[] = [];
  fromBranchManagers: SelectableItem[] = [];
  fromBranches: SelectableItem[] = [];
  fromRoles: SelectableItem[] = [];
  
  // Loading states
  loadingFromEmployees = false;
  loadingFromManagers = false;
  loadingFromDepartments = false;
  loadingFromBranchManagers = false;
  loadingFromBranches = false;
  loadingFromRoles = false;
  loadingToEmployees = false;
  
  // Data loaded flags to avoid unnecessary reloads
  private dataLoaded = {
    fromEmployees: false,
    fromManagers: false,
    fromDepartments: false,
    fromBranchManagers: false,
    fromBranches: false,
    fromRoles: false,
    toEmployees: false
  };

  constructor(
    private dropdownlistsService: DropdownlistsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.currentLang = this.langService.getLangValue();
    this.initializeForms();
  }

  ngOnInit() {
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang === 'ar' ? 2 : 1;
      this.resetDataLoadedFlags();
      this.loadAllDropdownData();
    });
    
    this.loadAllDropdownData();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForms() {
    this.dataTransferForm = this.fb.group({
      transferType: [TRANSFER_TYPES.EMPLOYEE, Validators.required],
      fromEmpId: [0],
      fromMgrOfDeptId: [0],
      fromDeptId: [0],
      fromMgrOfBranchId: [0],
      fromBranchId: [0],
      fromRoleId: [0],
      changeDataEmp: [0],
      sDate: ['', Validators.required],
      eDate: ['', Validators.required],
      note: ['']
    });

    // Watch for transfer type changes to load appropriate dropdown data
    this.dataTransferForm.get('transferType')?.valueChanges.subscribe(value => {
      if (value && this.showModal) {
        this.loadToEmployeesByTransferType(value);
        this.resetFromFields();
      }
    });
  }

  private resetDataLoadedFlags() {
    this.dataLoaded = {
      fromEmployees: false,
      fromManagers: false,
      fromDepartments: false,
      fromBranchManagers: false,
      fromBranches: false,
      fromRoles: false,
      toEmployees: false
    };
  }

  private resetFromFields() {
    this.dataTransferForm.patchValue({
      fromEmpId: 0,
      fromMgrOfDeptId: 0,
      fromDeptId: 0,
      fromMgrOfBranchId: 0,
      fromBranchId: 0,
      fromRoleId: 0
    });
  }

  private loadAllDropdownData() {
    if (!this.dataLoaded.fromEmployees) {
      this.loadFromEmployees();
    }
    if (!this.dataLoaded.fromManagers) {
      this.loadFromManagers();
    }
    if (!this.dataLoaded.fromDepartments) {
      this.loadFromDepartments();
    }
    if (!this.dataLoaded.fromBranchManagers) {
      this.loadFromBranchManagers();
    }
    if (!this.dataLoaded.fromBranches) {
      this.loadFromBranches();
    }
    if (!this.dataLoaded.fromRoles) {
      this.loadFromRoles();
    }
    if (!this.dataLoaded.toEmployees) {
      this.loadToEmployees();
    }
  }

  private loadToEmployeesByTransferType(transferType: string) {
    // Load "To" employees based on the selected transfer type
    this.loadToEmployees();
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail
    });
  }

  private showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'نجح',
      detail
    });
  }

  getStoredEmpId(): number | undefined {
    const empId = localStorage.getItem('empId');
    return empId ? parseInt(empId, 10) : undefined;
  }

  private loadFromEmployees() {
    this.loadingFromEmployees = true;
    const empId = this.getStoredEmpId() || 0;

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data)) {
          this.fromEmployees = response.data.map((emp: any) => ({
            id: emp.id,
            name: emp.name
          }));
        } else {
          this.fromEmployees = [];
        }
        this.dataLoaded.fromEmployees = true;
        this.loadingFromEmployees = false;
      },
      error: () => {
        this.showErrorMessage('فشل في تحميل بيانات الموظفين');
        this.fromEmployees = [];
        this.loadingFromEmployees = false;
      }
    });
  }

  private loadFromManagers() {
    this.loadingFromManagers = true;

    this.dropdownlistsService.getManagersDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data)) {
          this.fromManagers = response.data.map((manager: any) => ({
            id: manager.id,
            name: manager.name
          }));
        } else {
          this.fromManagers = [];
        }
        this.dataLoaded.fromManagers = true;
        this.loadingFromManagers = false;
      },
      error: () => {
        this.showErrorMessage('فشل في تحميل بيانات المدراء');
        this.fromManagers = [];
        this.loadingFromManagers = false;
      }
    });
  }

  private loadFromDepartments() {
    this.loadingFromDepartments = true;

    this.dropdownlistsService.getDepartmentsDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data)) {
          this.fromDepartments = response.data.map((dept: any) => ({
            id: dept.id,
            name: dept.name
          }));
        } else {
          this.fromDepartments = [];
        }
        this.dataLoaded.fromDepartments = true;
        this.loadingFromDepartments = false;
      },
      error: () => {
        this.showErrorMessage('فشل في تحميل بيانات الأقسام');
        this.fromDepartments = [];
        this.loadingFromDepartments = false;
      }
    });
  }

  private loadFromBranchManagers() {
    this.loadingFromBranchManagers = true;

    this.dropdownlistsService.getBranchManagersDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data)) {
          this.fromBranchManagers = response.data.map((manager: any) => ({
            id: manager.id,
            name: manager.name
          }));
        } else {
          this.fromBranchManagers = [];
        }
        this.dataLoaded.fromBranchManagers = true;
        this.loadingFromBranchManagers = false;
      },
      error: () => {
        this.showErrorMessage('فشل في تحميل بيانات مدراء الفروع');
        this.fromBranchManagers = [];
        this.loadingFromBranchManagers = false;
      }
    });
  }

  private loadFromBranches() {
    this.loadingFromBranches = true;

    this.dropdownlistsService.getBranchesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data)) {
          this.fromBranches = response.data.map((branch: any) => ({
            id: branch.id,
            name: branch.name
          }));
        } else {
          this.fromBranches = [];
        }
        this.dataLoaded.fromBranches = true;
        this.loadingFromBranches = false;
      },
      error: () => {
        this.showErrorMessage('فشل في تحميل بيانات الفروع');
        this.fromBranches = [];
        this.loadingFromBranches = false;
      }
    });
  }

  private loadFromRoles() {
    this.loadingFromRoles = true;

    this.dropdownlistsService.getEmployeeRolesDropdownList(this.currentLang).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data)) {
          this.fromRoles = response.data.map((role: any) => ({
            id: role.id,
            name: role.name
          }));
        } else {
          this.fromRoles = [];
        }
        this.dataLoaded.fromRoles = true;
        this.loadingFromRoles = false;
      },
      error: () => {
        this.showErrorMessage('فشل في تحميل بيانات الأدوار');
        this.fromRoles = [];
        this.loadingFromRoles = false;
      }
    });
  }

  private loadToEmployees() {
    this.loadingToEmployees = true;
    const empId = this.getStoredEmpId() || 0;

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response && response.isSuccess && response.data && Array.isArray(response.data)) {
          this.toEmployeesMultiSelectState.available = response.data.map((emp: any) => ({
            id: emp.id,
            name: emp.name
          }));
        } else {
          this.toEmployeesMultiSelectState.available = [];
        }
        this.dataLoaded.toEmployees = true;
        this.loadingToEmployees = false;
      },
      error: () => {
        this.showErrorMessage('فشل في تحميل بيانات الموظفين المستهدفين');
        this.toEmployeesMultiSelectState.available = [];
        this.loadingToEmployees = false;
      }
    });
  }

  // Modal methods
  openModal() {
    this.showModal = true;
    this.resetForm();
    this.clearToEmployeesSelection();
    this.loadAllDropdownData();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
    this.clearToEmployeesSelection();
  }

  private resetForm() {
    this.dataTransferForm.reset();
    this.dataTransferForm.patchValue({
      transferType: TRANSFER_TYPES.EMPLOYEE,
      fromEmpId: 0,
      fromMgrOfDeptId: 0,
      fromDeptId: 0,
      fromMgrOfBranchId: 0,
      fromBranchId: 0,
      fromRoleId: 0,
      changeDataEmp: 0
    });
  }

  private clearToEmployeesSelection() {
    this.toEmployeesMultiSelectState.selected = [];
    this.toEmployeesMultiSelectState.searchTerm = '';
  }

  // Multi-select methods for "To" employees
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

  clearToEmployeesSelectionMethod(): void {
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

  // Form submission
  submitForm() {
    if (this.dataTransferForm.invalid) {
      this.markFormGroupTouched(this.dataTransferForm);
      this.showErrorMessage('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    const selectedToEmployeeIds = this.toEmployeesMultiSelectState.selected.map(emp => Number(emp.id));
    
    if (selectedToEmployeeIds.length === 0) {
      this.showErrorMessage('يرجى اختيار موظف واحد على الأقل من قائمة الموظفين المستهدفين');
      return;
    }

    const formValue = this.dataTransferForm.value;
    const requestBody = {
      fromEmpId: Number(formValue.fromEmpId) || 0,
      fromMgrOfDeptId: Number(formValue.fromMgrOfDeptId) || 0,
      fromDeptId: Number(formValue.fromDeptId) || 0,
      fromMgrOfBranchId: Number(formValue.fromMgrOfBranchId) || 0,
      fromBranchId: Number(formValue.fromBranchId) || 0,
      fromRoleId: Number(formValue.fromRoleId) || 0,
      toEmpId: selectedToEmployeeIds,
      changeDataEmp: Number(formValue.changeDataEmp) || 0,
      sDate: formValue.sDate,
      eDate: formValue.eDate,
      note: formValue.note || ''
    };

    console.log('Data Transfer Request Body:', requestBody);
    
    // Here you would typically call a service method to submit the data
    // Example: this.dataTransferService.submitDataTransfer(requestBody, this.currentLang).subscribe({...})
    
    this.showSuccessMessage('تم إرسال البيانات بنجاح');
    this.closeModal();
  }

  // Helper methods
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.dataTransferForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.dataTransferForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
    }
    return '';
  }
}
