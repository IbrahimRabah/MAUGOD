import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Branch, BranchResponse, BranchCreateUpdateRequest } from '../../../../core/models/branch';
import { PaginationRequest } from '../../../../core/models/pagination';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LanguageService } from '../../../../core/services/language.service';
import { BranchService } from '../../services/branch.service';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { Manager } from '../../../../core/models/managers';
import { Location } from '../../../../core/models/location';
import { ParentBranch } from '../../../../core/models/parentBranches';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-branches',
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css',
  providers: [MessageService, ConfirmationService]
})
export class BranchesComponent implements OnInit {
  branches: Branch[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  showAddModal: boolean = false;
  showChangeNumberModal: boolean = false;
  selectedBranch: Branch | null = null;
  isEditMode: boolean = false;
  isSubmitting: boolean = false;
  deletingBranchId: number | null = null;
  loadingDropdowns: boolean = false;
  
  // Reactive Forms
  branchForm!: FormGroup;
  changeNumberForm!: FormGroup;

  // Dropdown data from API
  managers: Manager[] = [];
  parentBranches: ParentBranch[] = [];
  locations: Location[] = [];

  // Smart loading state tracking
  private dropdownDataLoaded = {
    managers: false,
    locations: false,
    parentBranches: false
  };
  private currentLanguage: string = '';
  private isInitialized = false; // Prevent double API calls on init

  // Available numbers for dropdown (dummy data)
  availableNumbers = [
    { value: '100', label: '100' },
    { value: '101', label: '101' },
    { value: '102', label: '102' },
    { value: '103', label: '103' },
    { value: '104', label: '104' },
    { value: '105', label: '105' },
    { value: '200', label: '200' },
    { value: '201', label: '201' },
    { value: '202', label: '202' },
    { value: '203', label: '203' },
    { value: '300', label: '300' },
    { value: '301', label: '301' },
    { value: '302', label: '302' },
    { value: '400', label: '400' },
    { value: '401', label: '401' },
    { value: '500', label: '500' }
  ];

  
  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1 // Default to English, can be changed based on app's language settings
  };

