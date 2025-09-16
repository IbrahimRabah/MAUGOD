import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { DelegationService } from '../../services/delegation.service';
import { DelegationData, DelegationResponse, CreateDelegationRequest } from '../../../../core/models/delegations';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { Employee } from '../../../../core/models/employee';

@Component({
  selector: 'app-permissions-delegations',
  templateUrl: './permissions-delegations.component.html',
  styleUrl: './permissions-delegations.component.css',
  providers: [MessageService, ConfirmationService]
})
export class PermissionsDelegationsComponent implements OnInit, OnDestroy {
  
  // Core component state
  delegations: DelegationData[] = [];
  filteredDelegations: DelegationData[] = [];
  searchTerm: string = '';
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;

  private isInitialized = false; // Prevent double API calls on init

  // Modal state
  showCreateModal = false;
  delegationForm!: FormGroup;

  // Employee multiselect
  employees: Employee[] = [];
  loadingEmployees = false;
  employeeMultiSelectState = {
    available: [] as Array<{id: number, name: string}>,
    selected: [] as Array<{id: number, name: string}>,
    searchTerm: ''
  };

  private langSubscription: Subscription = new Subscription();
  public currentLang = parseInt(localStorage.getItem('lang') || '2'); // Get from localStorage, default to Arabic (2)
  
