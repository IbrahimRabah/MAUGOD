import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LanguageService } from '../../../../core/services/language.service';
import { NationalityService } from '../../services/nationality.service';
import { Nationality, NationalityResponse } from '../../../../core/models/nationality ';
import { PaginationRequest } from '../../../../core/models/pagination';

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
  
  // Form data
  nationalityForm = {
    natId: '',
    ar_Name: '',
    en_Name: '',
    note: '',
    del: ''
  };
  
  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1 // Default to English
  };

  constructor(
    private nationalityService: NationalityService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1;
      this.loadNationalities(); // Reload nationalities when language changes
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
    this.nationalityForm = {
      natId: nationality.natId,
      ar_Name: nationality.ar_Name,
      en_Name: nationality.en_Name,
      note: nationality.note,
      del: nationality.del
    };
    this.showEditModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedNationality = null;
    this.resetForm();
  }

  resetForm() {
    this.nationalityForm = {
      natId: '',
      ar_Name: '',
      en_Name: '',
      note: '',
      del: ''
    };
  }

  submitNationality() {
    if (this.showEditModal && this.selectedNationality) {
      // Update nationality
      this.nationalityService.updateNationality(this.nationalityForm).subscribe({
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
      this.nationalityService.addNationality(this.nationalityForm).subscribe({
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
}