  constructor(
    private branch: BranchService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private dropdownService: DropdownlistsService
  ) {
    this.initializeForms();
    
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1; 
      // Only reload branches if component is already initialized (not first time)
      if (this.isInitialized) {
        this.loadBranches(); // Reload branches when language changes
        this.resetDropdownState(); // Reset dropdown state when language changes
      }
    }) 
  }
  ngOnInit() {
    this.isInitialized = true;
    this.loadBranches(); // Load branches only once on init
    // Don't preload dropdown data on init - load only when needed
  }

  initializeForms() {
    this.branchForm = this.fb.group({
      ar: ['', [Validators.required]],
      en: ['', [Validators.required]],
      mgrId: ['', [Validators.required]],
      parentBranchId: ['', [Validators.required]],
      locId: ['', [Validators.required]],
      locDesc: ['', [Validators.required]],
      note: [''] // Note is not required as per requirement
    });

    this.changeNumberForm = this.fb.group({
      newNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]] // Only allow numbers
    });
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

  /**
   * Smart dropdown data loading - only loads what's needed
   * Caches data per language to avoid unnecessary API calls
   */
  private async loadDropdownDataIfNeeded(): Promise<void> {
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const langKey = this.langService.getCurrentLang();

    // Check if we already have data for this language
    if (this.currentLanguage === langKey && this.areAllDropdownsLoaded()) {
      console.log('Dropdown data already loaded for current language, skipping API calls');
      return Promise.resolve();
    }

    // Update current language
    this.currentLanguage = langKey;
    this.loadingDropdowns = true;

    console.log('Loading dropdown data for language:', langKey, 'API lang code:', currentLang);

    try {
      const loadPromises: Promise<any>[] = [];

      // Only load managers if not already loaded for this language
      if (!this.dropdownDataLoaded.managers || this.managers.length === 0) {
        console.log('Loading managers...');
        const managerPromise = this.dropdownService.getManagersDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.managers = response.data.managers || [];
              this.dropdownDataLoaded.managers = true;
              console.log('Managers loaded:', this.managers.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading managers';
              console.error('Failed to load managers:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(managerPromise);
      }

      // Only load locations if not already loaded for this language
      if (!this.dropdownDataLoaded.locations || this.locations.length === 0) {
        console.log('Loading locations...');
        const locationPromise = this.dropdownService.getLocationsDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.locations = response.data.locations || [];
              this.dropdownDataLoaded.locations = true;
              console.log('Locations loaded:', this.locations.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading locations';
              console.error('Failed to load locations:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(locationPromise);
      }

      // Only load parent branches if not already loaded for this language
      if (!this.dropdownDataLoaded.parentBranches || this.parentBranches.length === 0) {
        console.log('Loading parent branches...');
        const parentBranchPromise = this.dropdownService.getParentBranchesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.parentBranches = response.data.parentBranches || [];
              this.dropdownDataLoaded.parentBranches = true;
              console.log('Parent branches loaded:', this.parentBranches.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading parent branches';
              console.error('Failed to load parent branches:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(parentBranchPromise);
      }

      // If no API calls needed, resolve immediately
      if (loadPromises.length === 0) {
        console.log('All dropdown data already available');
        this.loadingDropdowns = false;
        return;
      }

      // Wait for all needed API calls to complete
      await Promise.all(loadPromises);
      this.loadingDropdowns = false;
      console.log('Smart dropdown loading completed');

    } catch (error) {
      console.error('Error in smart dropdown loading:', error);
      this.loadingDropdowns = false;
      this.messageService.add({
        severity: 'warn',
        summary: 'تحذير',
        detail: 'فشل في تحميل بعض البيانات'
      });
    }
  }

  /**
   * Legacy method for backward compatibility - now uses smart loading
   */
  loadDropdownData() {
    return this.loadDropdownDataIfNeeded();
  }

  /**
   * Check if all dropdown data is loaded
   */
  private areAllDropdownsLoaded(): boolean {
    return this.dropdownDataLoaded.managers && 
           this.dropdownDataLoaded.locations && 
           this.dropdownDataLoaded.parentBranches &&
           this.managers.length > 0 &&
           this.locations.length > 0 &&
           this.parentBranches.length > 0;
  }

  /**
   * Reset dropdown loaded state when language changes
   */
  private resetDropdownState(): void {
    this.dropdownDataLoaded = {
      managers: false,
      locations: false,
      parentBranches: false
    };
    this.managers = [];
    this.locations = [];
    this.parentBranches = [];
    this.currentLanguage = '';
  }

  /**
   * Update form dropdown selections after dropdown data is loaded
   * This ensures proper binding when editing a branch
   */
  private updateFormDropdownSelections() {
    if (!this.selectedBranch) {
      console.warn('No selected branch for form update');
      return;
    }

    // Check if dropdown data is available
    if (this.managers.length === 0 || this.locations.length === 0 || this.parentBranches.length === 0) {
      console.warn('Dropdown data not yet loaded, skipping form update');
      return;
    }

    const branch = this.selectedBranch;
    console.log('=== Updating form selections for branch ===');
    console.log('Branch data:', branch);
    console.log('Available managers:', this.managers);
    console.log('Available locations:', this.locations);
    console.log('Available parent branches:', this.parentBranches);
    console.log('Current form value:', this.branchForm.value);
    
    // Get current form values
    const currentFormValue = this.branchForm.value;
    
    // Create a new form value object with all current values
    const newFormValue = {
      ar: currentFormValue.ar || branch.branchName || '',
      en: currentFormValue.en || branch.branchName || '', // You might want to get the English name from another field
      locDesc: currentFormValue.locDesc || branch.locDesc || '',
      note: currentFormValue.note || branch.note || '',
      mgrId: '',
      parentBranchId: '',
      locId: ''
    };
    
    // Update manager selection
    console.log('=== Manager Selection Debug ===');
    console.log('Processing manager ID:', branch.mgrId, 'Type:', typeof branch.mgrId);
    console.log('Available managers:', this.managers);
    console.log('Manager values:', this.managers.map(m => ({ value: m.value, type: typeof m.value, label: m.label })));
    
    if (branch.mgrId !== null && branch.mgrId !== undefined && this.managers.length > 0) {
      const manager = this.managers.find(m => m.value === branch.mgrId);
      console.log('Looking for manager with ID:', branch.mgrId, 'Found:', manager);
      if (manager) {
        newFormValue.mgrId = manager.value.toString();
        console.log('Setting mgrId to:', manager.value.toString());
      } else {
        console.warn('Manager not found in dropdown options');
        // Try to find by converting to string
        const managerStr = this.managers.find(m => m.value.toString() === branch.mgrId!.toString());
        console.log('Trying string conversion for manager ID:', branch.mgrId!.toString(), 'Found:', managerStr);
        if (managerStr) {
          newFormValue.mgrId = managerStr.value.toString();
          console.log('Found manager by string conversion:', managerStr.value.toString());
        } else {
          console.error('Manager still not found even with string conversion!');
          console.log('Available manager values as strings:', this.managers.map(m => m.value.toString()));
        }
      }
    } else {
      console.log('Manager ID is null, undefined, or -1, leaving mgrId empty');
    }
    
    // Update location selection
    if (branch.locId !== null && branch.locId !== undefined && this.locations.length > 0) {
      const location = this.locations.find(l => l.value === branch.locId);
      console.log('Looking for location with ID:', branch.locId, 'Found:', location);
      if (location) {
        newFormValue.locId = location.value.toString();
        console.log('Setting locId to:', location.value.toString());
      } else {
        console.warn('Location not found in dropdown options');
        // Try to find by converting to string
        const locationStr = this.locations.find(l => l.value.toString() === branch.locId!.toString());
        if (locationStr) {
          newFormValue.locId = locationStr.value.toString();
          console.log('Found location by string conversion:', locationStr.value.toString());
        }
      }
    }
    
    // Update parent branch selection
    if (branch.parentBranchId !== null && branch.parentBranchId !== undefined && this.parentBranches.length > 0) {
      const parentBranch = this.parentBranches.find(pb => pb.value === branch.parentBranchId);
      console.log('Looking for parent branch with ID:', branch.parentBranchId, 'Found:', parentBranch);
      if (parentBranch) {
        newFormValue.parentBranchId = parentBranch.value.toString();
        console.log('Setting parentBranchId to:', parentBranch.value.toString());
      } else {
        console.warn('Parent branch not found in dropdown options');
        // Try to find by converting to string
        const parentBranchStr = this.parentBranches.find(pb => pb.value.toString() === branch.parentBranchId!.toString());
        if (parentBranchStr) {
          newFormValue.parentBranchId = parentBranchStr.value.toString();
          console.log('Found parent branch by string conversion:', parentBranchStr.value.toString());
        }
      }
    }
    
    console.log('New form value to set:', newFormValue);
    
    // Use setValue to force all values instead of patchValue
    this.branchForm.setValue(newFormValue);
    
    // Force change detection
    this.branchForm.markAsDirty();
    this.branchForm.updateValueAndValidity();
    
    console.log('Form after setValue:', this.branchForm.value);
    
    // Log individual form control values
    console.log('Individual form controls:');
    console.log('mgrId control value:', this.branchForm.get('mgrId')?.value);
    console.log('locId control value:', this.branchForm.get('locId')?.value);
    console.log('parentBranchId control value:', this.branchForm.get('parentBranchId')?.value);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadBranches();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }
  onPageSizeChange() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadBranches();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadBranches();
  }
  addBranch() {
    this.isEditMode = false;
    this.showAddModal = true;
    // Load dropdown data only if needed
    this.loadDropdownDataIfNeeded();
  }

  closeModal() {
    this.showAddModal = false;
    this.isSubmitting = false;
    this.resetForm();
  }

  resetForm() {
    this.branchForm.reset();
  }

  submitBranch() {
    if (this.branchForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.branchForm.value;
      
      // Validate numeric fields
      const mgrId = parseInt(formData.mgrId);
      const parentBranchId = parseInt(formData.parentBranchId);
      const locId = parseInt(formData.locId);
      
      if (isNaN(mgrId) || isNaN(parentBranchId) || isNaN(locId)) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: 'يرجى التأكد من صحة البيانات المدخلة' 
        });
        this.isSubmitting = false;
        return;
      }
      
      // Prepare branch object based on the API requirements
      const branchData: BranchCreateUpdateRequest = {
        ar: formData.ar,
        en: formData.en,
        mgrId: mgrId,
        locDesc: formData.locDesc,
        parentBranchId: parentBranchId,
        locId: locId,
        note: formData.note || '' // Note is optional
      };

      if (this.isEditMode) {
        // Update existing branch
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.branch.updateBranch(this.selectedBranch!.branchId, branchData, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم تحديث الفرع بنجاح' 
            });
            this.closeModal();
            this.loadBranches();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating branch:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في تحديث الفرع. يرجى المحاولة مرة أخرى.' 
            });
            this.isSubmitting = false;
          }
        });
      } else {
        // Add new branch
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.branch.addBranch(branchData, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم إضافة الفرع بنجاح' 
            });
            this.closeModal();
            this.loadBranches();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error adding branch:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في إضافة الفرع. يرجى المحاولة مرة أخرى.' 
            });
            this.isSubmitting = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.branchForm.markAllAsTouched();
    }
  }

  loadBranches() {
    this.loading = true;
    this.branch.getBranches(this.paginationRequest).subscribe({
      next: (response: BranchResponse) => {
        if (response.isSuccess) {
          this.branches = response.data.branches;
          this.totalRecords = response.data.totalCount;
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'خطأ', 
            detail: response.message || 'فشل في تحميل الفروع' 
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: 'فشل في تحميل الفروع. يرجى المحاولة مرة أخرى.' 
        });
        this.loading = false;
      }
    });
  }

  async editBranch(branch: Branch) {
    console.log('=== Edit Branch Called ===');
    console.log('Branch to edit:', branch);
    
    this.isEditMode = true;
    this.selectedBranch = branch;
    
    // Reset form first
    this.branchForm.reset();
    
    // Show modal first
    this.showAddModal = true;
    
    // Load dropdown data only if needed
    await this.loadDropdownDataIfNeeded();
    
    // Get complete branch details from API
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    this.branch.getBranchById(branch.branchId, currentLang).subscribe({
      next: (branchDetails: any) => {
        console.log('Branch details from API:', branchDetails);
        
        // The API returns: {branchId, ar, en, mgrId, locDesc, parentBranchId, locId, note}
        // Convert to our component structure (handle mgrId = -1 as null)
        const convertedBranch = {
          branchId: branchDetails.branchId,
          branchName: branchDetails.ar, // Using Arabic name as primary
          mgrId: branchDetails.mgrId === -1 ? null : branchDetails.mgrId,
          managerName: '', // Will be filled by dropdown data
          parentBranchId: branchDetails.parentBranchId,
          parentBranchName: '', // Will be filled by dropdown data
          locId: branchDetails.locId,
          locationName: '', // Will be filled by dropdown data
          locDesc: branchDetails.locDesc,
          note: branchDetails.note,
          updatePk: '', // Not needed for edit
          del: '' // Not needed for edit
        };
        
        console.log('Converted branch data:', convertedBranch);
        this.selectedBranch = convertedBranch as Branch; // Update with complete data
        
        // Set basic form values immediately (non-dropdown fields)
        this.branchForm.patchValue({
          ar: branchDetails.ar || '',
          en: branchDetails.en || '',
          locDesc: branchDetails.locDesc || '',
          note: branchDetails.note || ''
        });
        
        console.log('Form after basic patch with API data:', this.branchForm.value);
        
        // Since we already awaited dropdown loading, update form selections immediately
        this.updateFormDropdownSelections();
      },
      error: (error) => {
        console.error('Error loading branch details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل في تحميل تفاصيل الفرع'
        });
        
        // Fallback to using the branch data from the list
        this.branchForm.patchValue({
          ar: branch.branchName || '',
          en: branch.branchName || '',
          locDesc: branch.locDesc || '',
          note: branch.note || ''
        });
      }
    });
  }  deleteBranch(branch: Branch) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الفرع "${branch.branchName}"؟\nلا يمكن التراجع عن هذا الإجراء.`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.deletingBranchId = branch.branchId;
        // Call API to delete the branch
        this.branch.deleteBranch(branch.branchId).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم حذف الفرع بنجاح' 
            });
            this.loadBranches();
            this.deletingBranchId = null;
          },
          error: (error) => {
            console.error('Error deleting branch:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في حذف الفرع. يرجى المحاولة مرة أخرى.' 
            });
            this.deletingBranchId = null;
          }
        });
      },
      reject: () => {
        // User cancelled - no action needed
      }
    });
  }
  changeBranchNumber(branch: Branch) {
    this.selectedBranch = branch;
    this.showChangeNumberModal = true;
  }

  closeChangeNumberModal() {
    this.showChangeNumberModal = false;
    this.selectedBranch = null;
    this.resetChangeNumberForm();
  }

  resetChangeNumberForm() {
    this.changeNumberForm.reset();
  }

  getOldBranchNumber(branch: Branch | null): string {
    if (!branch) return '';
    // Extract number from branch name - assumes format like "المركز الرئيسي (0)"
    const match = branch.branchName.match(/\((\d+)\)/);
    return match ? match[1] : '0';
  }

  submitChangeNumber() {
    if (this.changeNumberForm.valid && this.selectedBranch) {
      const newBranchId = parseInt(this.changeNumberForm.value.newNumber);
      
      if (isNaN(newBranchId)) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: 'يرجى إدخال رقم صحيح للفرع الجديد' 
        });
        return;
      }

      const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
      
      console.log('Change Number Request:', {
        oldBranchId: this.selectedBranch.branchId,
        newBranchId: newBranchId,
        lang: currentLang
      });
      
      this.branch.changeBranchId(this.selectedBranch.branchId, newBranchId, currentLang).subscribe({
        next: (response) => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'نجح', 
            detail: 'تم تغيير رقم الفرع بنجاح' 
          });
          this.closeChangeNumberModal();
          this.loadBranches(); // Reload the branches list
        },
        error: (error) => {
          console.error('Error changing branch ID:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'خطأ', 
            detail: 'فشل في تغيير رقم الفرع. يرجى المحاولة مرة أخرى.' 
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.changeNumberForm.markAllAsTouched();
    }
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.branchForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.branchForm): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (field.errors['pattern']) {
        return 'يرجى إدخال رقم صحيح';
      }
    }
    return '';
  }

  // Getter methods for form validation
  get isBranchFormValid(): boolean {
    return this.branchForm.valid && !this.isSubmitting;
  }

  get isChangeNumberFormValid(): boolean {
    return this.changeNumberForm.valid;
  }
}