  constructor(
    private delegationService: DelegationService,
    public langService: LanguageService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder,
    private dropdownlistsService: DropdownlistsService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.initializeLanguage();
    this.loadDelegations();
    this.isInitialized = true;
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  // Initialize language settings
  private initializeLanguage() {
    this.langSubscription = this.langService.currentLang$.subscribe((lang: string) => {
      this.currentLang = this.langService.getLangValue();
      if (this.isInitialized) {
        this.loadDelegations();
      }
    });
  }

  // Initialize form
  private initializeForm() {
    this.delegationForm = this.fb.group({
      dToEmps: [[], Validators.required],
      sDate: ['', Validators.required],
      eDate: ['', Validators.required],
      note: ['']
    });
  }

  // Load employees for multiselect
  private loadEmployees() {
    this.loadingEmployees = true;
    const empId = this.authService.getEmpIdAsNumber() || parseInt(localStorage.getItem('empId') || '0');

    this.dropdownlistsService.getEmpsDropdownList(this.currentLang, empId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.employees = response.data.employees || [];
          this.employeeMultiSelectState.available = response.data.employees.map((emp: any) => ({
            id: emp.value,
            name: emp.label
          }));
        } else {
          this.showError('PERMISSIONS_DELEGATIONS.LOAD_EMPLOYEES_ERROR');
        }
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.showError('PERMISSIONS_DELEGATIONS.LOAD_EMPLOYEES_ERROR');
      },
      complete: () => {
        this.loadingEmployees = false;
      }
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
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Core business methods
  loadDelegations() {
    if (this.loading) return;
    
    this.loading = true;
    // Get empId from localStorage or authentication service
    let empId = this.authService.getEmpIdAsNumber();
    if (!empId) {
      const empIdFromStorage = localStorage.getItem('empId');
      empId = empIdFromStorage ? parseInt(empIdFromStorage, 10) : null;
    }
    
    if (!empId) {
      this.showError('PERMISSIONS_DELEGATIONS.EMPLOYEE_ID_NOT_FOUND');
      this.loading = false;
      return;
    }

    // Get current language from localStorage
    this.currentLang = parseInt(localStorage.getItem('lang') || '2');

    this.delegationService.getALlPermissionDelegations(
      this.currentLang,
      empId,
      this.currentPage, // Using 1-based index as requested
      this.pageSize
    ).subscribe({
      next: (response: DelegationResponse) => {
        if (response.isSuccess) {
          this.delegations = response.data || [];
          this.filteredDelegations = [...this.delegations];
          this.totalRecords = response.totalCount;
          
          // Apply search filter if exists
          if (this.searchTerm) {
            this.applyFilter();
          }
        } else {
          this.showError(response.message || 'PERMISSIONS_DELEGATIONS.LOAD_ERROR');
          this.delegations = [];
          this.filteredDelegations = [];
          this.totalRecords = 0;
        }
      },
      error: (error) => {
        console.error('Error loading delegations:', error);
        this.showError('PERMISSIONS_DELEGATIONS.LOAD_ERROR');
        this.delegations = [];
        this.filteredDelegations = [];
        this.totalRecords = 0;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDelegations();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadDelegations();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadDelegations();
    }
  }

  goToFirstPage() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.loadDelegations();
    }
  }

  goToLastPage() {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages;
      this.loadDelegations();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadDelegations();
  }

  // Filter methods
  applyFilter() {
    if (!this.searchTerm.trim()) {
      this.filteredDelegations = [...this.delegations];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredDelegations = this.delegations.filter(delegation =>
      delegation.dFromEmpName?.toLowerCase().includes(searchLower) ||
      delegation.dToEmpName?.toLowerCase().includes(searchLower) ||
      delegation.note?.toLowerCase().includes(searchLower) ||
      delegation.sDate?.toLowerCase().includes(searchLower) ||
      delegation.eDate?.toLowerCase().includes(searchLower)
    );
  }

  resetFilter() {
    this.searchTerm = '';
    this.filteredDelegations = [...this.delegations];
  }

  // Utility methods for template
  parseInt(value: string): number {
    return parseInt(value, 10);
  }

  // TrackBy function for better performance
  trackByDelegationId(index: number, item: DelegationData): number {
    return item.delegateId;
  }

  // Action button methods
  editDelegation(item: DelegationData) {
    // TODO: Implement edit functionality
    console.log('Edit delegation:', item);
  }

  cancelDelegation(item: DelegationData) {
    // TODO: Implement cancel functionality
    console.log('Cancel delegation:', item);
  }

  // Modal and multiselect methods
  createDelegation() {
    this.showCreateModal = true;
    this.loadEmployees();
    this.resetForm();
  }

  closeModal() {
    this.showCreateModal = false;
    this.resetForm();
  }

  private resetForm() {
    this.delegationForm.reset();
    this.employeeMultiSelectState.selected = [];
    this.employeeMultiSelectState.searchTerm = '';
  }

  // Employee multiselect methods (identical to handle-statuses-employee-balance)
  getFilteredEmployees(): Array<{id: number, name: string}> {
    if (!this.employeeMultiSelectState.searchTerm) {
      return this.employeeMultiSelectState.available;
    }
    
    return this.employeeMultiSelectState.available.filter(item =>
      item.name.toLowerCase().includes(this.employeeMultiSelectState.searchTerm.toLowerCase())
    );
  }

  isEmployeeSelected(item: {id: number, name: string}): boolean {
    return this.employeeMultiSelectState.selected.some(selected => selected.id === item.id);
  }

  toggleEmployeeSelection(item: {id: number, name: string}): void {
    const index = this.employeeMultiSelectState.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      this.employeeMultiSelectState.selected.splice(index, 1);
    } else {
      this.employeeMultiSelectState.selected.push(item);
    }
    
    // Update form array
    const selectedIds = this.employeeMultiSelectState.selected.map(emp => emp.id);
    this.delegationForm.patchValue({ dToEmps: selectedIds });
  }

  clearEmployeeSelection(): void {
    this.employeeMultiSelectState.selected = [];
    this.employeeMultiSelectState.searchTerm = '';
    this.delegationForm.patchValue({ dToEmps: [] });
  }

  updateEmployeeSearchTerm(searchTerm: string): void {
    this.employeeMultiSelectState.searchTerm = searchTerm;
  }

  getSelectedEmployeeCount(): number {
    return this.employeeMultiSelectState.selected.length;
  }

  selectAllEmployees(): void {
    this.employeeMultiSelectState.selected = [...this.employeeMultiSelectState.available];
    const selectedIds = this.employeeMultiSelectState.selected.map(emp => emp.id);
    this.delegationForm.patchValue({ dToEmps: selectedIds });
  }

  hasSelectableEmployees(): boolean {
    return this.getFilteredEmployees().length > 0;
  }

  areAllEmployeesSelected(): boolean {
    const filtered = this.getFilteredEmployees();
    return filtered.length > 0 && filtered.every(item => this.isEmployeeSelected(item));
  }

  // Form submission
  submitDelegation() {
    if (this.delegationForm.invalid) {
      this.showError('PERMISSIONS_DELEGATIONS.FORM_INVALID');
      return;
    }

    const formValue = this.delegationForm.value;
    const dFromEmp = this.authService.getEmpIdAsNumber() || parseInt(localStorage.getItem('empId') || '0');
    
    if (!dFromEmp) {
      this.showError('PERMISSIONS_DELEGATIONS.EMPLOYEE_ID_NOT_FOUND');
      return;
    }

    const createRequest: CreateDelegationRequest = {
      dFromEmp: dFromEmp,
      dToEmps: formValue.dToEmps,
      sDate: formValue.sDate,
      eDate: formValue.eDate,
      note: formValue.note || ''
    };

    this.delegationService.createDelegation(createRequest, this.currentLang).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.showSuccess('PERMISSIONS_DELEGATIONS.CREATE_SUCCESS');
          this.closeModal();
          this.loadDelegations(); // Refresh the table
        } else {
          this.showError(response.message || 'PERMISSIONS_DELEGATIONS.CREATE_ERROR');
        }
      },
      error: (error) => {
        console.error('Error creating delegation:', error);
        this.showError('PERMISSIONS_DELEGATIONS.CREATE_ERROR');
      }
    });
  }

  // Form validation helper
  get isDelegationFormValid(): boolean {
    return this.delegationForm.valid && this.employeeMultiSelectState.selected.length > 0;
  }

  // Helper methods for displaying status
  getStatusDisplayText(status: boolean): string {
    return status ? 'PERMISSIONS_DELEGATIONS.ACTIVE' : 'PERMISSIONS_DELEGATIONS.INACTIVE';
  }

  getStatusIcon(status: boolean): string {
    return status ? 'fa fa-check-circle text-success' : 'fa fa-times-circle text-danger';
  }

  getSourceTypeDisplayText(sourceType: boolean): string {
    return sourceType ? 'PERMISSIONS_DELEGATIONS.INTERNAL' : 'PERMISSIONS_DELEGATIONS.EXTERNAL';
  }

  // Message helper methods
  private showSuccess(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('GENERAL.SUCCESS'),
      detail: this.translateService.instant(message),
      life: 3000
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('GENERAL.ERROR'),
      detail: this.translateService.instant(message),
      life: 5000
    });
  }

  private showInfo(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('GENERAL.INFO'),
      detail: this.translateService.instant(message),
      life: 3000
    });
  }

  private showWarning(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: this.translateService.instant('GENERAL.WARNING'),
      detail: this.translateService.instant(message),
      life: 4000
    });
  }
}
