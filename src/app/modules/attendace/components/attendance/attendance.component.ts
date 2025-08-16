import { Component, OnInit } from '@angular/core';
import { Employees } from '../../../../core/models/employee';
import { PaginationAttendanceRequest } from '../../../../core/models/pagination';
import { LanguageService } from '../../../../core/services/language.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownlistsService } from '../../../../shared/services/dropdownlists.service';

import { AttendanceService } from '../../services/attendance.service';
import { Departments } from '../../../../core/models/department';
import { Attendance, AttendanceResponse } from '../../../../core/models/attendance';



@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
  providers: [MessageService, ConfirmationService]
  
})

export class AttendanceComponent implements OnInit{
  attendances: Attendance[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  deletingAttendanceId: number | null = null;
  loadingDropdowns: boolean = false;
  



  departments:Departments[] = [];
  
  employees :Employees []= [];


  selectedDepartment :string | null = null;
  selectedEmp :string | null = null;
  employeeName = null;


  startDate: string | null=null;
  endDate: string | null=null;

  // getHijriDate(date?: Date) {
  //   if (!date) return '';
  //   return moment(date).format('iYYYY-iMM-iDD');
  // }

  paginationRequest: PaginationAttendanceRequest = {
    pageNumber: 1,
    pageSize: 10,
    empId: this.getStoredEmpId(),
    empFilter: this.selectedEmp ,
    deptFilter: this.selectedDepartment ,
    startDate:this.startDate,
    endDate:this.endDate
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

  ) {
    
    const today = new Date();
    // Format date to YYYY-MM-DD for input type="date"
    const formattedDate = today.toISOString().split('T')[0];

    this.startDate = formattedDate;
    this.endDate = formattedDate;

      this.paginationRequest={
      pageNumber: 1,
      pageSize: 10,
      empId: this.getStoredEmpId(),
      empFilter: this.selectedEmp ,
      deptFilter: this.selectedDepartment ,
      startDate:this.startDate,
      endDate:this.endDate
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

 
  onFilterChange() {
    this.paginationRequest.deptFilter = this.selectedDepartment;
    this.paginationRequest.empFilter = this.selectedEmp;
    this.paginationRequest.startDate = this.startDate;
    this.paginationRequest.endDate = this.endDate;
    this.loadAttendances();
  }

  getStoredEmpId(): number  {
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
    this.attendanceService.getAttendances(currentLang,this.paginationRequest).subscribe({
      next: (response: AttendanceResponse) => {
        if (response.isSuccess) {
          this.attendances = response.data.attendance;
          this.totalRecords = response.data.totalCount;
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load attendances' });
        this.loading = false;
      }
    });
  }

  deleteAttendance(attendance: Attendance) {
    this.selectedAttendanceIds.push(attendance.timId);
    this.confirmationService.confirm({
      message: `سيتم حذف العنصر .. هل تريد المتابعة؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        // this.deletingAttendanceId = attendance.timId;
        // Call API to delete the branch
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

        this.attendanceService.deleteAttendSelected(this.selectedAttendanceIds, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم حذف العنصر بنجاح' 
            });
            this.loadAttendances();
            this.deletingAttendanceId = null;
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في حذف الفرع. يرجى المحاولة مرة أخرى.' 
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


  getLanguageDisplay(lang: string): string {
    return lang === '1' ? 'English' : 'العربية';
  }


  private async loadDropdownDataIfNeeded(): Promise<void> {
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    const langKey = this.langService.getCurrentLang();
    const empId=this.getStoredEmpId();

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
        const employeePromise = this.dropdownService.getEmpsDropdownList(currentLang,empId).toPromise()
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
        summary: 'تحذير',
        detail: 'فشل في تحميل بعض البيانات'
      });
    }
  }

  private areAllDropdownsLoaded(): boolean {
    return this.dropdownDataLoaded.employees && 
           this.dropdownDataLoaded.departments && 
           this.employees.length > 0 &&
           this.departments.length > 0 ;
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
      alert('الرجاء اختيار عنصر واحد على الأقل');
      return;
    }

    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    if (confirm('سيتم حذف العناصر قيد التحديد .. هل تريد المتابعة؟')) {
      this.attendanceService.deleteAttendSelected(this.selectedAttendanceIds, currentLang).subscribe({
        next: () => {
          alert('تم حذف العناصرالمحددين بنجاح');
          this.loadAttendances();

        },
        error: (err) => {
          console.error(err);
          alert('حدث خطأ أثناء حذف العناصر');
        }
      });
    }
  }
  

}
