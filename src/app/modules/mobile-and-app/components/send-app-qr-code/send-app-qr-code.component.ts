import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { AppQRCodeService } from '../../services/app-qrcode.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AppEmployee } from '../../../../core/models/appQR';
import { Subscription } from 'rxjs';
import { PaginationRequest } from '../../../../core/models/pagination';

@Component({
  selector: 'app-send-app-qr-code',
  templateUrl: './send-app-qr-code.component.html',
  styleUrl: './send-app-qr-code.component.css',
  providers: [MessageService, ConfirmationService]
})
export class SendAppQrCodeComponent implements OnInit, OnDestroy {
  // Core component state
  employees: AppEmployee[] = [];
  loading = false;
  searchTerm: string = '';
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  public currentLang = 2; // Default to Arabic (2) - made public for template access

  private isInitialized = false; // Prevent double API calls on init

  searchColumns = [
    { column: '', label: 'All Columns' }, // all columns option
    { column: 'EMP_NAME', label: 'SEND_APP_QR_CODE.EMPLOYEE' },
    { column: 'DEPT_NAME', label: 'SEND_APP_QR_CODE.DEPARTMENT' },
    { column: 'BRANCH_NAME', label: 'SEND_APP_QR_CODE.BRANCH' },
    { column: 'DIRECT_MGR_NAME', label: 'SEND_APP_QR_CODE.DIRECT_MANAGER' },
    { column: 'NATIONALITY_NAME', label: 'SEND_APP_QR_CODE.NATIONALITY' },
    { column: 'GENDER_NAME', label: 'SEND_APP_QR_CODE.GENDER' },
    { column: 'email', label: 'SEND_APP_QR_CODE.EMAIL' },
    { column: 'JOBTYPE_NAME', label: 'SEND_APP_QR_CODE.JOB' }
  ];
  selectedColumn: string = '';
  selectedColumnLabel: string = this.searchColumns[0].label;

  selectColumn(col: any) {
    this.selectedColumn = col.column;
    this.paginationRequest.searchColumn = col.column;
    this.selectedColumnLabel = col.label;
  }

