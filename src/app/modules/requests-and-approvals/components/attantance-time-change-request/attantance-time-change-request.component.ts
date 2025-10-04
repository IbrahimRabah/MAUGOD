import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { AttendanceTimeService } from '../../services/attendance-time.service';
import { RequestRouteService } from '../../services/request-route.service';
import { TimeTransactionApprovalRequest, TimeTransactionApprovalRequestCreateDto, DepartmentAttendance } from '../../../../core/models/TimeTransactionApprovalData';
import { PaginationRequest } from '../../../../core/models/pagination';

@Component({
  selector: 'app-attantance-time-change-request',
  templateUrl: './attantance-time-change-request.component.html',
  styleUrl: './attantance-time-change-request.component.css',
  providers: [MessageService, ConfirmationService]
})
export class AttantanceTimeChangeRequestComponent implements OnInit, OnDestroy {
  
  // Core component state
  currentPageId: string = 'attendanceTimeChangeRequest';
  timeTransactionRequests: TimeTransactionApprovalRequest[] = [];
  searchTerm: string = '';
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Modal state
  showRequestDetailsModal = false;
  selectedRequestId = 0;
  
  // Attachments modal state
  showAttachmentsModal = false;
  selectedAttachmentRequestId = 0;
  
  // Create request modal state
  showCreateRequestModal = false;
  createRequestForm!: FormGroup;
  employees: any[] = [];
  loadingEmployees = false;
  selectedFile: File | null = null;
  selectedFileBase64: string = '';

  // Department attendance modal state
  showDepartmentAttendanceModal = false;
  departmentAttendances: DepartmentAttendance[] = [];
  loadingDepartmentAttendances = false;
  departmentAttendanceFilterForm!: FormGroup;
  departmentAttendanceSearchTerm = '';
  departmentAttendanceTotalRecords = 0;
  departmentAttendanceCurrentPage = 1;
  departmentAttendancePageSize = 10;
  
  private langSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic (2) - made public for template access
  
  
    private isInitialized = false; // Prevent double API calls on init

    searchColumns = [
      { column: '', label: 'All Columns' }, // all columns option
      { column: 'req_id', label: 'ATTENDANCE_TIME_CHANGE.REQUEST_ID' },
      { column: 'EMP_NAME', label: 'ATTENDANCE_TIME_CHANGE.EMPLOYEE' },
      { column: 'REQUEST_BY_EMP_NAME', label: 'ATTENDANCE_TIME_CHANGE.REQUESTED_BY' },
      { column: 'sign_date', label: 'ATTENDANCE_TIME_CHANGE.SIGN_DATE' },
      { column: 'in1', label: 'ATTENDANCE_TIME_CHANGE.IN_TIME' },
      { column: 'out1', label: 'ATTENDANCE_TIME_CHANGE.OUT_TIME' },
      { column: 'REQ_STS_NAME', label: 'ATTENDANCE_TIME_CHANGE.REQUEST_STATUS' },
      { column: 'note', label: 'ATTENDANCE_TIME_CHANGE.NOTE' }
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
      this.loadTimeTransactionRequests();
    }
  


  // Reactive Forms
  filterForm!: FormGroup;

  constructor(
    private attendanceTimeService: AttendanceTimeService,
    private requestRouteService: RequestRouteService,
    public langService: LanguageService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.initializeLanguage();

    
    // Set the language for the pagination request based on the current language setting
  this.langService.currentLang$.subscribe(lang => {
    this.paginationRequest.lang = lang === 'ar' ? 2 : 1;

    // Only reload timeTransactionRequests if component is already initialized (not first time)
    if (this.isInitialized) {
      this.loadTimeTransactionRequests(); // Reload timeTransactionRequests when language changes
      }
    })
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  // Initialize reactive forms
  private initializeForms() {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });

    this.createRequestForm = this.fb.group({
      empId: ['', Validators.required],
      signDate: ['', Validators.required],
      inTime: ['', Validators.required],
      outTime: ['', Validators.required],
      note: [''],
      attachment: [null],
      attachmentNote: ['']
    });

