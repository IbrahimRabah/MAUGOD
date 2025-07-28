import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EmployeeHandlesBalanceService } from '../../services/employee-handles-balance.service';
import { LanguageService } from '../../../../core/services/language.service';
import { PaginationRequest } from '../../../../core/models/pagination';
import { EmployeeHandleBalance, EmployeeHandlesBalanceResponse } from '../../../../core/models/EmployeeHandlesBalance ';
import { Subscription } from 'rxjs';

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
  selector: 'app-handle-statuses-employee-balance',
  templateUrl: './handle-statuses-employee-balance.component.html',
  styleUrl: './handle-statuses-employee-balance.component.css',
  providers: [MessageService, ConfirmationService]
})
export class HandleStatusesEmployeeBalanceComponent implements OnInit, OnDestroy {
  // Core component state
  employeeBalances: EmployeeHandleBalance[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  showAddModal = false;
  selectedBalance: EmployeeHandleBalance | null = null;
  isEditMode = false;
  selectedItems: EmployeeHandleBalance[] = [];
  
  private langSubscription: Subscription = new Subscription();
  private isInitialized = false;
  
  // Reactive Forms
  balanceForm!: FormGroup;
  searchForm!: FormGroup;

  // Multi-select state management
  multiSelectStates: { [key: string]: MultiSelectState } = {
    employees: { available: [], selected: [], searchTerm: '' },
    departments: { available: [], selected: [], searchTerm: '' },
    branches: { available: [], selected: [], searchTerm: '' },
    roles: { available: [], selected: [], searchTerm: '' }
  };

  // Static data (should be moved to service in real implementation)
  private readonly staticData = {
    employees: [
      { id: 0, name: 'مدير النظام' },
      { id: 215, name: 'مالك عبدالله مصعب عبدالله' },
      { id: 229, name: 'سالم طارق معاذ مالك' },
      { id: 63, name: 'معاذ معاذ طارق مصعب' },
      { id: 117, name: 'محمد مالك مصعب مالك' },
      { id: 400, name: 'طارق سالم عمر طارق' },
      { id: 1998, name: 'السويح' },
      { id: 219, name: 'عبدالله مصعب عبدالله عبدالله' }
    ],
    departments: [
      { id: 1, name: 'المالية' },
      { id: 2, name: 'الموارد البشرية' },
      { id: 3, name: 'تقنية المعلومات' },
      { id: 4, name: 'العمليات' },
      { id: 5, name: 'التسويق' }
    ],
    branches: [
      { id: 1, name: 'المركز الرئيسي' },
      { id: 2, name: 'الجامعة' },
      { id: 3, name: 'فرع المجمعة' },
      { id: 4, name: 'فرع رماح' },
      { id: 5, name: 'فرع الزلفي' }
    ],
    roles: [
      { id: 1, name: 'مدير' },
      { id: 2, name: 'موظف' },
      { id: 3, name: 'محاسب' },
      { id: 4, name: 'مطور' },
      { id: 5, name: 'محلل' }
    ],
    statuses: [
      { id: 'BT', name: 'رحلة عمل' },
      { id: 'YV', name: 'اجازة سنوية' },
      { id: '1788906', name: 'اجازة خاصة' },
      { id: '1791304', name: 'اجازة ساعية' },
      { id: 'XE', name: 'غياب بعذر' },
      { id: '1791383', name: 'اجازة مرضية' }
    ]
  };
  
  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1
  };

