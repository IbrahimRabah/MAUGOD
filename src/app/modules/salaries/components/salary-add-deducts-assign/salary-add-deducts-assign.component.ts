import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../../core/services/language.service';
import { SalariesAddDeductsAssignService } from '../../services/salaries-add-deducts-assign.service';
import { SalaryAddOnsService } from '../../services/salary-add-ons.service';
import { EmployeeAssignData, AddEmployeeSalaryRequest } from '../../../../core/models/salariesAssign';
import { Addon, AddOnsApiResponse } from '../../../../core/models/addon';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-salary-add-deducts-assign',
  templateUrl: './salary-add-deducts-assign.component.html',
  styleUrl: './salary-add-deducts-assign.component.css',
  providers: [MessageService, ConfirmationService]
})
export class SalaryAddDeductsAssignComponent implements OnInit, OnDestroy {
  // Core component state
  assignments: EmployeeAssignData[] = [];
  addons: Addon[] = [];
  employees: any[] = []; // You'll need to define the employee interface
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  showAddModal = false;
  
  private langSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to Arabic

  // Reactive Forms
  assignmentForm!: FormGroup;
  searchForm!: FormGroup;


 searchColumns = [
    { column: 'AllFields', label: 'All Columns' }, // all columns option
    { column: 'ar', label: 'SALARY_ADD_ONS_DEDUCTS.ARABIC_NAME' },
    { column: 'en', label: 'SALARY_ADD_ONS_DEDUCTS.ENGLISH_NAME' },
    { column: 'addDed', label: 'SALARY_ADD_ONS_DEDUCTS.ADD_OR_DEDUCT' },
    { column: 'perWorkingDay', label: 'SALARY_ADD_ONS_DEDUCTS.PER_WORKING_DAY' },
    { column: 'includeWhenDedAbsent', label: 'SALARY_ADD_ONS_DEDUCTS.INCLUDE_WHEN_DEDUCT_ABSENT' },
    { column: 'includeWhenInVaction', label: 'SALARY_ADD_ONS_DEDUCTS.INCLUDE_WHEN_IN_VACATION' },
    { column: 'includeWhenInPaidVaction', label: 'SALARY_ADD_ONS_DEDUCTS.INCLUDE_WHEN_IN_PAID_VACATION' },
    { column: 'includeInEndOfService', label: 'SALARY_ADD_ONS_DEDUCTS.INCLUDE_IN_END_OF_SERVICE' },
    { column: 'note', label: 'SALARY_ADD_ONS_DEDUCTS.NOTE' },
  ];
  searchText: string = '';
  
  selectedColumnLabel: string = this.searchColumns[0].label;
  selectedColumn: string = this.searchColumns[0].column;



selectColumn(col: any) {
    this.selectedColumn = col.column;
    this.selectedColumnLabel = col.label;
  }

  constructor(
    private salariesAssignService: SalariesAddDeductsAssignService,
    private salaryAddOnsService: SalaryAddOnsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    this.currentLang = this.langService.getLangValue();
  }

  ngOnInit() {
    // Subscribe to language changes
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      this.loadAssignments();
      this.loadAddons(); // Reload addons when language changes
    });

    // Load initial data
    this.loadAssignments();
    this.loadAddons();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForms() {
    this.assignmentForm = this.fb.group({
      empIds: [[], [Validators.required]],
      addonId: ['', [Validators.required]],
      amnt: ['', [Validators.required, Validators.min(0)]],
      sdate: ['', [Validators.required]],
      edate: ['', [Validators.required]],
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
  get isAssignmentFormValid(): boolean {
    return this.assignmentForm.valid;
  }

  get searchTerm(): string {
    return this.searchForm.get('searchTerm')?.value || '';
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAssignments();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAssignments();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAssignments();
    }
  }

  onPageSizeChange() {
    this.pageSize = parseInt(this.searchForm.get('pageSize')?.value);
    this.currentPage = 1;
    this.loadAssignments();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadAssignments();
  }

  // Modal and form methods
  addAssignment() {
    this.resetForm();
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  private resetForm() {
    this.assignmentForm.reset({
      empIds: [],
      addonId: '',
      amnt: '',
      sdate: '',
      edate: '',
      note: ''
    });
  }

  // Core business methods
  submitAssignment() {
    if (!this.isAssignmentFormValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    const formData: AddEmployeeSalaryRequest = this.assignmentForm.value;
    this.createAssignment(formData);
  }

  private createAssignment(formData: AddEmployeeSalaryRequest) {
    this.loading = true;
    const lang = this.currentLang;
    
    this.salariesAssignService.addEmployeeSalary(formData, lang).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Salary assignment added successfully'
        });
        this.closeModal();
        this.loadAssignments();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add salary assignment'
        });
        this.loading = false;
      }
    });
  }

  loadAssignments() {
    this.loading = true;
    const lang = this.currentLang;
    
    this.salariesAssignService.getAllEmployeeSalaries(lang, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.assignments = response.data || [];
          this.totalRecords = response.totalCount;
          
          // Apply local search filter if search term exists
          if (this.searchTerm && this.searchTerm.trim() !== '') {
            this.assignments = this.assignments.filter(assignment => 
              assignment.employeeName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              assignment.addonName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              (assignment.note && assignment.note.toLowerCase().includes(this.searchTerm.toLowerCase()))
            );
          }
          
          this.loading = false;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Failed to load salary assignments'
          });
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading salary assignments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load salary assignments'
        });
        this.loading = false;
      }
    });
  }

  private loadAddons() {
    const lang = this.currentLang;
    
    this.salaryAddOnsService.getAllSalaryAddOns(lang, 1, 100, this.selectedColumn, this.searchText).subscribe({
      next: (response: AddOnsApiResponse) => {
        if (response.isSuccess) {
          this.addons = response.data || [];
        }
      },
      error: (error: any) => {
        console.error('Error loading addons:', error);
      }
    });
  }

  deleteAssignment(assignment: EmployeeAssignData) {
    this.confirmationService.confirm({
      message: 'SALARY_ADD_DEDUCTS_ASSIGN.DELETE_CONFIRMATION',
      header: 'SALARY_ADD_DEDUCTS_ASSIGN.DELETE_CONFIRMATION_HEADER',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDelete(assignment.recId);
      }
    });
  }

  private performDelete(recId: number) {
    const lang = this.currentLang;
    
    this.salariesAssignService.deleteEmployeeSalary(recId, lang).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Salary assignment deleted successfully'
        });
        this.loadAssignments();
      },
      error: (error) => {
        console.error('Error deleting salary assignment:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete salary assignment'
        });
      }
    });
  }

  // Helper method to get add/deduct text based on addon
  getAddDeductText(addonName: string): string {
    return addonName;
  }

  // Helper method to get add/deduct class for styling
  getAddDeductClass(addonName: string): string {
    // This is a simple heuristic - you might want to improve this
    // by fetching the actual addon details
    if (addonName.toLowerCase().includes('deduct') || 
        addonName.toLowerCase().includes('خصم') ||
        addonName.toLowerCase().includes('penalty')) {
      return 'deduct';
    }
    return 'add';
  }

  // Helper method to format dates
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.assignmentForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.assignmentForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
    }
    return '';
  }
}
