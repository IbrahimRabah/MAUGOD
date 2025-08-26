import { Component, OnInit } from '@angular/core';
import { Employees } from '../../../../core/models/employee';
import { PaginationAttendanceRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';

import { AttendanceService } from '../../services/attendance.service';
import { Departments } from '../../../../core/models/department';
import { Attendance, AttendanceResponse, ChangedTime, ChangedTimesIformation, DaysHandle, DaysHandleIformation, Fingerprint, FingerprintInformation, MobileSign, MobileSignInformation, Shift, ShiftInformation } from '../../../../core/models/attendance';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
  providers: [MessageService, ConfirmationService]

})

export class AttendanceComponent implements OnInit {
  attendances: Attendance[] = [];
  shifts: Shift[] = [];
  Fingerprints: Fingerprint[] = [];
  MobileSigns: MobileSign[] = [];
  DaysHandle: DaysHandle[] = [];
  ChangedTimes: ChangedTime[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  deletingAttendanceId: number | null = null;
  loadingDropdowns: boolean = false;
  showAddModal: boolean = false;
  loadingInfo: boolean = false;
  departments: Departments[] = [];
  employees: Employees[] = [];
  selectedDepartment: string | null = null;
  selectedEmp: string | null = null;
  employeeName = null;
  startDate: string | null = null;
  endDate: string | null = null;
  hijriDates: { [key: string]: string } = {};

  // getHijriDate(date?: Date) {
  //   if (!date) return '';
  //   return moment(date).format('iYYYY-iMM-iDD');
  // }

  searchColumns = [
    { column: '', label: 'All Columns' }, // all columns option
    { column: 'emp_name', label: 'Attendance.RESULTS_TABLE.EMPLOYEE_HEADER' },
    { column: 'dept_name', label: 'Attendance.RESULTS_TABLE.DEPARTMENT_HEADER' },
    { column: 'sign_date', label: 'Attendance.RESULTS_TABLE.DATE_SIGN' },
    { column: 'day_name', label: 'Attendance.RESULTS_TABLE.DAY_HEADER' },
    { column: 'shift_name', label: 'Attendance.RESULTS_TABLE.SHIFT_HEADER' },
    { column: 'sts_name', label: 'Attendance.RESULTS_TABLE.STATUS_HEADER' },
    { column: 'in1', label: 'Attendance.RESULTS_TABLE.IN_HEADER' },
    { column: 'late_in', label: 'Attendance.RESULTS_TABLE.LATE_IN_HEADER' },
    { column: 'out1', label: 'Attendance.RESULTS_TABLE.OUT_HEADER' },
    { column: 'early_out', label: 'Attendance.RESULTS_TABLE.EARLY_OUT_HEADER' }
  ];

  selectedColumn: string = '';
  selectedColumnLabel: string = this.searchColumns[0].label;

  paginationRequest: PaginationAttendanceRequest = {
    pageNumber: 1,
    pageSize: 10,
    empId: this.getStoredEmpId(),
    empFilter: this.selectedEmp,
    deptFilter: this.selectedDepartment,
    startDate: this.startDate,
    endDate: this.endDate,
    searchColumn: this.selectedColumn,
    searchText: this.searchTerm
  };

  // Smart loading state tracking
  private dropdownDataLoaded = {
    employees: false,
    departments: false,
  };

  private currentLanguage: string = '';
  private isInitialized = false;

  constructor(
    private attendanceService: AttendanceService,
    public langService: LanguageService,
    private messageService: MessageService,
    private dropdownService: DropdownlistsService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService

  ) {

    const today = new Date();
    // Format date to YYYY-MM-DD for input type="date"
    const formattedDate = today.toISOString().split('T')[0];

    this.startDate = formattedDate;
    this.endDate = formattedDate;

    this.hijriDates['startDate'] = this.toObservedHijri(this.startDate);
    this.hijriDates['endDate'] = this.toObservedHijri(this.endDate);

    this.paginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      empId: this.getStoredEmpId(),
      empFilter: this.selectedEmp,
      deptFilter: this.selectedDepartment,
      startDate: this.startDate,
      endDate: this.endDate
    };
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      // this.paginationRequest.lang = lang === 'ar' ? 2 : 1; 

      // Only reload branches if component is already initialized (not first time)
      if (this.isInitialized) {
        this.loadAttendances(); // Reload employees when language changes
        this.resetDropdownState();
        this.loadDropdownData()

      }

    });
  }

  ngOnInit() {

    this.isInitialized = true;
    this.loadDropdownData()

    this.loadAttendances();
  }


  selectColumn(col: any) {
    this.selectedColumn = col.column;
    this.selectedColumnLabel = col.label;
  }

  onDateChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value) {
      this.hijriDates[controlName] = this.toObservedHijri(value);
    } else {
      this.hijriDates[controlName] = '';
    }
    this.paginationRequest.deptFilter = this.selectedDepartment;
    this.paginationRequest.empFilter = this.selectedEmp;
    this.paginationRequest.startDate = this.startDate;
    this.paginationRequest.endDate = this.endDate;
    this.loadAttendances();
  }

  toObservedHijri(date: Date | string, adjustment: number = -1): string {
    // Ensure date is a Date object
    const d: Date = date instanceof Date ? new Date(date) : new Date(date);
    if (isNaN(d.getTime())) return ''; // handle invalid date

    // Apply adjustment in days
    d.setDate(d.getDate() + adjustment);

    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const parts = formatter.formatToParts(d);

    const year = parts.find(p => p.type === 'year')?.value ?? '0000';
    const month = parts.find(p => p.type === 'month')?.value ?? '00';
    const day = parts.find(p => p.type === 'day')?.value ?? '00';

    return `${year}/${month}/${day}`;
  }

  onFilterChange() {
    this.paginationRequest.deptFilter = this.selectedDepartment;
    this.paginationRequest.empFilter = this.selectedEmp;
    this.paginationRequest.startDate = this.startDate;
    this.paginationRequest.endDate = this.endDate;
    this.loadAttendances();
  }

  getStoredEmpId(): number {
    const empId = localStorage.getItem('empId');
    return Number(empId);
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
      this.loadAttendances();
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
    this.loadAttendances();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.paginationRequest.searchColumn = this.selectedColumn;
    this.paginationRequest.searchText = this.searchTerm;
    this.loadAttendances();
  }


  private formatDateForInput(dateString: string | Date | null): string | null {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    // Convert to YYYY-MM-DD format (required by HTML date input)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  loadAttendances() {
    this.loading = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    this.attendanceService.getAttendances(currentLang, this.paginationRequest).subscribe({
      next: (response: AttendanceResponse) => {
        if (response.isSuccess) {
          this.attendances = response.data.attendance;
          this.totalRecords = response.data.totalCount;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant("ERROR"),
            detail: this.langService.getCurrentLang() === 'ar'
              ? 'حدث خطأ أثناء تحميل بيانات الحضور، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
              : 'An error occurred while loading attendance data, Please try again or contact support'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        let errorMsg = this.langService.getCurrentLang() === 'ar'
          ? 'فشل تحميل بيانات الحضور، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
          : 'Failed to load attendance data, Please try again or contact support';

        if (error.status === 404) {
          errorMsg = this.langService.getCurrentLang() === 'ar'
            ? 'لم يتم العثور على بيانات الحضور'
            : 'No attendance data found';
        } else if (error.status === 500) {
          errorMsg = this.langService.getCurrentLang() === 'ar'
            ? 'خطأ في الخادم، يرجى الاتصال بالدعم الفني'
            : 'Server error, please contact support';
        }

        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: errorMsg
        });
        this.loading = false;
      }
    });
  }

  deleteAttendance(attendance: Attendance) {
    this.selectedAttendanceIds.push(attendance.timId);
    this.confirmationService.confirm({
      message: this.translate.instant('VALIDATION.CONFIRM_DELETE'),
      header: this.translate.instant('CONFIRM_DELE'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('OK'),
      rejectLabel: this.translate.instant('CANCEL'),
      accept: () => {
        // this.deletingAttendanceId = attendance.timId;
        // Call API to delete the branch
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

        this.attendanceService.deleteAttendSelected(this.selectedAttendanceIds, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant("SUCCESS"),
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'تم حذف العنصر بنجاح'
                : 'Item deleted successfully'
            });
            this.loadAttendances();
            this.deletingAttendanceId = null;
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            let errorMsg = this.langService.getCurrentLang() === 'ar'
              ? 'فشل في حذف العنصر، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
              : 'Failed to delete the item, Please try again or contact support';

            if (error.status === 404) {
              errorMsg = this.langService.getCurrentLang() === 'ar'
                ? 'العنصر غير موجود'
                : 'Item not found';
            } else if (error.status === 500) {
              errorMsg = this.langService.getCurrentLang() === 'ar'
                ? 'خطأ في الخادم، يرجى الاتصال بالدعم الفني'
                : 'Server error, please contact support';
            }

            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant("ERROR"),
              detail: errorMsg
            });
            this.deletingAttendanceId = null;
          }
        });
      },
      reject: () => {
        // User cancelled - no action needed
      }
    });
  }


  private async loadDropdownDataIfNeeded(): Promise<void> {
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const langKey = this.langService.getCurrentLang();
    const empId = this.getStoredEmpId();

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


      // Only load department if not already loaded for this language
      if (!this.dropdownDataLoaded.departments || this.departments.length === 0) {
        console.log('Loading departments...');
        const departmentPromise = this.dropdownService.getDepartmentsDropdownList(currentLang).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.departments = response.data.departments || [];
              this.dropdownDataLoaded.departments = true;
              console.log('Departments loaded:', this.departments.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading departments';
              console.error('Failed to load departments:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(departmentPromise);
      }

      // Only load Employee if not already loaded for this language
      if (!this.dropdownDataLoaded.employees || this.employees.length === 0) {
        console.log('Loading employees...');
        const employeePromise = this.dropdownService.getEmpsDropdownList(currentLang, empId).toPromise()
          .then(response => {
            if (response && response.isSuccess) {
              this.employees = response.data.employees || [];
              this.dropdownDataLoaded.employees = true;
              console.log('Employees loaded:', this.employees.length);
            } else {
              const errorMsg = response?.message || 'Unknown error loading employees';
              console.error('Failed to load employees:', errorMsg);
              throw new Error(errorMsg);
            }
          });
        loadPromises.push(employeePromise);
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
        summary: this.translate.instant("WARNING"),
        detail: this.langService.getCurrentLang() === 'ar'
          ? 'فشل في تحميل بعض البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
          : 'Failed to load some data, Please try again or contact support'
      });
    }
  }

  private areAllDropdownsLoaded(): boolean {
    return this.dropdownDataLoaded.employees &&
      this.dropdownDataLoaded.departments &&
      this.employees.length > 0 &&
      this.departments.length > 0;
  }

  private resetDropdownState(): void {
    this.dropdownDataLoaded = {
      employees: false,
      departments: false
    };
    this.employees = [];
    this.departments = [];
    this.currentLanguage = '';
  }

  async loadDropdownData() {
    await this.loadDropdownDataIfNeeded();
  }

  selectedAttendanceIds: number[] = [];

  toggleAttendanceSelection(attId: number, event: any) {
    if (event.target.checked) {
      this.selectedAttendanceIds.push(attId);
    } else {
      this.selectedAttendanceIds = this.selectedAttendanceIds.filter(id => id !== attId);
    }
  }

  deleteForSelected() {
    if (this.selectedAttendanceIds.length === 0) {
      alert(this.langService.getCurrentLang() === 'ar'
        ? 'الرجاء اختيار عنصر واحد على الأقل'
        : 'Please select at least one item');
      return;
    }

    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    if (confirm(this.langService.getCurrentLang() === 'ar'
      ? 'سيتم حذف العناصر قيد التحديد .. هل تريد المتابعة؟'
      : 'The selected items will be deleted. Do you want to continue?')) {
      this.attendanceService.deleteAttendSelected(this.selectedAttendanceIds, currentLang).subscribe({
        next: () => {
          alert(this.langService.getCurrentLang() === 'ar'
            ? 'تم حذف العناصر المحددة بنجاح'
            : 'Selected items deleted successfully');
          this.loadAttendances();

        },
        error: (err) => {
          console.error(err);
          alert(this.langService.getCurrentLang() === 'ar'
            ? 'حدث خطأ أثناء حذف العناصر، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
            : 'An error occurred while deleting items, Please try again or contact support');
        }
      });
    }
  }

  styleStringToObject(style?: string): { [key: string]: string } {
    if (!style) {
      return {};
    }

    return style.split(';').reduce((acc, rule) => {
      if (rule.trim()) {
        const [key, value] = rule.split(':');
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
      }
      return acc;
    }, {} as { [key: string]: string });
  }

  showInfo(timID: number) {
    this.showAddModal = true;
    this.loadShiftInformation(timID);
    this.loadFingerprintInformation(timID);
    this.loadMobileSign(timID);
    this.loadDaysHandleformation(timID);
    this.loadChangedTimesInfo(timID);
  }

  closeModal() {
    this.showAddModal = false;
  }

  loadShiftInformation(timID: number) {
    this.loadingInfo = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    this.attendanceService.getShiftInformation(currentLang, timID).subscribe({
      next: (response: ShiftInformation) => {
        if (response.isSuccess) {
          this.shifts = response.data;
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


  loadFingerprintInformation(timID: number) {
    this.loadingInfo = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    this.attendanceService.getFingerprints(currentLang, timID).subscribe({
      next: (response: FingerprintInformation) => {
        if (response.isSuccess) {
          this.Fingerprints = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant("ERROR"),
            detail: currentLang === 2
              ? 'حدث خطأ أثناء تحميل بيانات البصمة، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
              : 'An error occurred while loading fingerprint data, Please try again or contact support'
          });
        }
        this.loadingInfo = false;
      },
      error: (error) => {
        let errorMsg = currentLang === 2
          ? 'فشل تحميل بيانات البصمة، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
          : 'Failed to load fingerprint data, Please try again or contact support';

        if (error.status === 404) {
          errorMsg = currentLang === 2
            ? 'لم يتم العثور على بيانات البصمة'
            : 'No fingerprint data found for this employee';
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


  loadMobileSign(timID: number) {
    this.loadingInfo = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    this.attendanceService.getMobileSign(currentLang, timID).subscribe({
      next: (response: MobileSignInformation) => {
        if (response.isSuccess) {
          this.MobileSigns = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant("ERROR"),
            detail: currentLang === 2
              ? 'حدث خطأ أثناء تحميل بيانات التوقيعات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
              : 'An error occurred while loading mobile signs data, Please try again or contact support'
          });
        }
        this.loadingInfo = false;
      },
      error: (error) => {
        let errorMsg = currentLang === 2
          ? 'فشل تحميل بيانات التوقيعات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
          : 'Failed to load mobile signs data, Please try again or contact support';

        if (error.status === 404) {
          errorMsg = currentLang === 2
            ? 'لم يتم العثور على بيانات التوقيعات'
            : 'No mobile signs data found for this employee';
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


  loadDaysHandleformation(timID: number) {
    this.loadingInfo = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    this.attendanceService.getDaysHandle(currentLang, timID).subscribe({
      next: (response: DaysHandleIformation) => {
        if (response.isSuccess) {
          this.DaysHandle = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant("ERROR"),
            detail: currentLang === 2
              ? 'حدث خطأ أثناء تحميل بيانات الأيام، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
              : 'An error occurred while loading days data, Please try again or contact support'
          });
        }
        this.loadingInfo = false;
      },
      error: (error) => {
        let errorMsg = currentLang === 2
          ? 'فشل تحميل بيانات الأيام، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
          : 'Failed to load days data, Please try again or contact support';

        if (error.status === 404) {
          errorMsg = currentLang === 2
            ? 'لم يتم العثور على بيانات الأيام'
            : 'No days data found for this employee';
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


  loadChangedTimesInfo(timID: number) {
    this.loadingInfo = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    this.attendanceService.getChangedTimesInfo(currentLang, timID).subscribe({
      next: (response: ChangedTimesIformation) => {
        if (response.isSuccess) {
          this.ChangedTimes = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant("ERROR"),
            detail: currentLang === 2 ?
              'حدث خطأ أثناء تحميل بيانات الحضور ،يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
              : 'An error occurred while loading attendance data,Please try again or contact support'
          });
        }
        this.loadingInfo = false;
      },
      error: (error) => {
        let errorMsg = currentLang === 2
          ? 'فشل تحميل بيانات الحضور،يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
          : 'Failed to load attendance data, Please try again or contact support';

        if (error.status === 404) {
          errorMsg = currentLang === 2
            ? 'لم يتم العثور على بيانات الحضور '
            : 'No attendance data found for this employee';
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

        this.loading = false;
      }
    });
  }



}
