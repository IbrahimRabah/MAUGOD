import { Component, numberAttribute, OnInit } from '@angular/core';

import { LanguageService } from '../../../../core/services/language.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { AttendanceService } from '../../services/attendance.service';
import { PaginationPunchTransactionsRequest } from '../../../../core/models/pagination';
import {  PunchTransaction, PunchTransactionsResponse } from '../../../../core/models/attendance';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-punch-in-transactions',
  templateUrl: './punch-in-transactions.component.html',
  styleUrl: './punch-in-transactions.component.css',
  providers: [MessageService, ConfirmationService]

})
export class PunchInTransactionsComponent implements OnInit {
  punchTransactions: PunchTransaction[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  deletingPunchTransactionId: number | null = null;
  hijriDates: { [key: string]: string } = {};


  startDate: string | null=null;
  endDate: string | null=null;

  // getHijriDate(date?: Date) {
  //   if (!date) return '';
  //   return moment(date).format('iYYYY-iMM-iDD');
  // }
searchColumns = [
  { column: '', label: 'All Columns' }, // all columns option
  { column: 'emp_name', label: 'Attendance.RESULTS_TABLE.EMPLOYEE_HEADER' },
  { column: 'sign_date', label: 'Attendance.RESULTS_TABLE.DATE_SIGN' },
  { column: 'rec_date', label: 'Attendance.RESULTS_TABLE.RECORD_DATE' },
  { column: 'data_source_label', label: 'Attendance.RESULTS_TABLE.DATA_SOURCE' }
];

selectedColumn: string = '';
selectedColumnLabel: string = this.searchColumns[0].label;

  paginationRequest: PaginationPunchTransactionsRequest = {
    pageNumber: 1,
    pageSize: 10,
    empId: this.getStoredEmpId(),
    startDate:this.startDate,
    endDate:this.endDate,
     searchColumn: this.selectedColumn, 
    searchText:this.searchTerm 
  };


  private currentLanguage: string = '';
  private isInitialized = false;




  constructor(
    private attendanceService: AttendanceService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {
    
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    this.startDate = formattedDate;
    this.endDate = formattedDate;

    this.hijriDates['startDate'] = this.toObservedHijri(this.startDate);
    this.hijriDates['endDate'] = this.toObservedHijri(this.endDate);

    // Initialize paginationRequest here
    this.paginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      empId: this.getStoredEmpId(),
      startDate: this.startDate,
      endDate: this.endDate
    };
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      // this.paginationRequest.lang = lang === 'ar' ? 2 : 1; 

      // Only reload branches if component is already initialized (not first time)
      if (this.isInitialized) {
        this.loadPunchTransactions(); // Reload employees when language changes

      }
      
    });
  }

  ngOnInit() {

    this.isInitialized = true;
    this.loadPunchTransactions();
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
 this.paginationRequest.startDate = this.startDate;
    this.paginationRequest.endDate = this.endDate;
    this.loadPunchTransactions();
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
    this.paginationRequest.startDate = this.startDate;
    this.paginationRequest.endDate = this.endDate;
    this.loadPunchTransactions();
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
      this.loadPunchTransactions();
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
    this.loadPunchTransactions();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.paginationRequest.searchColumn=this.selectedColumn;
    this.paginationRequest.searchText=this.searchTerm;
    this.loadPunchTransactions();
  }

  formatDateTime(dateStr: string | Date |null ): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
  }

  loadPunchTransactions() {
    this.loading = true;
    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    this.attendanceService.getPunchInTransactions(currentLang,this.paginationRequest).subscribe({
      next: (response: PunchTransactionsResponse) => {
         if (response.isSuccess) {
        this.punchTransactions = response.data.tenter;
        this.totalRecords = response.data.totalCount;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant("ERROR"),
          detail: currentLang === 2
            ? 'حدث خطأ أثناء تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
            : 'An error occurred while loading data, please try again or contact support'
        });
      }
        this.loading = false;
      },
      error: (error) => {
        let errorMsg = currentLang === 2
        ? 'فشل تحميل البيانات، يرجى المحاولة مرة أخرى أو التواصل مع الدعم'
        : 'Failed to load data, please try again or contact support';

      if (error.status === 404) {
        errorMsg = currentLang === 2
          ? 'لم يتم العثور على معاملات البصمة'
          : 'No punch transactions found';
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

  deletePunchTransaction(PunchTransaction: PunchTransaction) {
    this.selectedPunchTransactionIds.push(PunchTransaction.recId);
    this.confirmationService.confirm({
      message: this.translate.instant('VALIDATION.CONFIRM_DELETE'),
      header: this.translate.instant('CONFIRM_DELE'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant('OK'),
      rejectLabel:  this.translate.instant('CANCEL'),
      accept: () => {
        const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

        this.attendanceService.deletePunchInTransactionsSelected(this.selectedPunchTransactionIds, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.translate.instant("SUCCESS"),
              detail: this.langService.getCurrentLang() === 'ar'
                ? 'تم حذف العنصر بنجاح'
                : 'Item deleted successfully'
            });
            this.loadPunchTransactions();
            this.deletingPunchTransactionId = null;
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
            this.deletingPunchTransactionId = null;
          }
        });
      },
      reject: () => {
        // User cancelled - no action needed
      }
    });
  }


  selectedPunchTransactionIds: number[] = [];

  togglePunchTransactionSelection(recId: number, event: any) {
    if (event.target.checked) {
      this.selectedPunchTransactionIds.push(recId);
    } else {
      this.selectedPunchTransactionIds = this.selectedPunchTransactionIds.filter(id => id !== recId);
    }
  }

  deleteForSelected() {
    if (this.selectedPunchTransactionIds.length === 0) {
      alert(this.langService.getCurrentLang() === 'ar'
        ? 'الرجاء اختيار عنصر واحد على الأقل'
        : 'Please select at least one item');
      return;
    }

    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    if (confirm(this.langService.getCurrentLang() === 'ar'
      ? 'سيتم حذف العناصر قيد التحديد .. هل تريد المتابعة؟'
      : 'The selected items will be deleted. Do you want to continue?')) {
      this.attendanceService.deletePunchInTransactionsSelected(this.selectedPunchTransactionIds, currentLang).subscribe({
        next: () => {
          alert(this.langService.getCurrentLang() === 'ar'
            ? 'تم حذف العناصر المحددة بنجاح'
            : 'Selected items deleted successfully');
          this.loadPunchTransactions();

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
  
}