  constructor(
    private employeeBalanceService: EmployeeHandlesBalanceService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.initializeMultiSelectStates();
    
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      if (this.isInitialized) {
        this.loadEmployeeBalances();
      }
    });
  }

  ngOnInit() {
    this.loadEmployeeBalances();
    this.isInitialized = true;
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForms() {
    // Main balance form
    this.balanceForm = this.fb.group({
      allEmployee: [false],
      includeEmployees: [false],
      includeDepartments: [false],
      includeBranches: [false],
      includeRoles: [false],
      empId: [''],
      deptId: [''],
      branchId: [''],
      roleId: [''],
      stsId: ['', [Validators.required]],
      allSts: [false],
      maxPerWeek: [''],
      maxPerMonth: [''],
      maxPerYear: [''],
      forwardBalance: [false],
      countBaseContractStart: [false],
      fractionFloorCeil: [false],
      includeWeekendInBetween: [false],
      note: ['']
    });

    // Search form
    this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [10]
    });
  }

  private initializeMultiSelectStates() {
    Object.keys(this.multiSelectStates).forEach(key => {
      this.multiSelectStates[key] = {
        available: [...this.staticData[key as keyof typeof this.staticData]],
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
    return end > this.totalRecords ? this.totalRecords : end;
  }

  // Getters for static data
  get statuses() { return this.staticData.statuses; }

  // Form validation getters
  get isBalanceFormValid(): boolean {
    return this.balanceForm.valid;
  }

  get searchTerm(): string {
    return this.searchForm.get('searchTerm')?.value || '';
  }

  // Selection state getters
  get isAllSelected(): boolean {
    return this.employeeBalances.length > 0 && this.selectedItems.length === this.employeeBalances.length;
  }

  get isPartiallySelected(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.length < this.employeeBalances.length;
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadEmployeeBalances();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadEmployeeBalances();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadEmployeeBalances();
    }
  }

  onPageSizeChange() {
    const newPageSize = this.searchForm.get('pageSize')?.value;
    this.paginationRequest.pageSize = newPageSize;
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadEmployeeBalances();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadEmployeeBalances();
  }

  // Generic multi-select methods
  getFilteredItems(category: string): SelectableItem[] {
    const state = this.multiSelectStates[category];
    if (!state || !state.searchTerm) {
      return this.staticData[category as keyof typeof this.staticData];
    }
    return this.staticData[category as keyof typeof this.staticData].filter(item =>
      item.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
  }

  isItemSelected(category: string, item: SelectableItem): boolean {
    const state = this.multiSelectStates[category];
    return state ? state.selected.some(selected => selected.id === item.id) : false;
  }

  toggleItemSelection(category: string, item: SelectableItem): void {
    const state = this.multiSelectStates[category];
    if (!state) return;

    const index = state.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      state.selected.splice(index, 1);
    } else {
      state.selected.push(item);
    }
  }

  clearSelection(category: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.selected = [];
    }
  }

  updateSearchTerm(category: string, searchTerm: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.searchTerm = searchTerm;
    }
  }

  getSelectedCount(category: string): number {
    const state = this.multiSelectStates[category];
    return state ? state.selected.length : 0;
  }

  // Modal and form methods
  addBalance() {
    this.isEditMode = false;
    this.showAddModal = true;
    this.resetForm();
  }

  closeModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  private resetForm() {
    this.balanceForm.reset();
    this.balanceForm.patchValue({
      allEmployee: false,
      includeEmployees: false,
      includeDepartments: false,
      includeBranches: false,
      includeRoles: false,
      allSts: false,
      forwardBalance: false,
      countBaseContractStart: false,
      fractionFloorCeil: false,
      includeWeekendInBetween: false
    });
    this.initializeMultiSelectStates();
  }

  // Form workflow event handlers
  onEmployeeTypeChange() {
    if (this.balanceForm.get('allEmployee')?.value) {
      this.balanceForm.patchValue({
        includeEmployees: false,
        includeDepartments: false,
        includeBranches: false,
        includeRoles: false
      });
      this.initializeMultiSelectStates();
    }
  }

  onGroupTypeChange(groupType: string) {
    const isChecked = this.balanceForm.get(`include${this.capitalizeFirst(groupType)}`)?.value;
    if (!isChecked) {
      this.clearSelection(groupType);
    }
  }

  onStatusTypeChange() {
    if (this.balanceForm.get('allSts')?.value) {
      this.balanceForm.patchValue({ stsId: '' });
    }
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Core business methods
  submitBalance() {
    if (!this.balanceForm.valid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى ملء جميع الحقول المطلوبة'
      });
      return;
    }

    const formData = this.balanceForm.value;
    
    if (this.isEditMode && this.selectedBalance) {
      this.updateBalance(formData);
    } else {
      this.addNewBalance(formData);
    }
  }

  private addNewBalance(formData: any) {
    this.employeeBalanceService.addEmployeeHandleBalance(formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجح',
          detail: 'تم إضافة توازن الموظف بنجاح'
        });
        this.loadEmployeeBalances();
        this.closeModal();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في إضافة توازن الموظف'
        });
      }
    });
  }

  private updateBalance(formData: any) {
    const updateData = {
      recId: this.selectedBalance!.recId,
      ...formData
    };
    
    this.employeeBalanceService.updateEmployeeHandleBalance(updateData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجح',
          detail: 'تم تحديث توازن الموظف بنجاح'
        });
        this.loadEmployeeBalances();
        this.closeModal();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحديث توازن الموظف'
        });
      }
    });
  }

  loadEmployeeBalances() {
    this.loading = true;
    
    this.employeeBalanceService.getEmployeeHandlesBalance(
      this.langService.getLangValue().toString(),
      this.paginationRequest.pageNumber, 
      this.paginationRequest.pageSize
    ).subscribe({
      next: (response: any) => {
        const typedResponse = response as EmployeeHandlesBalanceResponse;
        this.employeeBalances = typedResponse.data;
        this.totalRecords = typedResponse.totalCount;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل بيانات توازن الموظفين'
        });
        this.loading = false;
      }
    });
  }

  editBalance(balance: EmployeeHandleBalance) {
    this.isEditMode = true;
    this.selectedBalance = balance;
    this.balanceForm.patchValue({
      allEmployee: balance.allEmployee,
      empId: balance.empId,
      deptId: balance.deptId,
      branchId: balance.branchId,
      roleId: balance.roleId,
      stsId: balance.stsId,
      allSts: balance.allSts,
      maxPerWeek: balance.maxPerWeek,
      maxPerMonth: balance.maxPerMonth,
      maxPerYear: balance.maxPerYear,
      forwardBalance: balance.forwardBalance,
      countBaseContractStart: balance.countBaseContractStart,
      fractionFloorCeil: balance.fractionFloorCeil,
      includeWeekendInBetween: balance.includeWeekendInBetween,
      note: balance.note
    });
    this.showAddModal = true;
  }

  deleteBalance(balance: EmployeeHandleBalance) {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من أنك تريد حذف هذا السجل؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employeeBalanceService.deleteEmployeeHandleBalance(balance.recId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'نجح',
              detail: 'تم حذف السجل بنجاح'
            });
            this.loadEmployeeBalances();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'فشل في حذف السجل'
            });
          }
        });
      }
    });
  }

  // Selection methods
  isSelected(balance: EmployeeHandleBalance): boolean {
    return this.selectedItems.some(item => item.recId === balance.recId);
  }

  toggleSelection(balance: EmployeeHandleBalance) {
    const index = this.selectedItems.findIndex(item => item.recId === balance.recId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(balance);
    }
  }

  toggleSelectAll() {
    if (this.selectedItems.length === this.employeeBalances.length) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.employeeBalances];
    }
  }

  deleteSelected() {
    if (this.selectedItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'يرجى اختيار عنصر واحد على الأقل للحذف'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `هل أنت متأكد من أنك تريد حذف ${this.selectedItems.length} عنصر؟`,
      header: 'تأكيد حذف العناصر المحددة',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deletePromises = this.selectedItems.map(item => 
          this.employeeBalanceService.deleteEmployeeHandleBalance(item.recId).toPromise()
        );

        Promise.all(deletePromises).then(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجح',
            detail: 'تم حذف العناصر المحددة بنجاح'
          });
          this.selectedItems = [];
          this.loadEmployeeBalances();
        }).catch(() => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل في حذف بعض العناصر'
          });
        });
      }
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.balanceForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.balanceForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors?.['required']) {
      return 'هذا الحقل مطلوب';
    }
    return '';
  }
}
