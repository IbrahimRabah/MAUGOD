import { Component, numberAttribute, OnInit } from '@angular/core';

import { LanguageService } from '../../../../core/services/language.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { AttendanceService } from '../../services/attendance.service';
import { PaginationPunchTransactionsRequest } from '../../../../core/models/pagination';
import {  PunchTransaction, PunchTransactionsResponse } from '../../../../core/models/attendance';


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


  startDate: string | null=null;
  endDate: string | null=null;

  // getHijriDate(date?: Date) {
  //   if (!date) return '';
  //   return moment(date).format('iYYYY-iMM-iDD');
  // }

  paginationRequest: PaginationPunchTransactionsRequest = {
    pageNumber: 1,
    pageSize: 10,
    empId: this.getStoredEmpId(),
    startDate:this.startDate,
    endDate:this.endDate
  };


  private currentLanguage: string = '';
  private isInitialized = false;




  constructor(
    private attendanceService: AttendanceService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,

  ) {
    
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    this.startDate = formattedDate;
    this.endDate = formattedDate;

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

  deletePunchTransaction(PunchTransaction: PunchTransaction) {
    this.selectedPunchTransactionIds.push(PunchTransaction.recId);
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

        this.attendanceService.deletePunchInTransactionsSelected(this.selectedPunchTransactionIds, currentLang).subscribe({
          next: (response) => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'نجح', 
              detail: 'تم حذف العنصر بنجاح' 
            });
            this.loadPunchTransactions();
            this.deletingPunchTransactionId = null;
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'خطأ', 
              detail: 'فشل في حذف الفرع. يرجى المحاولة مرة أخرى.' 
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


  getLanguageDisplay(lang: string): string {
    return lang === '1' ? 'English' : 'العربية';
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
      alert('الرجاء اختيار عنصر واحد على الأقل');
      return;
    }

    const currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;

    if (confirm('سيتم حذف العناصر قيد التحديد .. هل تريد المتابعة؟')) {
      this.attendanceService.deletePunchInTransactionsSelected(this.selectedPunchTransactionIds, currentLang).subscribe({
        next: () => {
          alert('تم حذف العناصرالمحددين بنجاح');
          this.loadPunchTransactions();

        },
        error: (err) => {
          console.error(err);
          alert('حدث خطأ أثناء حذف العناصر');
        }
      });
    }
  }
  
}