  paginationRequest: PaginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      lang: 1,// Default to English, can be changed based on app's language settings
      searchColumn: this.selectedColumn,
      searchText: this.searchTerm
    };
  
  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.paginationRequest.searchColumn = this.selectedColumn;
    this.paginationRequest.searchText = this.searchTerm;
    this.loadEmployees();
  }

  /**
   * Reset dropdown loaded state when language changes
   */


  // Selected items for bulk operations
  selectedItems: AppEmployee[] = [];
  selectAll = false;

  // Private subscriptions
  private langSubscription?: Subscription;
  private empId: number | null = null;

  constructor(
    private appQRCodeService: AppQRCodeService,
    private authService: AuthenticationService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {

    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1;

      // Only reload employees if component is already initialized (not first time)
      if (this.isInitialized) {
        this.loadEmployees(); // Reload employees when language changes
      }
    })
  }

  ngOnInit() {
    this.empId = this.authService.getEmpIdAsNumber();
    this.currentLang = this.langService.getLangValue();

    // Subscribe to language changes
    this.langSubscription = this.langService.currentLang$.subscribe(() => {
      this.currentLang = this.langService.getLangValue();
      this.loadEmployees();
    });
  }

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  // Pagination computed properties
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

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Core business methods
  loadEmployees() {
    if (!this.empId) {
      this.translate.get('ERROR').subscribe((errorText: string) => {
        this.messageService.add({
          severity: 'error',
          summary: errorText,
          detail: 'Employee ID not found'
        });
      });
      return;
    }

    this.loading = true;
    this.selectedItems = [];
    this.selectAll = false;

    this.appQRCodeService.getEmployeesForSendAppQRCode(
      this.paginationRequest,
      this.empId,
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.isSuccess && response.data) {
          this.employees = response.data.employees || [];
          // Note: API doesn't return totalRecords, so we'll estimate based on current page
          this.totalRecords = this.employees.length < this.pageSize ?
            ((this.currentPage - 1) * this.pageSize) + this.employees.length :
            this.currentPage * this.pageSize + 1;
        } else {
          this.employees = [];
          this.totalRecords = 0;
          this.translate.get('ERROR').subscribe((errorText: string) => {
            this.messageService.add({
              severity: 'error',
              summary: errorText,
              detail: response.message || 'Failed to load employees'
            });
          });
        }
      },
      error: (error) => {
        this.loading = false;
        this.employees = [];
        this.totalRecords = 0;
        console.error('Error loading employees:', error);
        this.translate.get('ERROR').subscribe((errorText: string) => {
          this.messageService.add({
            severity: 'error',
            summary: errorText,
            detail: 'Failed to load employees'
          });
        });
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadEmployees();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadEmployees();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadEmployees();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadEmployees();
  }

  // Selection methods
  onSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.selectedItems = [...this.employees];
    } else {
      this.selectedItems = [];
    }

    // Update the sel property for visual feedback
    this.employees.forEach(emp => emp.sel = this.selectAll);
  }

  onItemSelect(item: AppEmployee) {
    const index = this.selectedItems.findIndex(selected => selected.empId === item.empId);

    if (index > -1) {
      // Item is selected, remove it
      this.selectedItems.splice(index, 1);
      item.sel = false;
    } else {
      // Item is not selected, add it
      this.selectedItems.push(item);
      item.sel = true;
    }

    // Update selectAll state
    this.selectAll = this.selectedItems.length === this.employees.length;
  }

  // Check if item is selected
  isItemSelected(item: AppEmployee): boolean {
    return this.selectedItems.some(selected => selected.empId === item.empId);
  }

  // Send QR Code method
  sendQRCode() {
    if (this.selectedItems.length === 0) {
      this.translate.get(['WARNING', 'SEND_APP_QR_CODE.SELECT_EMPLOYEES_FIRST']).subscribe((translations) => {
        this.messageService.add({
          severity: 'warn',
          summary: translations['WARNING'],
          detail: translations['SEND_APP_QR_CODE.SELECT_EMPLOYEES_FIRST']
        });
      });
      return;
    }

    this.translate.get(['SEND_APP_QR_CODE.CONFIRM_SEND_QR', 'SEND_APP_QR_CODE.SEND_QR_TITLE']).subscribe((translations) => {
      this.confirmationService.confirm({
        message: translations['SEND_APP_QR_CODE.CONFIRM_SEND_QR'],
        header: translations['SEND_APP_QR_CODE.SEND_QR_TITLE'],
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.executeSendQRCode();
        }
      });
    });
  }

  private executeSendQRCode() {
    const empIds = this.selectedItems.map(emp => emp.empId);

    this.loading = true;
    this.appQRCodeService.sendAppQRCodeForEmployees(empIds, this.currentLang).subscribe({
      next: (response) => {
        this.loading = false;
        this.translate.get(['SUCCESS', 'SEND_APP_QR_CODE.QR_SENT_SUCCESS']).subscribe((translations) => {
          this.messageService.add({
            severity: 'success',
            summary: translations['SUCCESS'],
            detail: translations['SEND_APP_QR_CODE.QR_SENT_SUCCESS']
          });
        });

        // Clear selection after successful send
        this.selectedItems = [];
        this.selectAll = false;
        this.employees.forEach(emp => emp.sel = false);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error sending QR codes:', error);
        this.translate.get(['ERROR', 'SEND_APP_QR_CODE.QR_SENT_ERROR']).subscribe((translations) => {
          this.messageService.add({
            severity: 'error',
            summary: translations['ERROR'],
            detail: translations['SEND_APP_QR_CODE.QR_SENT_ERROR']
          });
        });
      }
    });
  }
}
