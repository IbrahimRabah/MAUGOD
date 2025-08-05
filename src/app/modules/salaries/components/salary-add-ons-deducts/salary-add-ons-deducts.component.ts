import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LanguageService } from '../../../../core/services/language.service';
import { SalaryAddOnsService } from '../../services/salary-add-ons.service';
import { Addon } from '../../../../core/models/addon';

@Component({
  selector: 'app-salary-add-ons-deducts',
  templateUrl: './salary-add-ons-deducts.component.html',
  styleUrl: './salary-add-ons-deducts.component.css',
  providers: [MessageService, ConfirmationService]
})
export class SalaryAddOnsDeductsComponent implements OnInit, OnDestroy {
  // Core component state
  addons: Addon[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  showAddModal = false;
  selectedAddon: Addon | null = null;
  isEditMode = false;
  
  private langSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to English

  // Reactive Forms
  addonForm!: FormGroup;
  searchForm!: FormGroup;

  constructor(
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
      this.loadAddons();
    });

    // Load initial data
    this.loadAddons();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForms() {
    this.addonForm = this.fb.group({
      addonId: [0],
      ar: ['', [Validators.required]],
      en: ['', [Validators.required]],
      addDed: [1], // Default to 1 (add)
      perWorkingDay: [false],
      includeWhenDedAbsent: [false],
      includeWhenInVaction: [false],
      includeWhenInPaidVaction: [false],
      includeInEndOfService: [false],
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
  get isAddonFormValid(): boolean {
    return this.addonForm.valid;
  }

  get searchTerm(): string {
    return this.searchForm.get('searchTerm')?.value || '';
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAddons();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAddons();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAddons();
    }
  }

  onPageSizeChange() {
    this.pageSize = parseInt(this.searchForm.get('pageSize')?.value);
    this.currentPage = 1;
    this.loadAddons();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadAddons();
  }

  // Modal and form methods
  addAddon() {
    this.isEditMode = false;
    this.selectedAddon = null;
    this.resetForm();
    this.showAddModal = true;
  }

  editAddon(addon: Addon) {
    this.isEditMode = true;
    this.selectedAddon = addon;
    this.addonForm.patchValue({
      addonId: addon.addonId,
      ar: addon.ar,
      en: addon.en,
      addDed: addon.addDed,
      perWorkingDay: addon.perWorkingDay,
      includeWhenDedAbsent: addon.includeWhenDedAbsent,
      includeWhenInVaction: addon.includeWhenInVaction,
      includeWhenInPaidVaction: addon.includeWhenInPaidVaction,
      includeInEndOfService: addon.includeInEndOfService,
      note: addon.note || ''
    });
    this.showAddModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.selectedAddon = null;
    this.resetForm();
  }

  private resetForm() {
    this.addonForm.reset({
      addonId: 0,
      ar: '',
      en: '',
      addDed: 1, // Default to 1 (add)
      perWorkingDay: false,
      includeWhenDedAbsent: false,
      includeWhenInVaction: false,
      includeWhenInPaidVaction: false,
      includeInEndOfService: false,
      note: ''
    });
  }

  // Core business methods
  submitAddon() {
    if (!this.isAddonFormValid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields'
      });
      return;
    }

    const formData = this.addonForm.value;
    
    if (this.isEditMode) {
      this.updateAddon(formData);
    } else {
      this.createAddon(formData);
    }
  }

  private createAddon(formData: any) {
    this.loading = true;
    const lang = this.currentLang ;
    
    this.salaryAddOnsService.addSalaryAddOn(formData, lang).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Add-on/Deduction added successfully'
        });
        this.closeModal();
        this.loadAddons();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to add add-on/deduction'
        });
        this.loading = false;
      }
    });
  }

  private updateAddon(formData: any) {
    this.loading = true;
    const lang = this.currentLang;
    
    this.salaryAddOnsService.updateSalaryAddOn(formData, lang).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Add-on/Deduction updated successfully'
        });
        this.closeModal();
        this.loadAddons();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update add-on/deduction'
        });
        this.loading = false;
      }
    });
  }

  loadAddons() {
    this.loading = true;
    const lang = this.currentLang ;
    
    this.salaryAddOnsService.getAllSalaryAddOns(lang, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.addons = response.data || [];
        this.totalRecords = response.totalCount;
        
        // Apply local search filter if search term exists
        if (this.searchTerm && this.searchTerm.trim() !== '') {
          this.addons = this.addons.filter(addon => 
            addon.ar.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            addon.en.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            (addon.note && addon.note.toLowerCase().includes(this.searchTerm.toLowerCase()))
          );
        }
        
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load add-ons/deductions'
        });
        this.loading = false;
      }
    });
  }

  deleteAddon(addon: Addon) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this add-on/deduction?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (addon.addonId) {
          const lang = this.currentLang ;
          this.salaryAddOnsService.deleteSalaryAddOn(addon.addonId, lang).subscribe({
            next: (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Add-on/Deduction deleted successfully'
              });
              this.loadAddons();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete add-on/deduction'
              });
            }
          });
        }
      }
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.addonForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.addonForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
    }
    return '';
  }
}
