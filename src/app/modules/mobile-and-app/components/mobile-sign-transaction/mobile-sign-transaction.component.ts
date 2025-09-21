import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { MobileSignTransaction, MobileSignTransactionRequest, RecalculateRequest } from '../../../../core/models/MobileSignTransaction';
import { SignTransactionsService } from '../../services/sign-transactions.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { PaginationRequest } from '../../../../core/models/pagination';

interface SelectableItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-mobile-sign-transaction',
  templateUrl: './mobile-sign-transaction.component.html',
  styleUrl: './mobile-sign-transaction.component.css',
  providers: [MessageService, ConfirmationService]
})
export class MobileSignTransactionComponent implements OnInit, OnDestroy {
  // Core component state
  mobileSignTransactions: MobileSignTransaction[] = [];
  searchTerm: string = '';
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  selectedItems: MobileSignTransaction[] = [];

  private isInitialized = false; // Prevent double API calls on init

    searchColumns = [
      { column: '', label: 'All Columns' }, // all columns option
      { column: 'EMP_NAME', label: 'MOBILE_SIGN_TRANSACTION.EMPLOYEE' },
      { column: 'sign_date', label: 'MOBILE_SIGN_TRANSACTION.SIGN_DATE' },
      { column: 'STATUS_NAME', label: 'MOBILE_SIGN_TRANSACTION.STATUS' },
      { column: 'phone_id', label: 'MOBILE_SIGN_TRANSACTION.PHONE' },
      { column: 'accepted_by', label: 'MOBILE_SIGN_TRANSACTION.ACCEPTED_BY_LOCATION' },
    ];
    selectedColumn: string = '';
    selectedColumnLabel: string = this.searchColumns[0].label;
  
    selectColumn(col: any) {
      this.selectedColumn = col.column;
      this.paginationRequest.searchColumn = col.column;
      this.selectedColumnLabel = col.label;
    }
  
    paginationRequest: PaginationRequest = {
        pageNumber: 1,
        pageSize: 10,
        lang: 1,// Default to English, can be changed based on app's language settings
        searchColumn: this.selectedColumn,
        searchText: this.searchTerm
      };
    
    onSearch() {
      this.currentPage = 1;
      this.paginationRequest.pageNumber = 1;
      this.paginationRequest.searchColumn = this.selectedColumn;
      this.paginationRequest.searchText = this.searchTerm;
      this.loadMobileSignTransactions();
    }
  
  
  // Form
  filterForm!: FormGroup;

  // Employees dropdown data
  employees: SelectableItem[] = [];
  filteredEmployees: SelectableItem[] = [];
  loadingEmployees = false;
  employeeSearchTerm = '';
  showEmployeeDropdown = false;
  selectedEmployee: SelectableItem | null = null;

