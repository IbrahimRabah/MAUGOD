import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LanguageService } from '../../../../core/services/language.service';
import { NationalityService } from '../../services/nationality.service';
import { Nationality, NationalityResponse } from '../../../../core/models/nationality ';
import { PaginationRequest } from '../../../../core/models/pagination';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-nationalities',
  templateUrl: './nationalities.component.html',
  styleUrl: './nationalities.component.css',
  providers: [MessageService, ConfirmationService]
})
export class NationalitiesComponent implements OnInit {
  nationalities: Nationality[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedNationality: Nationality | null = null;
  
  // Reactive Forms
  nationalityForm!: FormGroup;
  
  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1 // Default to English
  };

  constructor(
    private nationalityService: NationalityService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
    
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1;
      this.loadNationalities(); // Reload nationalities when language changes
    });
  }

  initializeForm() {
    this.nationalityForm = this.fb.group({
      natId: [''],
      ar: ['', [Validators.required, CustomValidators.noEnglishInArabicValidator]],
      en: ['', [Validators.required, CustomValidators.noArabicInEnglishValidator]],
      note: [''],
      del: ['']
    });
  }

  ngOnInit() {
    this.loadNationalities();
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
      this.loadNationalities();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadNationalities();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadNationalities();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadNationalities();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadNationalities();
  }

  addNationality() {
    this.showAddModal = true;
    this.resetForm();
  }

  editNationality(nationality: Nationality) {
    this.selectedNationality = nationality;
    this.nationalityForm.patchValue({
      natId: nationality.natId,
      ar: nationality.ar_Name,
      en: nationality.en_Name,
      note: nationality.note,
      del: nationality.del
    });
    this.showEditModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedNationality = null;
    this.resetForm();
  }

  resetForm() {
    this.nationalityForm.reset({
      natId: '',
      ar: '',
      en: '',
      note: '',
      del: ''
    });
  }

  submitNationality() {
    if (this.nationalityForm.valid) {
      const formValue = this.nationalityForm.value;
      
      if (this.showEditModal && this.selectedNationality) {
        // Update nationality
        this.nationalityService.updateNationality(formValue).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم تحديث الجنسية بنجاح' : 'Nationality updated successfully'
            });
            this.closeModal();
            this.loadNationalities();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في تحديث الجنسية' : 'Failed to update nationality'
            });
          }
        });
      } else {
        // Add new nationality
        this.nationalityService.addNationality(formValue).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم إضافة الجنسية بنجاح' : 'Nationality added successfully'
            });
            this.closeModal();
            this.loadNationalities();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في إضافة الجنسية' : 'Failed to add nationality'
            });
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.nationalityForm.markAllAsTouched();
    }
  }

  loadNationalities() {
    this.loading = true;
    this.nationalityService.getNationalities(this.paginationRequest).subscribe({
      next: (response: NationalityResponse) => {
        if (response.isSuccess) {
          this.nationalities = response.data.nationalities;
          this.totalRecords = response.data.totalCount;
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
            detail: response.message 
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
          detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data'
        });
        this.loading = false;
      }
    });
  }

  deleteNationality(nationality: Nationality) {
    this.confirmationService.confirm({
      message: this.langService.getCurrentLang() === 'ar' ? 
        `هل أنت متأكد من حذف الجنسية "${nationality.ar_Name}"؟` : 
        `Are you sure you want to delete the nationality "${nationality.en_Name}"?`,
      header: this.langService.getCurrentLang() === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.nationalityService.deleteNationality(parseInt(nationality.natId)).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم حذف الجنسية بنجاح' : 'Nationality deleted successfully'
            });
            this.loadNationalities();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في حذف الجنسية' : 'Failed to delete nationality'
            });
          }
        });
      }
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.nationalityForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.nationalityForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      const isArabic = this.langService.getCurrentLang() === 'ar';
      return CustomValidators.getErrorMessage(field.errors, fieldName, isArabic);
    }
    return '';
  }

  // Getter method for form validation
  get isFormValid(): boolean {
    return this.nationalityForm.valid;
  }
}
