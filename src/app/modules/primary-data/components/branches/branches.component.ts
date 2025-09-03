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
import { CustomValidators } from '../../../../shared/validators/custom-validators';
import { TranslateService } from '@ngx-translate/core';

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

  searchColumns = [
    { column: '', label: 'All Columns' }, // all columns option
    { column: 'branch_name', label: 'MENU.GENERAL_DATA.BRANCHES_TABLE.BRANCH_NAME' },
    { column: 'manager_name', label: 'MENU.GENERAL_DATA.BRANCHES_TABLE.MANAGER' },
    { column: 'parent_branch_name', label: 'MENU.GENERAL_DATA.BRANCHES_TABLE.PARENT_BRANCH' },
    { column: 'location_name', label: 'MENU.GENERAL_DATA.BRANCHES_TABLE.LOCATION' },
    { column: 'loc_desc', label: 'MENU.GENERAL_DATA.BRANCHES_TABLE.LOCATION_DESC' },
    { column: 'note', label: 'MENU.GENERAL_DATA.BRANCHES_TABLE.NOTES' }
  ];
  selectedColumn: string = '';
  selectedColumnLabel: string = this.searchColumns[0].label;

  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1,// Default to English, can be changed based on app's language settings
    searchColumn: this.selectedColumn,
    searchText: this.searchTerm
  };

  constructor(
    private branch: BranchService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private dropdownService: DropdownlistsService,
    private translate: TranslateService
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
  initialFormValues: any;

  initializeForms() {
    this.branchForm = this.fb.group({
      ar: ['', [Validators.required, CustomValidators.noEnglishInArabicValidator]],
      en: ['', [Validators.required]], // Made required
  // Manager and parentBranchId are optional now to allow creation/edit without selecting them
  mgrId: [''],
  parentBranchId: [''], // Optional - parent branch may be null
      locId: [''], // Optional
      locDesc: [''], // Optional
      note: [''] // Optional - Note is not required as per requirement
    });


    this.changeNumberForm = this.fb.group({
      newNumber: ['', [Validators.required, Validators.pattern(/^\d+$/)]] // Only allow numbers
    });


    this.initialFormValues = this.branchForm.value;
  }

  selectColumn(col: any) {
    this.selectedColumn = col.column;
    this.selectedColumnLabel = col.label;
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

    } catch (error) {
      console.error('Error in smart dropdown loading:', error);
      this.loadingDropdowns = false;
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant("WARNING"),
        detail: this.langService.getCurrentLang() === 'ar'
          ? 'فشل في تحميل بعض البيانات. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
          : 'Failed to load some data. Please try again or contact support.'
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

    // Get current form values
    const currentFormValue = this.branchForm.value;

    // Create a new form value object with all current values
    // use a flexible any-typed object to allow assigning both string and number values
    const newFormValue: any = {
      ar: currentFormValue.ar || branch.branchName || '',
      en: currentFormValue.en || branch.branchName || '', // You might want to get the English name from another field
      locDesc: currentFormValue.locDesc || branch.locDesc || '',
      note: currentFormValue.note || branch.note || '',
      mgrId: '',
      parentBranchId: '',
      locId: ''
    };

    // Update manager selection

    if (branch.mgrId !== null && branch.mgrId !== undefined && this.managers.length > 0) {
      // Ensure we match numeric values and set numeric form control value
      const manager = this.managers.find(m => Number(m.value) === Number(branch.mgrId));
      console.log('Looking for manager with ID:', branch.mgrId, 'Found:', manager);
      if (manager) {
        newFormValue.mgrId = manager.value; // keep numeric
        console.log('Setting mgrId to:', manager.value);
      } else {
        console.warn('Manager not found in dropdown options, leaving empty');
      }
    } else {
      console.log('Manager ID is null, undefined, or -1, leaving mgrId empty');
    }

    // Update location selection
    if (branch.locId !== null && branch.locId !== undefined && this.locations.length > 0) {
      const location = this.locations.find(l => Number(l.value) === Number(branch.locId));
      console.log('Looking for location with ID:', branch.locId, 'Found:', location);
      if (location) {
        newFormValue.locId = location.value; // keep numeric
        console.log('Setting locId to:', location.value);
      } else {
        console.warn('Location not found in dropdown options');
      }
    }

    // Update parent branch selection
    if (branch.parentBranchId !== null && branch.parentBranchId !== undefined && this.parentBranches.length > 0) {
      const parentBranch = this.parentBranches.find(pb => Number(pb.value) === Number(branch.parentBranchId));
      console.log('Looking for parent branch with ID:', branch.parentBranchId, 'Found:', parentBranch);
      if (parentBranch) {
        newFormValue.parentBranchId = parentBranch.value; // keep numeric
        console.log('Setting parentBranchId to:', parentBranch.value);
      } else {
        console.warn('Parent branch not found in dropdown options');
      }
    }

    console.log('New form value to set:', newFormValue);

  // Use patchValue to avoid errors when some controls are intentionally left blank
  this.branchForm.patchValue(newFormValue);

    // Force change detection
    this.branchForm.markAsDirty();
    this.branchForm.updateValueAndValidity();

    console.log('Form after setValue:', this.branchForm.value);


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
    this.paginationRequest.searchColumn = this.selectedColumn;
    this.paginationRequest.searchText = this.searchTerm;
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
    this.isEditMode = false;
    // this.loadingDropdowns=true
    this.resetForm();

  }

  resetForm() {
    this.branchForm.reset();
    this.branchForm.reset(this.initialFormValues);


  }

  submitBranch() {
    if (this.branchForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.branchForm.value;

      // Parse numeric fields - mgrId/parentBranchId/locId may be null
      const mgrId = formData.mgrId ? parseInt(formData.mgrId) : null;
      const parentBranchId = formData.parentBranchId ? parseInt(formData.parentBranchId) : null;
      const locId = formData.locId ? parseInt(formData.locId) : null; // Make location optional

      // Prepare branch object based on the API requirements
      const branchData: BranchCreateUpdateRequest = {
        ar: formData.ar,
        en: formData.en,
        mgrId: mgrId,
        locDesc: formData.locDesc || '', // Make optional
  parentBranchId: parentBranchId !== null && !isNaN(parentBranchId) ? parentBranchId : null,
        // Send null when no location selected to avoid sending 0
        locId: formData.locId ? parseInt(formData.locId) : null,
        note: formData.note || '' // Note is optional
      };

      if (this.isEditMode) {
        // Update existing branch
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.branch.updateBranch(this.selectedBranch!.branchId, branchData, currentLang).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant("SUCCESS"),
                detail: this.langService.getCurrentLang() === 'ar'
                  ? 'تم تحديث الفرع بنجاح'
                  : 'Branch updated successfully'
              });
              this.closeModal();
              this.loadBranches();
              this.isSubmitting = false;
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant("ERROR"),
                detail: this.langService.getCurrentLang() === 'ar'
                  ? 'فشل في تحديث الفرع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
                  : 'Failed to update branch. Please try again or contact support.'
              });
              this.isSubmitting = false;
            }

          },
          error: (error) => {
            console.error('Error updating branch:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'فشل في تحديث الفرع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
                : 'Failed to update branch. Please try again or contact support.'
            });
            this.isSubmitting = false;
          }
        });
      } else {
        // Add new branch
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.branch.addBranch(branchData, currentLang).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: this.translate.instant("SUCCESS"),
                detail: this.langService.getCurrentLang() === 'ar'
                  ? 'تم إضافة الفرع بنجاح'
                  : 'Branch added successfully'
              });
              this.closeModal();
              this.loadBranches();
              this.isSubmitting = false;
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.translate.instant("ERROR"),
                detail: this.langService.getCurrentLang() === 'ar'
                  ? 'فشل في إضافة الفرع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
                  : 'Failed to add branch. Please try again or contact support.'
              });
              this.isSubmitting = false;
            }

          },
          error: (error) => {
            console.error('Error adding branch:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'فشل في إضافة الفرع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
                : 'Failed to add branch. Please try again or contact support.'
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
            summary: this.translate.instant("ERROR"),
            detail: this.translate.instant("VALIDATION.BRANCHES_LOAD_FAILED")
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: this.translate.instant("VALIDATION.BRANCHES_LOAD_FAILED")
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

        this.selectedBranch = convertedBranch as Branch; // Update with complete data

        // Set basic form values immediately (non-dropdown fields)
        this.branchForm.patchValue({
          ar: branchDetails.ar || '',
          en: branchDetails.en || '',
          locDesc: branchDetails.locDesc || '',
          note: branchDetails.note || ''
        });


        // Since we already awaited dropdown loading, update form selections immediately
        this.updateFormDropdownSelections();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: this.translate.instant("VALIDATION.BRANCH_DETAILS_LOAD_FAILED")
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
  }
  deleteBranch(branch: Branch) {
    this.confirmationService.confirm({
      message: this.translate.instant('VALIDATION.CONFIRM_DELETE'),
      header: this.translate.instant("CONFIRM_DELE"),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant("OK"),
      rejectLabel: this.translate.instant("CANCEL"),
      accept: () => {
        this.deletingBranchId = branch.branchId;
        // Call API to delete the branch
        this.branch.deleteBranch(branch.branchId).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success',
                detail: this.langService.getCurrentLang() === 'ar'
                  ? 'تم حذف الفرع بنجاح'
                  : 'Branch deleted successfully'
              });
              this.loadBranches(); // Reload branches after delete
              this.deletingBranchId = null;
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error',
                detail: this.langService.getCurrentLang() === 'ar'
                  ? 'فشل في حذف الفرع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
                  : 'Failed to delete branch. Please try again or contact support.'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting branch:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error',
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'حدث خطأ أثناء حذف الفرع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
                : 'An error occurred while deleting the branch. Please try again or contact support.'
            });
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
          summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error',
          detail: this.translate.instant('VALIDATION.INVALID_NEW_BRANCH_NUMBER')
        });
        return;
      }

      const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

      this.branch.changeBranchId(this.selectedBranch.branchId, newBranchId, currentLang).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant("SUCCESS"),
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'تم تغيير رقم الفرع بنجاح'
                : 'Branch number changed successfully'
            });
            this.closeChangeNumberModal();
            this.loadBranches(); // Reload the branches list
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'فشل في تغيير رقم الفرع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
                : 'Failed to change branch number. Please try again or contact support.'
            });
          }
        },
        error: (error) => {
          console.error('Error changing branch ID:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant("ERROR"),
            detail: this.langService.getCurrentLang() === 'ar'
              ? 'فشل في تغيير رقم الفرع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
              : 'Failed to change branch number. Please try again or contact support.'
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
      const isArabic = this.langService.getCurrentLang() === 'ar';
      return CustomValidators.getErrorMessage(field.errors, fieldName, isArabic);
    }
    return '';
  }

  // Getter methods for form validation
  get isBranchFormValid(): boolean {
    if (!this.branchForm) return false;
    const requiredFields = ['ar', 'en'];
    const allRequiredValid = requiredFields.every(f => {
      const ctrl = this.branchForm.get(f);
      return !!(ctrl && ctrl.valid);
    });
    return allRequiredValid && !this.isSubmitting;
  }

  get isChangeNumberFormValid(): boolean {
    return this.changeNumberForm.valid;
  }
}