  constructor(
    private signTransactionsService: SignTransactionsService,
    private dropdownlistsService: DropdownlistsService,
    public langService: LanguageService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {
    this.initializeForm();

    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1;

      // Only reload mobileSignTransactions if component is already initialized (not first time)
      if (this.isInitialized) {
        this.loadMobileSignTransactions(); // Reload mobileSignTransactions when language changes
      }
    })
  }

  ngOnInit() {
    this.loadEmployees();
    this.loadMobileSignTransactions();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy() {
    // Cleanup if needed
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.employee-dropdown');
    if (!dropdown) {
      this.showEmployeeDropdown = false;
    }
  }

  initializeForm() {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      empId: [null]
    });
  }

  getStoredEmpId(): number | undefined {
    const empId = this.authService.getEmpIdAsNumber();
    return empId ? empId : undefined;
  }

  // Load employees dropdown
  loadEmployees() {
    this.loadingEmployees = true;
    const empId = this.getStoredEmpId();
    const lang = this.langService.getLangValue();
    
    if (empId) {
      this.dropdownlistsService.getEmpsDropdownList(lang, empId).subscribe({
        next: (response) => {
          if (response.isSuccess && response.data?.employees) {
            this.employees = response.data.employees;
            this.filteredEmployees = [...this.employees];
          }
          this.loadingEmployees = false;
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.loadingEmployees = false;
        }
      });
    } else {
      this.loadingEmployees = false;
    }
  }

  // Load mobile sign transactions
  loadMobileSignTransactions() {
    this.loading = true;
    const lang = this.langService.getLangValue();
    const formValue = this.filterForm.value;
    
    const request: MobileSignTransactionRequest = {
      pageNumber: this.paginationRequest.pageNumber,
      pageSize: this.paginationRequest.pageSize,
      searchColumn: this.paginationRequest.searchColumn,
      searchText: this.paginationRequest.searchText
    };

    // Add filters if they exist
    if (formValue.empId) {
      request.empId = formValue.empId;
    }
    if (formValue.startDate) {
      request.sDate = formValue.startDate;
    }
    if (formValue.endDate) {
      request.eDate = formValue.endDate;
    }

    this.signTransactionsService.GetMobileSignTransactions(lang, request).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.mobileSignTransactions) {
          this.mobileSignTransactions = response.data.mobileSignTransactions;
          this.totalRecords = this.mobileSignTransactions.length; // Adjust if backend provides total count
        } else {
          this.mobileSignTransactions = [];
          this.totalRecords = 0;
        }
        this.loading = false;
        this.selectedItems = []; // Clear selection when data refreshes
      },
      error: (error) => {
        console.error('Error loading mobile sign transactions:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ERROR'),
          detail: 'Error loading data'
        });
        this.loading = false;
      }
    });
  }

  // Filter methods
  onFilter() {
    this.currentPage = 1;
    this.loadMobileSignTransactions();
  }

  onClearFilters() {
    this.filterForm.reset();
    this.selectedEmployee = null;
    this.currentPage = 1;
    this.loadMobileSignTransactions();
  }

  // Employee dropdown methods
  onEmployeeSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.employeeSearchTerm = target.value.toLowerCase();
    this.filterEmployees();
  }

  filterEmployees() {
    if (!this.employeeSearchTerm) {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(emp => 
        emp.label.toLowerCase().includes(this.employeeSearchTerm)
      );
    }
  }

  selectEmployee(employee: SelectableItem) {
    this.selectedEmployee = employee;
    this.filterForm.patchValue({ empId: employee.value });
    this.showEmployeeDropdown = false;
    this.employeeSearchTerm = employee.label;
  }

  clearEmployeeSelection() {
    this.selectedEmployee = null;
    this.filterForm.patchValue({ empId: null });
    this.employeeSearchTerm = '';
    this.filteredEmployees = [...this.employees];
  }

  // Pagination computed properties
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.paginationRequest.pageSize);
  }

  get currentPageStart(): number {
    return (this.currentPage - 1) * this.paginationRequest.pageSize + 1;
  }

  get currentPageEnd(): number {
    return Math.min(this.currentPage * this.paginationRequest.pageSize, this.totalRecords);
  }

  // Selection state getters
  get isAllSelected(): boolean {
    return this.mobileSignTransactions.length > 0 && 
           this.selectedItems.length === this.mobileSignTransactions.length;
  }

  get isPartiallySelected(): boolean {
    return this.selectedItems.length > 0 && 
           this.selectedItems.length < this.mobileSignTransactions.length;
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadMobileSignTransactions();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadMobileSignTransactions();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadMobileSignTransactions();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadMobileSignTransactions();
  }

  onPageSizeChangeEvent(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = +target.value;
    this.onPageSizeChange();
  }

  // Selection methods
  isSelected(item: MobileSignTransaction): boolean {
    return this.selectedItems.some(selected => selected.mobTransId === item.mobTransId);
  }

  toggleSelection(item: MobileSignTransaction) {
    const index = this.selectedItems.findIndex(selected => selected.mobTransId === item.mobTransId);
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
      this.selectedItems = [...this.mobileSignTransactions];
    }
  }

  // Recalculate selected
  recalculateSelected() {
    if (this.selectedItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: this.translateService.instant('WARNING'),
        detail: 'Please select at least one record'
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to recalculate the selected records?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performRecalculation();
      }
    });
  }

  performRecalculation() {
    const selectedIds = this.selectedItems.map(item => item.mobTransId);
    const lang = this.langService.getLangValue();
    
    const request: RecalculateRequest = {
      selectedRecIds: selectedIds
    };

    this.loading = true;
    this.signTransactionsService.recalculateSelected(lang, request).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('SUCCESS'),
            detail: response.message || 'Recalculation completed successfully'
          });
          // Reload data after successful recalculation
          this.loadMobileSignTransactions();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ERROR'),
            detail: response.message || 'Recalculation failed'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error during recalculation:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ERROR'),
          detail: 'Error during recalculation'
        });
        this.loading = false;
      }
    });
  }

  // Utility methods
  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  getStatusBadgeClass(status: number): string {
    // Adjust based on your status values
    switch (status) {
      case 1: return 'boolean-badge yes';
      case 0: return 'boolean-badge no';
      default: return 'boolean-badge';
    }
  }

  // Preview transaction
  previewTransaction(item: MobileSignTransaction) {
    // TODO: Implement preview functionality
    console.log('Preview transaction:', item);
    
    // You can add actual preview logic here, such as:
    // - Opening a modal with transaction details
    // - Navigating to a preview page
    // - Showing a tooltip with more information
    
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('MOBILE_SIGN_TRANSACTION.PREVIEW'),
      detail: `Preview for ${item.empName} - ${this.formatDate(item.signDate)}`
    });
  }
}
