import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Shift, ShiftsResponse, CreatShift, DaysShifts, ShiftDetailsResponse, ShiftDetails } from '../../../../core/models/shifts';
import { ShiftsService } from '../../services/shifts.service';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';
import { TranslateService } from '@ngx-translate/core';

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
  searchTerm: string = '';
  daysShifts:DaysShifts[]=[]
  loadingDropdowns: boolean = false;

  showDetailsModal: boolean = false;
    loadingInfo: boolean = false;
    shiftDetails: ShiftDetails[] = [];


  
  private langSubscription: Subscription = new Subscription();
  private currentLang = 2; // Default to Arabic (2)
  
  // Reactive Forms
  searchForm!: FormGroup;

  // Create Shift Modal properties
  showCreateShiftModal = false;
  createShiftForm!: FormGroup;
  isSubmittingShift = false;
  isEditMode = false;
  currentEditingShift: Shift | null = null;
  
  
  

  searchColumns = [
  { column: '', label: 'All Columns' }, // Search in all columns
  { column: 'ShiftName', label: 'SHIFTS_TABLE.NAME' },
  { column: 'sun', label: 'SHIFTS_TABLE.SUNDAY' },
  { column: 'mon', label: 'SHIFTS_TABLE.MONDAY' },
  { column: 'tue', label: 'SHIFTS_TABLE.TUESDAY' },
  { column: 'wed', label: 'SHIFTS_TABLE.WEDNESDAY' },
  { column: 'thu', label: 'SHIFTS_TABLE.THURSDAY' },
  { column: 'fri', label: 'SHIFTS_TABLE.FRIDAY' },
  { column: 'sat', label: 'SHIFTS_TABLE.SATURDAY' },
  { column: 'IsActiveLabel', label: 'SHIFTS_TABLE.IS_ACTIVE' }
];
selectedColumn: string = '';
selectedColumnLabel: string = this.searchColumns[0].label;

  constructor(
    private shiftsService: ShiftsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private dropdownService: DropdownlistsService,
    private translate: TranslateService
        
    
  ) {
    this.currentLang = this.langService.getLangValue();
    this.initializeForms();
    this.initCreateShiftForm();
    
  }

  ngOnInit() {
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang === 'ar' ? 2 : 1
      this.loadShifts();
      this.resetDropdownState()
    });

  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForms() {
    this.searchForm = this.fb.group({
      pageSize: [10]
    });
  }

  
  private initCreateShiftForm() {
    this.createShiftForm = this.fb.group({
      ar: [''],  // Optional with default "string"
      en: [''],  // Optional with default "string"
      sun: [null],  // Optional with default 0
      mon: [null],  // Optional with default 0
      tue: [null],  // Optional with default 0
      wed: [null],  // Optional with default 0
      thu: [null],  // Optional with default 0
      fri: [null],  // Optional with default 0
      sat: [null],  // Optional with default 0
      isTwoParts: [false],
      // Part 1 - always present
      openShift1: [false],
      openShiftMinutes1: [null],
      twoDays1: [false],
      in1: ['', Validators.required],  // Required - the only required field
      earlyIn1: [null],
      inAllowMin1: [null],
      maxIn1: [null],
      makeupIn1: [null],
      earlyOut1: [null],
      out1: [''],  // Optional with default current time
      outAllowMin1: [null],
      maxOut1: [null],
      makeupOut1: [null],
      // Part 2 - conditional based on isTwoParts
      openShift2: [false],
      openShiftMinutes2: [null],
      twoDays2: [false],
      in2: [''],
      earlyIn2: [null],
      inAllowMin2: [null],
      maxIn2: [null],
      makeupIn2: [null],
      earlyOut2: [null],
      out2: [''],
      outAllowMin2: [null],
      maxOut2: [null],
      makeupOut2: [null],
      isActive: [true]
    });
  }

    selectColumn(col: any) {
  this.selectedColumn = col.column;
  this.selectedColumnLabel = col.label;
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

styleStringToObject(style?: string): { [key: string]: string } {
  if (!style) return {};

  // Remove `style="` and trailing `"`
  const clean = style.replace(/^style\s*=\s*"/, '').replace(/"$/, '');

  return clean.split(';').reduce((acc, rule) => {
    if (rule.trim()) {
      const [key, value] = rule.split(':');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
    }
    return acc;
  }, {} as { [key: string]: string });
}



  // Core business methods
  loadShifts() {
    this.loading = true;
    this.shiftsService.GetShiftsToShow(this.currentLang, this.currentPage, this.pageSize,this.selectedColumn,this.searchTerm).subscribe({
      next: (response: ShiftsResponse) => {
        if (response.isSuccess && response.data) {
          this.shifts = response.data;
          this.totalRecords = response.totalCount || this.shifts.length;
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


  // Delete functionality
  deleteShift(shift: Shift) {
    this.confirmationService.confirm({
      message: this.langService.getCurrentLang() === 'ar' ? 
        'هل أنت متأكد من حذف هذه الوردية؟' : 
        'Are you sure you want to delete this shift?',
      header: this.langService.getCurrentLang() === 'ar' ? 'تأكيد الحذف' : 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.shiftsService.deleteShift(this.currentLang, shift.shiftId).subscribe({
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
    console.log('Opening edit modal for shift:', shift);
    this.openEditShiftModal(shift);
  }

  viewShiftDetails(shiftId: number) {
    this.showDetailsModal = true;
    this.loadShiftDaysInformation(shiftId);
  }

    closeModal() {
    this.showDetailsModal = false;
  }

  // Create shift method
  createShift() {
    this.openCreateShiftModal();
  }

  // Create Shift Modal Methods
    openCreateShiftModal() {
    this.isEditMode = false;
    this.currentEditingShift = null;
    this.showCreateShiftModal = true;
    this.resetCreateShiftForm();
    this.loadDropdownDataIfNeeded();
  }

  openEditShiftModal(shift: Shift) {
    this.isEditMode = true;
    this.currentEditingShift = shift;
    this.showCreateShiftModal = true;
    this.populateFormForEdit(shift);
  }

  closeCreateShiftModal() {
    this.showCreateShiftModal = false;
    this.isEditMode = false;
    this.currentEditingShift = null;
  }

  private populateFormForEdit(shift: Shift) {
    // Parse the weekday values - they might be coming as sunId, monId, etc.
    const formData = {
      ar: shift.shiftNameAr,
      en: shift.shiftNameEn,
      sun: shift.sunId || shift.sun,
      mon: shift.monId || shift.mon,
      tue: shift.tueId || shift.tue,
      wed: shift.wedId || shift.wed,
      thu: shift.thuId || shift.thu,
      fri: shift.friId || shift.fri,
      sat: shift.satId || shift.sat,
      isTwoParts: false, // You might need to determine this from the data
      // Part 1 - These might need to be extracted from the shift data
      openShift1: false,
      openShiftMinutes1: null,
      twoDays1: false,
      in1: shift.startTime || '',
      earlyIn1: null,
      inAllowMin1: null,
      maxIn1: null,
      makeupIn1: null,
      earlyOut1: null,
      out1: shift.endTime || '',
      outAllowMin1: null,
      maxOut1: null,
      makeupOut1: null,
      // Part 2 - Set to defaults for now
      openShift2: false,
      openShiftMinutes2: null,
      twoDays2: false,
      in2: '',
      earlyIn2: null,
      inAllowMin2: null,
      maxIn2: null,
      makeupIn2: null,
      earlyOut2: null,
      out2: '',
      outAllowMin2: null,
      maxOut2: null,
      makeupOut2: null,
      isActive: shift.isActive === 1 || shift.isActive === '1' || shift.isActive === 'true'
    };

    console.log('🔧 Populating form for edit:', {
      originalShift: shift,
      formData: formData
    });

    this.createShiftForm.patchValue(formData);
  }

  private resetCreateShiftForm() {
    this.createShiftForm.reset({
      isTwoParts: false,
      openShift1: false,
      twoDays1: false,
      openShift2: false,
      twoDays2: false,
      isActive: true
    });
  }

  get isCreateShiftFormValid(): boolean {
    return this.createShiftForm.valid;
  }

  onSubmitCreateShift() {
    if (this.createShiftForm.invalid) {
      this.showErrorMessage(
        this.langService.getCurrentLang() === 'ar' ? 
          'يرجى تعبئة جميع الحقول المطلوبة' : 
          'Please fill all required fields'
      );
      return;
    }

    this.isSubmittingShift = true;
    const lang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const formValues = this.createShiftForm.value;

    // Helper function to get default date string
    const getDefaultDateTime = () => new Date().toISOString();

    const payload: CreatShift = {
      shiftId: this.isEditMode ? (this.currentEditingShift?.shiftId || 0) : 0,
      ar: formValues.ar || "string",
      en: formValues.en || "string",
      openShift1: formValues.openShift1 ? 1 : 0,
      twoDays1: formValues.twoDays1 ? 1 : 0,
      perActualWork1: 0, // Default value
      earlyIn1: formValues.earlyIn1 || 0,
      in1: formValues.in1 || getDefaultDateTime(),
      inAllowMin1: formValues.inAllowMin1 || 0,
      maxIn1: formValues.maxIn1 || 0,
      makeupIn1: formValues.makeupIn1 || 0,
      earlyOut1: formValues.earlyOut1 || 0,
      out1: formValues.out1 || getDefaultDateTime(),
      outAllowMin1: formValues.outAllowMin1 || 0,
      maxOut1: formValues.maxOut1 || 0,
      makeupOut1: formValues.makeupOut1 || 0,
      openShift2: formValues.isTwoParts ? (formValues.openShift2 ? 1 : 0) : 0,
      twoDays2: formValues.isTwoParts ? (formValues.twoDays2 ? 1 : 0) : 0,
      perActualWork2: 0, // Default value
      earlyIn2: formValues.isTwoParts ? (formValues.earlyIn2 || 0) : 0,
      in2: formValues.isTwoParts ? (formValues.in2 || getDefaultDateTime()) : getDefaultDateTime(),
      inAllowMin2: formValues.isTwoParts ? (formValues.inAllowMin2 || 0) : 0,
      maxIn2: formValues.isTwoParts ? (formValues.maxIn2 || 0) : 0,
      makeupIn2: formValues.isTwoParts ? (formValues.makeupIn2 || 0) : 0,
      earlyOut2: formValues.isTwoParts ? (formValues.earlyOut2 || 0) : 0,
      out2: formValues.isTwoParts ? (formValues.out2 || getDefaultDateTime()) : getDefaultDateTime(),
      outAllowMin2: formValues.isTwoParts ? (formValues.outAllowMin2 || 0) : 0,
      maxOut2: formValues.isTwoParts ? (formValues.maxOut2 || 0) : 0,
      makeupOut2: formValues.isTwoParts ? (formValues.makeupOut2 || 0) : 0,
      sat: formValues.sat || 0,
      sun: formValues.sun || 0,
      mon: formValues.mon || 0,
      tue: formValues.tue || 0,
      wed: formValues.wed || 0,
      thu: formValues.thu || 0,
      fri: formValues.fri || 0,
      isActive: formValues.isActive !== undefined ? formValues.isActive : true
    };

    // Console log the payload before submission
    // console.log('📤 Submitting Shift Data:', {
    //   mode: this.isEditMode ? 'UPDATE' : 'CREATE',
    //   language: lang === 2 ? 'Arabic' : 'English',
    //   payload: payload,
    //   formValues: formValues
    // });

    const serviceCall = this.isEditMode 
      ? this.shiftsService.updateShift(lang, payload)
      : this.shiftsService.createShift(lang, payload);

    serviceCall.subscribe({
      next: (response) => {
        console.log('✅ Shift operation successful:', response);
        this.isSubmittingShift = false;
        this.showSuccessMessage(
          this.langService.getCurrentLang() === 'ar' ? 
            (this.isEditMode ? 'تم تحديث الوردية بنجاح' : 'تم إنشاء الوردية بنجاح') : 
            (this.isEditMode ? 'Shift updated successfully' : 'Shift created successfully')
        );
        this.closeCreateShiftModal();
        this.loadShifts(); // Reload the shifts list
      },
      error: (error) => {
        console.error('❌ Error in shift operation:', error);
        this.isSubmittingShift = false;
        this.showErrorMessage(
          this.langService.getCurrentLang() === 'ar' ? 
            (this.isEditMode ? 'حدث خطأ أثناء تحديث الوردية' : 'حدث خطأ أثناء إنشاء الوردية') : 
            (this.isEditMode ? 'Error occurred while updating shift' : 'Error occurred while creating shift')
        );
      }
    });
  }

  // Format display values
  getDisplayValue(value: string | null | undefined): string {
    return value != null && value !== '' ? value : '-';
  }

  getActiveStatus(isActive: string | number): string {
    if (this.langService.getCurrentLang() === 'ar') {
      return isActive === 1 || isActive === '1' || isActive === 'true' ? 'نشط' : 'غير نشط';
    } else {
      return isActive === 1 || isActive === '1' || isActive === 'true' ? 'Active' : 'Inactive';
    }
  }

   private dropdownDataLoaded = {
    daysShifts: false
  };
   private areAllDropdownsLoaded(): boolean {
    return this.dropdownDataLoaded.daysShifts &&
      this.daysShifts.length > 0 

  }
  private currentLanguage: string = '';

  private resetDropdownState(): void {
    this.dropdownDataLoaded = {
      daysShifts: false,
    };
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


    try {
      const loadPromises: Promise<any>[] = [];

      // Only load department if not already loaded for this language
      if (!this.dropdownDataLoaded.daysShifts || this.daysShifts.length === 0) {
        const locationPromise = this.dropdownService.getDaysShiftsDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.daysShifts = response.data.shifts || [];
              this.dropdownDataLoaded.daysShifts = true;
            } else {
              const errorMsg = response?.message || 'Unknown error loading departments';
              console.error('Failed to load departments:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(locationPromise);
      }

      // If no API calls needed, resolve immediately
      if (loadPromises.length === 0) {
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
          ? "فشل في تحميل بعض البيانات. يرجى المحاولة مرة أخرى أو التواصل مع الدعم"
          : "Failed to load some data. Please try again or contact support"
      });
    }
  }

  loadShiftDaysInformation(shiftId: number) {
      this.loadingInfo = true;
      const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
  
      this.shiftsService.getShiftDtailsShow(currentLang, shiftId,1).subscribe({
        next: (response: ShiftDetailsResponse) => {
          if (response.isSuccess) {
            this.shiftDetails = response.data;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: currentLang === 2
                ? 'حدث خطأ أثناء تحميل بيانات الورديات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
                : 'An error occurred while loading shift data, Please try again or contact support'
            });
          }
          this.loadingInfo = false;
        },
        error: (error) => {
          let errorMsg = currentLang === 2
            ? 'فشل تحميل بيانات الورديات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
            : 'Failed to load shift data, Please try again or contact support';
  
          if (error.status === 404) {
            errorMsg = currentLang === 2
              ? 'لم يتم العثور على بيانات الورديات'
              : 'No shift data found for this employee';
          } else if (error.status === 500) {
            errorMsg = currentLang === 2
              ? 'خطأ في الخادم، يرجى الاتصال بالدعم الفني'
              : 'Server error, please contact support';
          }
  
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant("ERROR"),
            detail: errorMsg
          });
  
          this.loadingInfo = false;
        }
      });
    }
}
