import { Component, OnInit } from '@angular/core';
import { Department, DepartmentResponse } from '../../../../core/models/department';
import { DepartmentService } from '../../services/department.service';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PaginationRequest } from '../../../../core/models/pagination';

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
  
  // Form data
  newDepartment = {
    arabicName: '',
    englishName: '',
    managerId: '',
    parentDepartmentId: '',
    branchId: '',
    deptLevel: '',
    locationId: '',
    locationDescription: '',
    notes: ''
  };

  // Change number form data
  changeNumberData = {
    newNumber: '',
    notes: ''
  };

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
    { id: 1, name: 'القسم الرئيسي' },
    { id: 2, name: 'قسم الموارد البشرية' },
    { id: 3, name: 'قسم التقنية' },
    { id: 4, name: 'قسم المالية' },
    { id: 5, name: 'قسم التسويق' },
    { id: 6, name: 'قسم العمليات' }
  ];

  branches = [
    { id: 1, name: 'المركز الرئيسي' },
    { id: 2, name: 'الجامعة' },
    { id: 3, name: 'فرع المجمعة' },
    { id: 4, name: 'فرع رماح' },
    { id: 5, name: 'فرع الزلفي' },
    { id: 6, name: 'فرع الغاط' },
    { id: 7, name: 'فرع الحوطة' },
    { id: 8, name: 'فرع حرمة' }
  ];

  deptLevels = [
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
    private departmentService: DepartmentService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1;
      this.loadDepartments(); // Reload departments when language changes
    });

    
  }

  ngOnInit() {
    this.loadDepartments();
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
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadDepartments();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadDepartments();
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
  }

  closeModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newDepartment = {
      arabicName: '',
      englishName: '',
      managerId: '',
      parentDepartmentId: '',
      branchId: '',
      deptLevel: '',
      locationId: '',
      locationDescription: '',
      notes: ''
    };
  }

  submitDepartment() {
    console.log('New Department Data:', this.newDepartment);
    // TODO: Call API to save the department
    this.messageService.add({ 
      severity: 'success', 
      summary: 'نجح', 
      detail: this.isEditMode ? 'تم تحديث القسم بنجاح' : 'تم إضافة القسم بنجاح' 
    });
    this.closeModal();
    // Reload the departments list
    this.loadDepartments();
  }

  loadDepartments() {
    this.loading = true;
    this.departmentService.getDepartments(this.paginationRequest).subscribe({
      next: (response: DepartmentResponse) => {
        if (response.isSuccess) {
          this.departments = response.data?.departments || [];
          this.totalRecords = this.departments.length; // Update this when API provides total count
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

  editDepartment(department: Department) {
    this.isEditMode = true;
    this.selectedDepartment = department;
    this.newDepartment = {
      arabicName: department.deptName,
      englishName: department.deptName,
      managerId: department.mgrId?.toString() || '',
      parentDepartmentId: department.parentDeptId?.toString() || '',
      branchId: department.branchId.toString(),
      deptLevel: department.deptLevel.toString(),
      locationId: department.locId?.toString() || '',
      locationDescription: department.locDesc,
      notes: department.note
    };
    this.showAddModal = true;
  }

  deleteDepartment(department: Department) {
    this.confirmationService.confirm({
      message: `هل أنت متأكد من حذف القسم "${department.deptName}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'لا',
      accept: () => {
        // TODO: Call API to delete the department
        this.messageService.add({ 
          severity: 'success', 
          summary: 'نجح', 
          detail: 'تم حذف القسم بنجاح' 
        });
        this.loadDepartments();
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
    this.changeNumberData = {
      newNumber: '',
      notes: ''
    };
  }

  getOldDepartmentNumber(department: Department | null): string {
    return department ? department.deptId.toString() : '';
  }

  submitChangeNumber() {
    console.log('Change Number Data:', this.changeNumberData);
    // TODO: Call API to change the department number
    this.messageService.add({ 
      severity: 'success', 
      summary: 'نجح', 
      detail: 'تم تغيير رقم القسم بنجاح' 
    });
    this.closeChangeNumberModal();
    this.loadDepartments();
  }
}