    this.departmentAttendanceFilterForm = this.fb.group({
      startDate: [''],
      endDate: ['']
    });
  }

  // Initialize language settings
  private initializeLanguage() {
    this.currentLang = this.langService.getLangValue();
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      this.loadTimeTransactionRequests();
      
      // Reload department attendances if modal is open
      if (this.showDepartmentAttendanceModal) {
        this.loadDepartmentAttendances();
      }
    });
  }

  // Pagination computed properties
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.paginationRequest.pageSize);
  }

  get currentPageStart(): number {
    return (this.currentPage - 1) * this.paginationRequest.pageSize + 1;
  }

  get currentPageEnd(): number {
    return Math.min(this.currentPage * this.paginationRequest.pageSize, this.totalRecords);
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  // Core business methods
  loadTimeTransactionRequests() {
    this.loading = true;
    const empId = this.authService.getEmpIdAsNumber() || 0;
    const startDate = this.filterForm.get('startDate')?.value || undefined;
    const endDate = this.filterForm.get('endDate')?.value || undefined;
    const searchColumn = this.paginationRequest.searchColumn;
    const searchText = this.paginationRequest.searchText;

    this.attendanceTimeService.GetTimeTransactionApprovalRequests(
      this.currentLang,
      empId,
      this.currentPage,
      this.pageSize,
      startDate,
      endDate,
      searchColumn,
      searchText
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.timeTransactionRequests = response.data.timeTransactionApprovalRequests;
          // Handle pagination information from API response if available
          this.totalRecords = response.data.totalCount;
        } else {
          this.showErrorMessage(response.message);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading time transaction requests:', error);
        this.showErrorMessage('ATTENDANCE_TIME_CHANGE.LOAD_ERROR');
        this.loading = false;
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadTimeTransactionRequests();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadTimeTransactionRequests();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadTimeTransactionRequests();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.pageSize = this.paginationRequest.pageSize;
    this.loadTimeTransactionRequests();
  }

  // Filter methods
  applyFilter() {
    this.currentPage = 1;
    this.loadTimeTransactionRequests();
  }

  resetFilter() {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadTimeTransactionRequests();
  }

  deleteTimeTransactionRequest(item: TimeTransactionApprovalRequest) {
    this.confirmationService.confirm({
      message: this.translateService.instant('ATTENDANCE_TIME_CHANGE.DELETE_SINGLE_CONFIRMATION', { empName: item.empName }),
      header: this.translateService.instant('ATTENDANCE_TIME_CHANGE.DELETE_CONFIRMATION_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateService.instant('COMMON.YES'),
      rejectLabel: this.translateService.instant('COMMON.NO'),
      accept: () => {
        this.attendanceTimeService.DeleteTimeTransactionApprovalRequest(this.currentLang, item.reqId).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.showSuccessMessage('ATTENDANCE_TIME_CHANGE.DELETE_SUCCESS');
              this.loadTimeTransactionRequests();
            } else {
              this.showErrorMessage(response.message);
            }
          },
          error: (error) => {
            this.showErrorMessage(error?.error?.message || 'ATTENDANCE_TIME_CHANGE.DELETE_ERROR');
          }
        });
      }
    });
  }

  // Check if item can be deleted or selected
  canDeleteOrSelect(item: TimeTransactionApprovalRequest): boolean {
    // Add your business logic here
    return true; // For now, allow all items to be deleted/selected
  }

  // Helper methods for displaying request status
  getStatusDisplayText(statusCode: number, statusName: string): string {
    return statusName || 'Unknown';
  }

  getStatusIcon(statusCode: number): string {
    switch (statusCode) {
      case 1: return 'pi pi-check-circle text-success';
      case 2: return 'pi pi-times-circle text-danger';
      case 0: return 'pi pi-clock text-warning';
      default: return 'pi pi-question-circle text-muted';
    }
  }

  // TrackBy function for better performance
  trackByRequestId(index: number, item: TimeTransactionApprovalRequest): number {
    return item.reqId;
  }

  // Action button methods
  viewDetails(item: TimeTransactionApprovalRequest) {
    this.selectedRequestId = item.reqId;
    this.showRequestDetailsModal = true;
  }

  onCloseModal() {
    this.showRequestDetailsModal = false;
    this.selectedRequestId = 0;
  }

  viewGraph(item: TimeTransactionApprovalRequest) {
    // Implement graph view logic
    console.log('View graph for:', item);
    this.showInfoMessage('ATTENDANCE_TIME_CHANGE.GRAPH_NOT_IMPLEMENTED');
  }

  viewAttachments(item: TimeTransactionApprovalRequest) {
    this.selectedAttachmentRequestId = item.reqId;
    this.showAttachmentsModal = true;
  }

  onCloseAttachmentsModal() {
    this.showAttachmentsModal = false;
    this.selectedAttachmentRequestId = 0;
  }

  // Placeholder action methods
  createRequest() {
    this.showCreateRequestModal = true;
    this.loadEmployees();
  }

  loadEmployees() {
    this.loadingEmployees = true;
    this.requestRouteService.getEmployeesDropdownListForTimeTransactionApproval(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.employees = response.data.dropdownListsForTimeTransactionApprovals;
          }
          this.loadingEmployees = false;
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.showErrorMessage('ATTENDANCE_TIME_CHANGE.LOAD_EMPLOYEES_ERROR');
          this.loadingEmployees = false;
        }
      });
  }

  onCloseCreateRequestModal() {
    this.showCreateRequestModal = false;
    this.createRequestForm.reset();
    this.selectedFile = null;
    this.selectedFileBase64 = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedFileBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

    onSubmitCreateRequest() {
      if (this.createRequestForm.valid) {
        const formValue = this.createRequestForm.value;
        
        // Convert date and time to ISO format
        const signDate = new Date(formValue.signDate);
const pad = (num: number) => num.toString().padStart(2, '0');

// Extract hours and minutes from form
const [inHours, inMinutes] = formValue.inTime.split(':').map(Number);
const [outHours, outMinutes] = formValue.outTime.split(':').map(Number);

// Use today's date
const year = signDate.getFullYear();
const month = pad(signDate.getMonth() + 1);
const day = pad(signDate.getDate());

const inTimeStr = `${year}-${month}-${day}T${pad(inHours)}:${pad(inMinutes)}:00.000Z`;
const outTimeStr = `${year}-${month}-${day}T${pad(outHours)}:${pad(outMinutes)}:00.000Z`;

        // Get base64 without data URL prefix
        let fileBase64 = '';
        let fileType = '';
        let fileName = '';
        
        if (this.selectedFileBase64) {
          const base64Data = this.selectedFileBase64.split(',')[1];
          fileBase64 = base64Data;
          fileType = this.selectedFile?.type || 'application/octet-stream';
          fileName = this.selectedFile?.name || 'attachment';
        }

        const dto: TimeTransactionApprovalRequestCreateDto = {
          empId: parseInt(formValue.empId),
          reqByEmpId: this.authService.getEmpIdAsNumber() || 0,
          signDate: signDate.toISOString(),
          in: inTimeStr,
          out: outTimeStr,
          note: formValue.note || '',
          file: fileBase64,
          fileType: fileType,
          filePath: fileName,
          noteAttach: formValue.attachmentNote || ''
        };

        this.attendanceTimeService.createTimeTransactionApprovalRequest(dto, this.currentLang)
          .subscribe({
            next: (response) => {
              if (response.isSuccess) {
                this.showSuccessMessage('ATTENDANCE_TIME_CHANGE.CREATE_SUCCESS');
                this.onCloseCreateRequestModal();
                this.loadTimeTransactionRequests();
              } else {
                this.showErrorMessage(response.message);
              }
            },
            error: (error) => {
              console.error('Error creating request:', error);
              this.showErrorMessage(error.error.message);
            }
          });
      } else {
        this.showWarningMessage('ATTENDANCE_TIME_CHANGE.INVALID_FORM');
      }
    }

  manualAttendance() {
    this.showInfoMessage('ATTENDANCE_TIME_CHANGE.MANUAL_ATTENDANCE_NOT_IMPLEMENTED');
  }

  attendanceByDepartment() {
    this.showDepartmentAttendanceModal = true;
    this.loadDepartmentAttendances();
  }

  // Department Attendance Modal Methods
  loadDepartmentAttendances() {
    this.loadingDepartmentAttendances = true;
    
    const formValue = this.departmentAttendanceFilterForm?.value || {};
    let startDate = formValue.startDate || undefined;
    let endDate = formValue.endDate || undefined;

    // Format dates to YYYY-MM-DD if they exist
    if (startDate) {
      startDate = new Date(startDate).toISOString().split('T')[0];
    }
    if (endDate) {
      endDate = new Date(endDate).toISOString().split('T')[0];
    }

    this.attendanceTimeService.getDepartmentAttendances(
      this.currentLang,
      this.departmentAttendanceCurrentPage,
      this.departmentAttendancePageSize,
      startDate,
      endDate
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.departmentAttendances = response.data.departmentAttendances || [];
          this.departmentAttendanceTotalRecords = response.data.totalCount || 0;
        } else {
          this.departmentAttendances = [];
          this.departmentAttendanceTotalRecords = 0;
          this.showErrorMessage('ATTENDANCE_TIME_CHANGE.DEPARTMENT_ATTENDANCE_MODAL.LOAD_ERROR');
        }
      },
      error: (error) => {
        console.error('Error loading department attendances:', error);
        this.departmentAttendances = [];
        this.departmentAttendanceTotalRecords = 0;
        this.showErrorMessage('ATTENDANCE_TIME_CHANGE.DEPARTMENT_ATTENDANCE_MODAL.LOAD_ERROR');
      },
      complete: () => {
        this.loadingDepartmentAttendances = false;
      }
    });
  }

  onCloseDepartmentAttendanceModal() {
    this.showDepartmentAttendanceModal = false;
    this.departmentAttendances = [];
    this.departmentAttendanceTotalRecords = 0;
    this.departmentAttendanceCurrentPage = 1;
    this.departmentAttendanceSearchTerm = '';
    this.departmentAttendanceFilterForm.reset();
  }

  applyDepartmentAttendanceFilter() {
    this.departmentAttendanceCurrentPage = 1;
    this.loadDepartmentAttendances();
  }

  resetDepartmentAttendanceFilter() {
    this.departmentAttendanceFilterForm.reset();
    this.departmentAttendanceCurrentPage = 1;
    this.departmentAttendanceSearchTerm = '';
    this.loadDepartmentAttendances();
  }

  onDepartmentAttendanceSearch() {
    // Since we're using client-side filtering, we don't need to make an API call
    // The filteredDepartmentAttendances getter will handle the search
    // But if you want to do server-side search in the future, you can uncomment the lines below:
    // this.departmentAttendanceCurrentPage = 1;
    // this.loadDepartmentAttendances();
  }

  // Department Attendance Pagination
  get departmentAttendanceCurrentPageStart(): number {
    return (this.departmentAttendanceCurrentPage - 1) * this.departmentAttendancePageSize + 1;
  }

  get departmentAttendanceCurrentPageEnd(): number {
    const end = this.departmentAttendanceCurrentPage * this.departmentAttendancePageSize;
    return Math.min(end, this.departmentAttendanceTotalRecords);
  }

  get departmentAttendanceTotalPages(): number {
    return Math.ceil(this.departmentAttendanceTotalRecords / this.departmentAttendancePageSize);
  }

  goToDepartmentAttendancePage(page: number) {
    if (page >= 1 && page <= this.departmentAttendanceTotalPages && page !== this.departmentAttendanceCurrentPage) {
      this.departmentAttendanceCurrentPage = page;
      this.loadDepartmentAttendances();
    }
  }

  onDepartmentAttendancePageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.departmentAttendancePageSize = parseInt(target.value, 10);
    this.departmentAttendanceCurrentPage = 1;
    this.loadDepartmentAttendances();
  }

  trackByDepartmentAttendanceId(index: number, item: DepartmentAttendance): number {
    return item.timId;
  }

  // Get filtered department attendances for display
  get filteredDepartmentAttendances(): DepartmentAttendance[] {
    if (!this.departmentAttendanceSearchTerm.trim()) {
      return this.departmentAttendances;
    }

    const searchTerm = this.departmentAttendanceSearchTerm.toLowerCase().trim();
    return this.departmentAttendances.filter(attendance =>
      attendance.deptName.toLowerCase().includes(searchTerm) ||
      attendance.deptMgrName.toLowerCase().includes(searchTerm) ||
      attendance.stsName.toLowerCase().includes(searchTerm)
    );
  }

  // Message helper methods
  private showSuccessMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: this.translateService.instant(message)
    });
  }

  private showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('ERROR'),
      detail: this.translateService.instant(message)
    });
  }

  private showWarningMessage(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: this.translateService.instant('WARNING'),
      detail: this.translateService.instant(message)
    });
  }

  private showInfoMessage(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('INFO'),
      detail: this.translateService.instant(message)
    });
  }
}
