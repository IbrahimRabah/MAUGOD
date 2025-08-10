import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Department, DepartmentCreateUpdateRequest, DepartmentLevel, DepartmentResponse, ParentDepartment } from '../../../../core/models/department';
import { DepartmentService } from '../../services/department.service';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PaginationRequest } from '../../../../core/models/pagination';
import { Manager } from '../../../../core/models/managers';
import { Branch } from '../../../../core/models/branch';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { Location } from '../../../../core/models/location';


@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.css',
  providers: [MessageService, ConfirmationService]
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  showAddModal: boolean = false;
  showChangeNumberModal: boolean = false;
  selectedDepartment: Department | null = null;
  isEditMode: boolean = false;
  loadingDropdowns: boolean = false;
  deletingDeptId: number | null = null;
  isSubmitting: boolean = false;



  
  // Reactive Forms
  departmentForm!: FormGroup;
  changeNumberForm!: FormGroup;

  // Dropdown data from API
  managers: Manager[] = [];
  parentDepartments: ParentDepartment[] = [];
  branches: Branch[] = [];
  deptLevels:DepartmentLevel[]=[];
  locations: Location[]=[]

  // Smart loading state tracking
  private dropdownDataLoaded = {
    managers: false,
    locations: false,
    deptLevels: false,
    branches:false,
    parentDepartments:false
  };
  private currentLanguage: string = '';
  private isInitialized = false; // Prevent double API calls on init

  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1 // Default to English, can be changed based on app's language settings
  };

  constructor(
    private departmentService: DepartmentService,
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
        this.loadDepartments(); // Reload branches when language changes
        this.resetDropdownState(); // Reset dropdown state when language changes
      }
    }) 
  }

  ngOnInit() {
     this.isInitialized = true;
    this.loadDepartments();
  }

  initialFormValues: any;

  initializeForms() {
    this.departmentForm = this.fb.group({
      arabicName: [''],
      englishName: [''],
      managerId: [''],
      parentDepartmentId: [''],
      branchId: ['', [Validators.required]],
      deptLevel: ['', ],
      locationId: [''],
      locationDescription: [''],
      notes: ['']
    });

    this.changeNumberForm = this.fb.group({
      newNumber: ['', [Validators.required]],
    });
    
  this.initialFormValues = this.departmentForm.value;
  }

  isRequired(fieldName: string): boolean {
  const control = this.departmentForm.get(fieldName);
  if (!control || !control.validator) {
    return false;
  }
  const validator = control.validator({} as any);
  return validator && validator['required'] ? true : false;
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
      this.loadDepartments();
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
    this.loadDepartments();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadDepartments();
  }

  addDepartment() {
    this.isEditMode = false;
    this.showAddModal = true;
    this.loadDropdownDataIfNeeded();

  }

  closeModal() {
    this.showAddModal = false;
    this.isEditMode = false;
    this.resetForm();
  }

  resetForm() {
    this.departmentForm.reset();
    this.departmentForm.reset(this.initialFormValues);

  }

  submitDepartment() {
     if (this.departmentForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData = this.departmentForm.value;
      
      // Validate numeric fields
      const mgrId = parseInt(formData.managerId);
      const parentDeptId = parseInt(formData.parentDepartmentId);
      const locId = parseInt(formData.locationId);
      const branchId = parseInt(formData.branchId);
      const deptLevel = parseInt(formData.deptLevel);
      
      if (isNaN(mgrId) || isNaN(parentDeptId) || isNaN(locId)
      || isNaN(branchId) || isNaN(deptLevel)) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: 'يرجى التأكد من صحة البيانات المدخلة' 
        });
        this.isSubmitting = false;
        return;
      }
      
      // Prepare department object based on the API requirements
      const deptData: DepartmentCreateUpdateRequest = {
        ar: formData.arabicName,
        en: formData.englishName,
        mgrId: mgrId,
        parentDeptId: parentDeptId,
        branchId:branchId,
        deptLevel:deptLevel,
        locId: locId,
        locDesc: formData.locationDescription,
        note: formData.notes || '' // Note is optional
      };

      if (this.isEditMode) {
        // Update existing branch
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.departmentService.updateDepartment(this.selectedDepartment!.deptId, deptData, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم تحديث القسم بنجاح' 
            });
            this.closeModal();
            this.loadDepartments();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error updating department:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في تحديث القسم. يرجى المحاولة مرة أخرى.' 
            });
            this.isSubmitting = false;
          }
        });
      } else {
        // Add new branch
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
        this.departmentService.addDepartment(deptData, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم إضافة القسم بنجاح' 
            });
            this.closeModal();
            this.loadDepartments();
            this.isSubmitting = false;
          },
          error: (error) => {
            console.error('Error adding department:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في إضافة القسم. يرجى المحاولة مرة أخرى.' 
            });
            this.isSubmitting = false;
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.departmentForm.markAllAsTouched();
    }
  }

  loadDepartments() {
    this.loading = true;
    this.departmentService.getDepartments(this.paginationRequest).subscribe({
      next: (response: DepartmentResponse) => {
        if (response.isSuccess) {
          this.departments = response.data?.departments || [];
          this.totalRecords = response.data.totalCount; // Update this when API provides total count
        } else {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'خطأ', 
            detail: response.message || 'حدث خطأ في جلب البيانات' 
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: 'حدث خطأ في الاتصال بالخادم' 
        });
        this.loading = false;
      }
    });
  }

  async editDepartment(department: Department) {
    
    this.isEditMode = true;
    this.selectedDepartment = department;
    
    // Reset form first
    this.departmentForm.reset();
    
    // Show modal first
    this.showAddModal = true;
    
    // Load dropdown data only if needed
    await this.loadDropdownDataIfNeeded();
    
    // Get complete branch details from API
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    this.departmentService.getDepartmentById(department.deptId, currentLang).subscribe({
      next: (response: any) => {

        const deptDetails = response.data;
        console.log('Department details from API:', deptDetails);
        
        // The API returns: {branchId, ar, en, mgrId, locDesc, parentBranchId, locId, note}
        // Convert to our component structure (handle mgrId = -1 as null)
        const convertedDept = {
          deptId: deptDetails.deptId,
          deptName: currentLang==1 ? deptDetails.en :  deptDetails.ar, // Using Arabic name as primary
          mgrId: deptDetails.mgrId === -1 ? null : deptDetails.mgrId,
          mgrName: '', // Will be filled by dropdown data
          parentDeptId: deptDetails.parentDeptId,
          parentDeptName: '', // Will be filled by dropdown data
          locId: deptDetails.locId,
          locName: '', // Will be filled by dropdown data
          branchId:deptDetails.branchId,
          branchName:'',
          deptLevel:deptDetails.deptLevel,
          locDesc: deptDetails.locDesc,
          note: deptDetails.note,
          updatePk: '', // Not needed for edit
          del: '' // Not needed for edit
        };
        
        console.log('Converted dept data:', convertedDept);
        this.selectedDepartment = convertedDept as Department; // Update with complete data
        
        // Set basic form values immediately (non-dropdown fields)
        this.departmentForm.patchValue({
          arabicName: deptDetails.ar || '',
          englishName: deptDetails.en || '',
          locationDescription: deptDetails.locDesc || '',
          notes: deptDetails.note || ''
        });
        
        console.log('Form after basic patch with API data:', this.departmentForm.value);
        
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
        this.departmentForm.patchValue({
          arabicName: department.branchName || '',
          englishName: department.branchName || '',
          locationDescription: department.locDesc || '',
          notes: department.note || ''
        });
      }
    });
  }

  deleteDepartment(department: Department) {
     const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
     this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف القسم "${department.branchName}"؟\nلا يمكن التراجع عن هذا الإجراء.`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.deletingDeptId = department.deptId;
        // Call API to delete the branch
        this.departmentService.deleteDepartment(department.deptId,currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم حذف القسم بنجاح' 
            });
            this.loadDepartments();
            this.deletingDeptId = null;
          },
          error: (error) => {
            console.error('Error deleting branch:', error.message);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في حذف القسم. يرجى المحاولة مرة أخرى.' 
            });
            this.deletingDeptId = null;
          }
        });
      },
      reject: () => {
        // User cancelled - no action needed
      }
    });
  }

  changeDepartmentNumber(department: Department) {
    this.selectedDepartment = department;
    this.resetChangeNumberForm();
    this.showChangeNumberModal = true;
  }

  closeChangeNumberModal() {
    this.showChangeNumberModal = false;
    this.selectedDepartment = null;
    this.resetChangeNumberForm();
  }

  resetChangeNumberForm() {
    this.changeNumberForm.reset();
  }

  getOldDepartmentNumber(department: Department | null): string {
    return department ? department.deptId.toString() : '';
  }

  submitChangeNumber() {
    if (this.changeNumberForm.valid && this.selectedDepartment) {
      const newDeptId = parseInt(this.changeNumberForm.value.newNumber);
      
      if (isNaN(newDeptId)) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'خطأ', 
          detail: 'يرجى إدخال رقم صحيح القسم الجديد' 
        });
        return;
      }

      const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
      
      console.log('Change Number Request:', {
        oldDeptId: this.selectedDepartment.deptId,
        newDeptId: newDeptId,
        lang: currentLang
      });
      
      this.departmentService.changeDepartmentId(this.selectedDepartment.deptId, newDeptId, currentLang).subscribe({
        next: (response) => {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'نجح', 
            detail: 'تم تغيير رقم القسم بنجاح' 
          });
          this.closeChangeNumberModal();
          this.loadDepartments(); // Reload the branches list
        },
        error: (error) => {
          console.error('Error changing branch ID:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'خطأ', 
            detail: 'فشل في تغيير رقم القسم. يرجى المحاولة مرة أخرى.' 
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.changeNumberForm.markAllAsTouched();
    }
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.departmentForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.departmentForm): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
    }
    return '';
  }

  // Getter methods for form validation
  get isDepartmentFormValid(): boolean {
    return this.departmentForm.valid;
  }

  get isChangeNumberFormValid(): boolean {
    return this.changeNumberForm.valid;
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
           this.dropdownDataLoaded.deptLevels &&
           this.dropdownDataLoaded.branches &&
           this.dropdownDataLoaded.parentDepartments &&
           this.managers.length > 0 &&
           this.locations.length > 0 &&
           this.deptLevels.length > 0 &&
           this.branches.length > 0 &&
           this.parentDepartments.length > 0 ;
  }

  /**
   * Reset dropdown loaded state when language changes
   */
  private resetDropdownState(): void {
    this.dropdownDataLoaded = {
      managers: false,
      locations: false,
      deptLevels: false,
      branches:false,
      parentDepartments:false
    };
    this.managers = [];
    this.locations = [];
    this.deptLevels = [];
    this.branches = [];
    this.parentDepartments = [];
    this.currentLanguage = '';
  }

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

      // Only load parent departments if not already loaded for this language
      if (!this.dropdownDataLoaded.parentDepartments || this.parentDepartments.length === 0) {
        // console.log('Loading parent departments...');
        const parentDepartmentPromise = this.dropdownService.getParentDepartmentsDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.parentDepartments = response.data.parentDepartments || [];
              this.dropdownDataLoaded.parentDepartments = true;
              // console.log('Parent departments loaded:', this.parentDepartments.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading parent departments';
              console.error('Failed to load parent departments:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(parentDepartmentPromise);
      }

      // Only load branches if not already loaded for this language
      if (!this.dropdownDataLoaded.branches || this.branches.length === 0) {
        // console.log('Loading branches...');
        const branchesPromise = this.dropdownService.getBranchesDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.branches = response.data.parentBranches || [];
              this.dropdownDataLoaded.branches = true;
              // console.log('Branches loaded:', this.branches.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading branches';
              console.error('Failed to load branches:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(branchesPromise);
      }

      // Only load deptLevels if not already loaded for this language
      if (!this.dropdownDataLoaded.deptLevels || this.deptLevels.length === 0) {
        // console.log('Loading branches...');
        const deptLevelsPromise = this.dropdownService.getDepartmentLevelsDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.deptLevels = response.data.departmentLevels || [];
              this.dropdownDataLoaded.deptLevels = true;
              // console.log('Branches loaded:', this.branches.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading branches';
              console.error('Failed to load branches:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(deptLevelsPromise);
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

  private updateFormDropdownSelections() {
    if (!this.selectedDepartment) {
      console.warn('No selected department for form update');
      return;
    }

    // Check if dropdown data is available
    if (this.managers.length === 0 || this.locations.length === 0 || this.branches.length === 0
      || this.deptLevels.length === 0 || this.parentDepartments.length === 0
    ) {
      console.warn('Dropdown data not yet loaded, skipping form update');
      return;
    }

    const department = this.selectedDepartment;
    // console.log('=== Updating form selections for branch ===');
    // console.log('Branch data:', branch);
    // console.log('Available managers:', this.managers);
    // console.log('Available locations:', this.locations);
    // console.log('Available parent branches:', this.parentBranches);
    // console.log('Current form value:', this.branchForm.value);
    
    // Get current form values
    const currentFormValue = this.departmentForm.value;
    
    // Create a new form value object with all current values
    const newFormValue = {
      arabicName: currentFormValue.arabicName || department.branchName || '',
      englishName: currentFormValue.englishName || department.branchName || '', // You might want to get the English name from another field
      locationDescription: currentFormValue.locationDescription || department.locDesc || '',
      notes: currentFormValue.notes || department.note || '',
      managerId: '',
      parentDepartmentId: '',
      locationId: '',
      deptLevel:'',
      branchId:''
    };
    
    // Update manager selection
    // console.log('=== Manager Selection Debug ===');
    // console.log('Processing manager ID:', branch.mgrId, 'Type:', typeof branch.mgrId);
    // console.log('Available managers:', this.managers);
    // console.log('Manager values:', this.managers.map(m => ({ value: m.value, type: typeof m.value, label: m.label })));
    
    if (department.mgrId !== null && department.mgrId !== undefined && this.managers.length > 0) {
      const manager = this.managers.find(m => m.value === department.mgrId);
      // console.log('Looking for manager with ID:', department.mgrId, 'Found:', manager);
      if (manager) {
        newFormValue.managerId = manager.value.toString();
        // console.log('Setting mgrId to:', manager.value.toString());
      } else {
        console.warn('Manager not found in dropdown options');
        // Try to find by converting to string
        const managerStr = this.managers.find(m => m.value.toString() === department.mgrId!.toString());
        // console.log('Trying string conversion for manager ID:', department.mgrId!.toString(), 'Found:', managerStr);
        if (managerStr) {
          newFormValue.managerId = managerStr.value.toString();
          // console.log('Found manager by string conversion:', managerStr.value.toString());
        }
      }
    } else {
      console.log('Manager ID is null, undefined, or -1, leaving mgrId empty');
    }
    
    // Update location selection
    if (department.locId !== null && department.locId !== undefined && this.locations.length > 0) {
      const location = this.locations.find(l => l.value === department.locId);
      // console.log('Looking for location with ID:', department.locId, 'Found:', location);
      if (location) {
        newFormValue.locationId = location.value.toString();
        // console.log('Setting locId to:', location.value.toString());
      } else {
        console.warn('Location not found in dropdown options');
        // Try to find by converting to string
        const locationStr = this.locations.find(l => l.value.toString() === department.locId!.toString());
        if (locationStr) {
          newFormValue.locationId = locationStr.value.toString();
          // console.log('Found location by string conversion:', locationStr.value.toString());
        }
      }
    }
    
    // Update parent department selection
    if (department.parentDeptId !== null && department.parentDeptId !== undefined && this.parentDepartments.length > 0) {
      const parentDept = this.parentDepartments.find(pb => pb.value === department.parentDeptId);
      // console.log('Looking for parent branch with ID:', department.parentDeptId, 'Found:', parentBranch);
      if (parentDept) {
        newFormValue.parentDepartmentId = parentDept.value.toString();
        // console.log('Setting parentBranchId to:', parentDept.value.toString());
      } else {
        console.warn('Parent department not found in dropdown options');
        // Try to find by converting to string
        const parentDeptStr = this.parentDepartments.find(pb => pb.value.toString() === department.parentDeptId!.toString());
        if (parentDeptStr) {
          newFormValue.parentDepartmentId = parentDeptStr.value.toString();
          // console.log('Found parent branch by string conversion:', parentDeptStr.value.toString());
        }
      }
    }

    // Update branch department selection
    if (department.branchId !== null && department.branchId !== undefined && this.branches.length > 0) {
      const branch = this.branches.find(pb => pb.value === department.branchId);
      // console.log('Looking for parent branch with ID:', department.parentDeptId, 'Found:', parentBranch);
      if (branch) {
        newFormValue.branchId = branch.value.toString();
        // console.log('Setting parentBranchId to:', parentDept.value.toString());
      } else {
        console.warn('Branch not found in dropdown options');
        // Try to find by converting to string
        const branchStr = this.branches.find(pb => pb.value.toString() === department.branchId!.toString());
        if (branchStr) {
          newFormValue.branchId = branchStr.value.toString();
          // console.log('Found parent branch by string conversion:', parentDeptStr.value.toString());
        }
      }
    }

    // Update deptLevel department selection
    if (department.deptLevel !== null && department.deptLevel !== undefined && this.deptLevels.length > 0) {
      const deptLevel = this.deptLevels.find(pb => pb.value === department.deptLevel);
      // console.log('Looking for parent branch with ID:', department.parentDeptId, 'Found:', parentBranch);
      if (deptLevel) {
        newFormValue.deptLevel = deptLevel.value.toString();
        // console.log('Setting parentBranchId to:', parentDept.value.toString());
      } else {
        console.warn('Department Level not found in dropdown options');
        // Try to find by converting to string
        const deptLevelStr = this.deptLevels.find(pb => pb.value.toString() === department.deptLevel!.toString());
        if (deptLevelStr) {
          newFormValue.deptLevel = deptLevelStr.value.toString();
          // console.log('Found parent branch by string conversion:', parentDeptStr.value.toString());
        }
      }
    }
    
    console.log('New form value to set:', newFormValue);
    
    // Use setValue to force all values instead of patchValue
    this.departmentForm.setValue(newFormValue);
    
    // Force change detection
    this.departmentForm.markAsDirty();
    this.departmentForm.updateValueAndValidity();
    
    // console.log('Form after setValue:', this.branchForm.value);
    
    // Log individual form control values
  //   console.log('Individual form controls:');
  //   console.log('mgrId control value:', this.branchForm.get('mgrId')?.value);
  //   console.log('locId control value:', this.branchForm.get('locId')?.value);
  //   console.log('parentBranchId control value:', this.branchForm.get('parentBranchId')?.value);
   }
  
}
