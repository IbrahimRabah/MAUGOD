import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Branch, BranchResponse } from '../../../../core/models/branch';
import { PaginationRequest } from '../../../../core/models/pagination';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LanguageService } from '../../../../core/services/language.service';
import { BranchService } from '../../services/branch.service';

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
  
  // Reactive Forms
  branchForm!: FormGroup;
  changeNumberForm!: FormGroup;

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

  // Dropdown options (dummy data)
  managers = [
    { id: 1, name: 'مالك عبدالله مصعب عبدالله' },
    { id: 2, name: 'صالح الصالح' },
    { id: 3, name: 'خالد الخالد' },
    { id: 4, name: 'مانع المانع' },
    { id: 5, name: 'سالم السالم' },
    { id: 6, name: 'فهد الفهد' },
    { id: 7, name: 'طارق سالم عمر طارق' },
    { id: 8, name: 'مدير النظام' }
  ];

  parentDepartments = [
    { id: 1, name: 'المركز الرئيسي' },
    { id: 2, name: 'الجامعة' },
    { id: 3, name: 'فرع المجمعة' },
    { id: 4, name: 'فرع الحوطة' },
    { id: 5, name: 'فرع الزلفي' },
    { id: 6, name: 'مشفى سليمان الحبيب' }
  ];

  branchOptions = [
    { id: 1, name: 'المركز الرئيسي' },
    { id: 2, name: 'الجامعة' },
    { id: 3, name: 'فرع المجمعة' },
    { id: 4, name: 'فرع رماح' },
    { id: 5, name: 'فرع الزلفي' },
    { id: 6, name: 'فرع الغاط' },
    { id: 7, name: 'فرع الحوطة' },
    { id: 8, name: 'فرع حرمة' }
  ];

  defaultLevels = [
    { id: 1, name: 'المستوى الأول' },
    { id: 2, name: 'المستوى الثاني' },
    { id: 3, name: 'المستوى الثالث' },
    { id: 4, name: 'المستوى الرابع' },
    { id: 5, name: 'المستوى الخامس' }
  ];

  locations = [
    { id: 1, name: 'البوارق' },
    { id: 2, name: 'المكتب' },
    { id: 3, name: '14/11' },
    { id: 4, name: 'المجمعة' },
    { id: 5, name: 'الرياض' },
    { id: 6, name: 'جدة' },
    { id: 7, name: 'الخبر' },
    { id: 8, name: 'القصيم' }
  ];
  
  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1 // Default to English, can be changed based on app's language settings
  };
    constructor(
    private branch: BranchService,
    public langService:LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
    
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1; 
      this.loadBranches(); // Reload branches when language changes
    }) 
  }
    ngOnInit() {
    this.loadBranches();
  }

  initializeForms() {
    this.branchForm = this.fb.group({
      arabicName: ['', [Validators.required]],
      englishName: ['', [Validators.required]],
      managerId: ['', [Validators.required]],
      parentDepartmentId: ['', [Validators.required]],
      branchId: ['', [Validators.required]],
      defaultLevelId: ['', [Validators.required]],
      locationId: ['', [Validators.required]],
      locationDescription: ['', [Validators.required]],
      notes: ['', [Validators.required]]
    });

    this.changeNumberForm = this.fb.group({
      newNumber: ['', [Validators.required]]
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
  }

  closeModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm() {
    this.branchForm.reset();
  }

  submitBranch() {
    if (this.branchForm.valid) {
      console.log('Branch Form Data:', this.branchForm.value);
      // TODO: Call API to save the branch
      this.messageService.add({ 
        severity: 'success', 
        summary: 'نجح', 
        detail: this.isEditMode ? 'تم تحديث الفرع بنجاح' : 'تم إضافة الفرع بنجاح' 
      });
      this.closeModal();
      // Reload the branches list
      this.loadBranches();
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
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.message });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches' });
        this.loading = false;
      }
    });
  }

  editBranch(branch: Branch) {
    this.isEditMode = true;
    this.selectedBranch = branch;
    this.branchForm.patchValue({
      arabicName: branch.branchName,
      englishName: branch.branchName,
      managerId: branch.mgrId?.toString() || '',
      parentDepartmentId: branch.parentBranchId?.toString() || '',
      branchId: branch.branchId.toString(),
      defaultLevelId: '',
      locationId: branch.locId?.toString() || '',
      locationDescription: branch.locDesc || '',
      notes: branch.note || ''
    });
    this.showAddModal = true;
  }  deleteBranch(branch: Branch) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف الفرع "${branch.branchName}"؟\nلا يمكن التراجع عن هذا الإجراء.`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      accept: () => {
        console.log('Delete branch:', branch);
        // TODO: Call API to delete the branch
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجح', 
          detail: 'تم حذف الفرع بنجاح' 
        });
        // Reload the branches list
        this.loadBranches();
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
    if (this.changeNumberForm.valid) {
      console.log('Change Number Form Data:', {
        branchId: this.selectedBranch?.branchId,
        branchName: this.selectedBranch?.branchName,
        oldNumber: this.getOldBranchNumber(this.selectedBranch),
        newNumber: this.changeNumberForm.value.newNumber,
      });
      
      // TODO: Call API to change the branch number
      this.messageService.add({ 
        severity: 'success', 
        summary: 'نجح', 
        detail: 'تم تغيير رقم الفرع بنجاح' 
      });
      this.closeChangeNumberModal();
      // Reload the branches list
      this.loadBranches();
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
    }
    return '';
  }

  // Getter methods for form validation
  get isBranchFormValid(): boolean {
    return this.branchForm.valid;
  }

  get isChangeNumberFormValid(): boolean {
    return this.changeNumberForm.valid;
  }
}
