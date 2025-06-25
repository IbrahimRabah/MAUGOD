import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Bank, BankResponse } from '../../../../core/models/bank';
import { BankService } from '../../services/bank.service';
import { PaginationRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.component.html',
  styleUrl: './banks.component.css',
  providers: [MessageService, ConfirmationService]
})
export class BanksComponent implements OnInit {
  banks: Bank[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedBank: Bank | null = null;
  
  // Reactive Forms
  bankForm!: FormGroup;
  
  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1 // Default to English
  };

  constructor(
    private bankService: BankService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
    
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1;
      this.loadBanks(); // Reload banks when language changes
    });
  }

  initializeForm() {
    this.bankForm = this.fb.group({
      bankId: [0],
      ar_Name: ['', [Validators.required]],
      en_Name: ['', [Validators.required]],
      bankData: [''],
      note: [''],
      del: ['']
    });
  }

  ngOnInit() {
    this.loadBanks();
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
      this.loadBanks();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadBanks();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadBanks();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadBanks();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadBanks();
  }

  addBank() {
    this.showAddModal = true;
    this.resetForm();
  }

  editBank(bank: Bank) {
    this.selectedBank = bank;
    this.bankForm.patchValue({
      bankId: bank.bankId,
      ar_Name: bank.ar_Name,
      en_Name: bank.en_Name,
      bankData: bank.bankData,
      note: bank.note,
      del: bank.del
    });
    this.showEditModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedBank = null;
    this.resetForm();
  }

  resetForm() {
    this.bankForm.reset({
      bankId: 0,
      ar_Name: '',
      en_Name: '',
      bankData: '',
      note: '',
      del: ''
    });
  }

  submitBank() {
    if (this.bankForm.valid) {
      const formValue = this.bankForm.value;
      
      if (this.showEditModal && this.selectedBank) {
        // Update bank
        this.bankService.updateBank(formValue).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم تحديث البنك بنجاح' : 'Bank updated successfully'
            });
            this.closeModal();
            this.loadBanks();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في تحديث البنك' : 'Failed to update bank'
            });
          }
        });
      } else {
        // Add new bank
        this.bankService.addBank(formValue).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم إضافة البنك بنجاح' : 'Bank added successfully'
            });
            this.closeModal();
            this.loadBanks();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في إضافة البنك' : 'Failed to add bank'
            });
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.bankForm.markAllAsTouched();
    }
  }

  loadBanks() {
    this.loading = true;
    this.bankService.getBanks(this.paginationRequest).subscribe({
      next: (response: BankResponse) => {
        if (response.isSuccess) {
          this.banks = response.data.banks;
          this.totalRecords = response.data.totalCount;
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
            detail: response.message || (this.langService.getCurrentLang() === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data')
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

  deleteBank(bank: Bank) {
    this.confirmationService.confirm({
      message: this.langService.getCurrentLang() === 'ar' ? 
        `هل أنت متأكد من حذف البنك "${bank.ar_Name}"؟` : 
        `Are you sure you want to delete the bank "${bank.en_Name}"?`,
      header: this.langService.getCurrentLang() === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.bankService.deleteBank(bank.bankId).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم حذف البنك بنجاح' : 'Bank deleted successfully'
            });
            this.loadBanks();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في حذف البنك' : 'Failed to delete bank'
            });
          }
        });
      }
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.bankForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.bankForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return this.langService.getCurrentLang() === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
      }
    }
    return '';
  }

  // Getter method for form validation
  get isFormValid(): boolean {
    return this.bankForm.valid;
  }
}
