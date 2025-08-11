import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Shift } from '../../../../core/models/shifts';
import { ShiftsService } from '../../services/shifts.service';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrl: './shifts.component.css',
  providers: [MessageService, ConfirmationService]
})
export class ShiftsComponent implements OnInit, OnDestroy {
  // Core component state
  shifts: Shift[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  
  private langSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to Arabic (2)
  
  // Reactive Forms
  searchForm!: FormGroup;

  constructor(
    private shiftsService: ShiftsService,
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
      this.currentLang = this.langService.getLangValue();
      this.loadShifts();
    });

  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForms() {
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
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  // Check if we can go to next page (considering that we might not know exact total)
  get canGoNext(): boolean {
    return this.shifts.length === this.pageSize; // If we got a full page, assume there might be more
  }

  // Check if we can go to previous page
  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Core business methods
  loadShifts() {
    this.loading = true;
    
    this.shiftsService.GetShiftsToShow(this.currentLang, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.shifts) {
          this.shifts = response.data.shifts;
          
          // Calculate total records based on returned data
          if (this.shifts.length < this.pageSize) {
            // If we got fewer items than page size, we're on the last page
            this.totalRecords = (this.currentPage - 1) * this.pageSize + this.shifts.length;
          } else {
            // If we got a full page, assume there might be more data
            // This is an estimation since the API doesn't return total count
            this.totalRecords = this.currentPage * this.pageSize + 1;
          }
        } else {
          this.shifts = [];
          this.totalRecords = 0;
          this.showErrorMessage(
            this.langService.getCurrentLang() === 'ar' ? 
              'فشل في تحميل البيانات' : 
              'Failed to load data'
          );
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading shifts:', error);
        this.showErrorMessage(
          this.langService.getCurrentLang() === 'ar' ? 
            'حدث خطأ أثناء تحميل البيانات' : 
            'Error occurred while loading data'
        );
        this.loading = false;
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && (page <= this.totalPages || this.totalPages === 0)) {
      this.currentPage = page;
      this.loadShifts();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadShifts();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadShifts();
    }
  }

  onPageSizeChange() {
    this.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.loadShifts();
  }

  onSearch() {
    // For now, we reload data when search is triggered
    // In a real implementation, you might want to pass search term to API
    this.currentPage = 1;
    this.loadShifts();
  }

  // Helper method to get search term
  get searchTerm(): string {
    return this.searchForm.get('searchTerm')?.value || '';
  }

  // Delete functionality
  deleteShift(shift: Shift) {
    this.confirmationService.confirm({
      message: this.langService.getCurrentLang() === 'ar' ? 
        'هل أنت متأكد من حذف هذه الوردية؟' : 
        'Are you sure you want to delete this shift?',
      header: this.langService.getCurrentLang() === 'ar' ? 'تأكيد الحذف' : 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.shiftsService.deleteShift(this.currentLang.toString(), parseInt(shift.shiftId)).subscribe({
          next: (response) => {
            this.showSuccessMessage(
              this.langService.getCurrentLang() === 'ar' ? 
                'تم حذف الوردية بنجاح' : 
                'Shift deleted successfully'
            );
            this.loadShifts();
          },
          error: (error) => {
            console.error('Error deleting shift:', error);
            this.showErrorMessage(
              this.langService.getCurrentLang() === 'ar' ? 
                'حدث خطأ أثناء حذف الوردية' : 
                'Error occurred while deleting shift'
            );
          }
        });
      }
    });
  }

  // Helper methods
  private showSuccessMessage(detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success',
      detail
    });
  }

  private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error',
      detail
    });
  }

  // Placeholder methods for edit and details (not working now as requested)
  editShift(shift: Shift) {
    // Placeholder for edit functionality
    console.log('Edit shift:', shift);
  }

  viewShiftDetails(shift: Shift) {
    // Placeholder for details functionality
    console.log('View shift details:', shift);
  }

  // Create shift method
  createShift() {
    // Placeholder for create functionality
    console.log('Create new shift');
  }

  // Format display values
  getDisplayValue(value: string): string {
    return value || '-';
  }

  getActiveStatus(isActive: string): string {
    if (this.langService.getCurrentLang() === 'ar') {
      return isActive === '1' || isActive === 'true' ? 'نشط' : 'غير نشط';
    } else {
      return isActive === '1' || isActive === 'true' ? 'Active' : 'Inactive';
    }
  }
}
