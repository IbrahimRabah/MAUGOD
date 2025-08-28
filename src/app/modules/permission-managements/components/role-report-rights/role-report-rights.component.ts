import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationRequest } from '../../../../core/models/pagination';
import { RoleReportRight, RoleReportRightResponse } from '../../../../core/models/roleReportRight';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { RoleDropdownListForRoleReportRight } from '../../../../core/models/roleDropdownListForRoleReportRight';
import { RoleReportRightCreate } from '../../../../core/models/roleReportRightCreate';
import { RoleReportRightService } from '../../services/role-report-right.service';

interface SelectableItem {
  id: number | string;
  name: string;
}

interface MultiSelectState {
  available: SelectableItem[];
  selected: SelectableItem[];
  searchTerm: string;
}

@Component({
  selector: 'app-role-report-rights',
  templateUrl: './role-report-rights.component.html',
  styleUrl: './role-report-rights.component.css',
  providers: [MessageService, ConfirmationService]
})
export class RoleReportRightsComponent implements OnInit, OnDestroy {
  roleReportRights: RoleReportRight[] = [];
    loading: boolean = false;
    totalRecords: number = 0;
    currentPage: number = 1;
    pageSize: number = 10;
    showAddModal: boolean = false;
    showEditModal: boolean = false;
    isEditMode = false;
    selectedRoleReportRight: RoleReportRight | null = null;
    selectedItems: RoleReportRight[] = [];
    roles: RoleDropdownListForRoleReportRight[] = [];
    reports: { id: number; name: string; }[] | undefined;
    selectedRepIdsString: string | undefined;

  // Loading states
  loadingReports = false;

   // Data loaded flags to avoid unnecessary reloads
  private dataLoaded = {
    reports: false,
  };

   // Multi-select state management
  multiSelectStates: { [key: string]: MultiSelectState } = {
    reports: { available: [], selected: [], searchTerm: '' }
  };

  // Dropdown data
  Roles: any[] = [];
  filteredRoles: any[] = [];
  roleSearchTerm: string = '';
  showRoleDropdown: boolean = false;
  selectedRoleLabel: string = '';
  selectedRole: any = null;
  loadingRoles: boolean = false;
    

 searchColumns = [
    { column: '', label: 'All Columns' }, // all columns option
    { column: 'RoleName', label: 'MENU.GENERAL_DATA.ROLEREPORTRIGHTS_TABLE.ROLE' },
    { column: 'ReportName', label: 'MENU.GENERAL_DATA.ROLEREPORTRIGHTS_TABLE.REPORT' },
    { column: 'DELEGATE_ID', label: 'MENU.GENERAL_DATA.ROLEREPORTRIGHTS_TABLE.DELEGATE' },
  ];

 selectedColumnLabel: string = this.searchColumns[0].label;

    private langSubscription: Subscription = new Subscription();
    private currentLang = 2; // Default to Arabic (2)
    
    // Reactive Forms
    roleReportRightForm!: FormGroup;
    searchForm!: FormGroup;
    
    paginationRequest: PaginationRequest = {
      pageNumber: 1,
      pageSize: 10,
      lang: this.langService.getLangValue(), // Default to English
      searchColumn: this.searchColumns[0].column,
      searchText: ''
    };
  dropdownlistsService: any;
  
    constructor(
      private roleReportRightService: RoleReportRightService,
      public langService: LanguageService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService,
      private fb: FormBuilder
    ) {
      this.currentLang = this.langService.getLangValue();
      this.initializeForm();
      this.initializeMultiSelectStates();
      
    }
  
    ngOnInit() {
      // Subscribe to language changes
      this.langSubscription = this.langService.currentLang$.subscribe(lang => {
        this.currentLang = this.langService.getLangValue();
        this.loadRoles();
        if (!this.dataLoaded.reports) {
          this.loadReports();
        }
        this.loadRoleReportRights();
      });

    }

    ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForm() {
      this.roleReportRightForm = this.fb.group({
        roleId: [0, [Validators.required]],
        reports: ['', [Validators.required]],
      });

      this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [10]
    });
    }

  // Selection state getters
  get isAllSelected(): boolean {
    return this.roleReportRights.length > 0 && this.selectedItems.length === this.roleReportRights.length;
  }

  get isPartiallySelected(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.length < this.roleReportRights.length;
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
  
    //Pagination methods
    goToPage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.paginationRequest.pageNumber = page;
        this.loadRoleReportRights();
      }
    }
  selectColumn(col: any) {
    this.paginationRequest.searchColumn = col.column;
    this.selectedColumnLabel = col.label;
  }
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.paginationRequest.pageNumber = this.currentPage;
        this.loadRoleReportRights();
      }
    }
  
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.paginationRequest.pageNumber = this.currentPage;
        this.loadRoleReportRights();
      }
    }
  
    onPageSizeChange() {
      this.pageSize = parseInt(this.searchForm.get('pageSize')?.value);
      this.currentPage = 1;
      this.paginationRequest.pageNumber = 1;
      this.loadRoleReportRights();
    }
  
    onSearch() {
      this.currentPage = 1;
      this.paginationRequest.pageNumber = 1;
      this.loadRoleReportRights();
    }
  
    addRoleReportRight() {
      this.showAddModal = true;
      this.isEditMode = false;
      this.selectedRoleReportRight = null;
      this.clearAllSelections();
      this.resetForm();
    }
  
    closeModal() {
      this.showAddModal = false;
      this.showEditModal = false;
      this.selectedRoleReportRight = null;
      this.clearAllSelections();
      this.resetForm();
    }
  
    resetForm() {
      this.roleReportRightForm.reset({
        roleId: 0,
        reports: '',
        roleAutoComplete: null, // Reset back to null
      });

      // Reset role selection state
    this.selectedRoleLabel = '';
    this.roleSearchTerm = '';
    this.selectedRole = null;
    this.showRoleDropdown = false;
    }
  
    submitRoleReportRight() {
      if (this.roleReportRightForm.valid) {
        const roleReportRightCreate:RoleReportRightCreate = {roleId: this.selectedRole, repIdsString: this.selectedRepIdsString};
        
        if (this.showEditModal && this.selectedRoleReportRight) {
         
        } else {
          // Add new roleReportRight
          this.loading = true;
          this.roleReportRightService.addRoleReportRight(roleReportRightCreate, this.currentLang).subscribe({
            next: (response) => {
              this.messageService.add({ 
                severity: 'success', 
                summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
                detail: response.message
              });
              this.closeModal();
              this.loadRoleReportRights();
            },
            error: (error) => {
              this.messageService.add({ 
                severity: 'error', 
                summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
                detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في إضافة الصلاحية' : 'Failed to add roleReportRight'
              });
            },
            complete: () => {
              this.loading = false;
            }
          });
        }
      } else {
        // Mark all fields as touched to show validation errors
        this.roleReportRightForm.markAllAsTouched();
      }
    }
  
    loadRoleReportRights() {
      this.loading = true;
      this.roleReportRightService.getRoleReportRights(this.paginationRequest).subscribe({
        next: (response: RoleReportRightResponse) => {
          if (response.isSuccess) {
            this.roleReportRights = response.data?.userRoleReportRights || [];
            this.totalRecords = response.data.totalCount;
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: response.message 
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
            detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في تحميل البيانات' : 'Failed to load data'
          });
          this.loading = false;
        }
      });
    }
  
    deleteRoleReportRight(roleReportRight: RoleReportRight) {
      this.confirmationService.confirm({
        message: this.langService.getCurrentLang() === 'ar' ? 
          `هل أنت متأكد من حذف الصلاحية "${roleReportRight.roleName}"؟` : 
          `Are you sure you want to delete the roleReportRight "${roleReportRight.roleName}"?`,
        header: this.langService.getCurrentLang() === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-danger',
        accept: () => {
          this.roleReportRightService.deleteRoleReportRight(roleReportRight.recId, this.currentLang).subscribe({
            next: () => {
              this.messageService.add({ 
                severity: 'success', 
                summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
                detail: this.langService.getCurrentLang() === 'ar' ? 'تم حذف الصلاحية بنجاح' : 'Role report right deleted successfully'
              });
              this.loadRoleReportRights();
            },
            error: (error) => {
              this.messageService.add({ 
                severity: 'error', 
                summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
                detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في حذف الصلاحية' : 'Failed to delete role report right'
              });
            }
          });
        }
      });
    }

    private loadRoles() {
    // Load roles
    this.loadingRoles = true;
    this.roleReportRightService.getRolesDropdownListForRoleReportRight(this.currentLang).subscribe({
      next: (response) => {
        this.roles = response.data?.dropdownListsForRoleReportRights || [];
        this.filteredRoles = [...this.roles];
        
        // If we're in edit mode and have an roleId, pre-select the role
        const currentRoleId = this.roleReportRightForm.get('roleId')?.value;
        if (currentRoleId && currentRoleId > 0) {
          const selectedRole = this.roles.find(role => role.value === currentRoleId);
          if (selectedRole) {
            this.selectedRole = selectedRole;
            this.selectedRoleLabel = selectedRole.label;
            this.roleReportRightForm.patchValue({ 
              roleAutoComplete: selectedRole // Set the full object
            });
          }
        }
        
        this.loadingRoles = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.loadingRoles = false;
      }
    });

  }

  // Role search methods
  filterRoles() {
    if (!this.roleSearchTerm.trim()) {
      this.filteredRoles = [...this.roles];
    } else {
      this.filteredRoles = this.roles.filter(role => 
        role.label.toLowerCase().includes(this.roleSearchTerm.toLowerCase())
      );
    }
  }

  selectRole(role: any) {
    this.roleReportRightForm.patchValue({ roleId: role.value });
    this.roleSearchTerm = role.label;
    this.selectedRoleLabel = role.label;
    this.showRoleDropdown = false;
  }

  onRoleInputFocus() {
    this.showRoleDropdown = true;
    this.filterRoles();
  }

  onRoleInputBlur() {
    // Delay hiding to allow click on dropdown items
    setTimeout(() => {
      this.showRoleDropdown = false;
    }, 200);
  }

  onRoleSearchChange() {
    this.filterRoles();
    this.showRoleDropdown = true;
  }

  toggleRoleDropdown() {
    this.showRoleDropdown = !this.showRoleDropdown;
    if (this.showRoleDropdown) {
      this.filterRoles();
    }
  }


  isRoleSelected(role: any): boolean {
    return this.roleReportRightForm.get('roleId')?.value === role.value;
  }

  // PrimeNG AutoComplete methods
  searchRole(event: any): void {
    const query = event.query.toLowerCase();
    if (!query || query.length === 0) {
      // Show all roles when dropdown is opened without typing
      this.filteredRoles = [...this.roles];
    } else {
      this.filteredRoles = this.roles.filter(role => 
        role.label.toLowerCase().includes(query)
      );
    }
  }

  onRoleSelect(event: any): void {
    this.selectedRole = event;
    this.roleReportRightForm.patchValue({ 
      roleId: event.value,
      roleAutoComplete: event // Set the full object back
    });
    this.selectedRoleLabel = event.label;
    
    // Mark the roleId field as touched to trigger validation
    this.roleReportRightForm.get('roleId')?.markAsTouched();
  }


  // Display function for AutoComplete
  getRoleDisplayValue(role: any): string {
    return role ? role.label || '' : '';
  }

    // Selection methods
      isSelected(roleReportRight: RoleReportRight): boolean {
        return this.selectedItems.some(item => item.recId === roleReportRight.recId);
      }
    
      toggleSelection(roleReportRight: RoleReportRight) {
        const index = this.selectedItems.findIndex(item => item.recId === roleReportRight.recId);
        if (index > -1) {
          this.selectedItems.splice(index, 1);
        } else {
          this.selectedItems.push(roleReportRight);
        }
      }
    
      toggleSelectAll() {
        if (this.selectedItems.length === this.roleReportRights.length) {
          this.selectedItems = [];
        } else {
          this.selectedItems = [...this.roleReportRights];
        }
      }
    
      deleteSelected() {
        if (this.selectedItems.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'تحذير',
            detail: 'يرجى اختيار عنصر واحد على الأقل للحذف'
          });
          return;
        }
    
        this.confirmationService.confirm({
          message: `هل أنت متأكد من أنك تريد حذف ${this.selectedItems.length} عنصر؟`,
          header: 'تأكيد حذف العناصر المحددة',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.loading = true;
            const selectedIds = this.selectedItems.map(item => item.recId);
            
            const deletePromises = this.selectedItems.map(item => 
              this.roleReportRightService.deleteSelectedRoleReportRights(selectedIds, this.currentLang).toPromise()
            );
    
            Promise.all(deletePromises).then(() => {
              this.messageService.add({
                severity: 'success',
                summary: 'نجح',
                detail: 'تم حذف العناصر المحددة بنجاح'
              });
              this.selectedItems = [];
              this.loadRoleReportRights();
            }).catch(() => {
              this.messageService.add({
                severity: 'error',
                summary: 'خطأ',
                detail: 'فشل في حذف بعض العناصر'
              });
            });
          }
        });
      }
  
    // Helper methods for form validation
    isFieldInvalid(fieldName: string): boolean {
      const field = this.roleReportRightForm.get(fieldName);
      return !!(field && field.invalid && (field.dirty || field.touched));
    }
  
    getFieldError(fieldName: string): string {
      const field = this.roleReportRightForm.get(fieldName);
      if (field && field.errors && (field.dirty || field.touched)) {
        if (field.errors['required']) {
          return `${fieldName} is required`;
        }
      }
      return '';
    }
  
    

    get searchTerm(): string {
    return this.searchForm.get('searchTerm')?.value || '';
  }
// Getter method for form validation
    get isFormValid(): boolean {
      return this.roleReportRightForm.valid;
    }

  hasSelectableItems(category: string): boolean {
    return (this.multiSelectStates[category]?.available.length || 0) > 0;
  }

  getStoredReportId(): number | undefined {
    const reportId = localStorage.getItem('reportId');
    return reportId ? parseInt(reportId, 10) : undefined;
  }
  
    private showErrorMessage(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail
    });
  }

  private loadReports() {
    this.loadingReports = true;
    const reportId = this.getStoredReportId() || 0;

    this.roleReportRightService.getReportsDropdownListForRoleReportRight(this.currentLang, this.selectedRole).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.dropdownListsForRoleReportRights) {
           this.reports = response.data.dropdownListsForRoleReportRights.map((report: any) => ({
            id: report.value,
            name: report.label
          }));
          this.updateMultiSelectState('reports',this. reports);
          this.dataLoaded.reports = true;
        } else {
          this.showErrorMessage('فشل في تحميل بيانات الموظفين');
        }
        this.loadingReports = false;
      },
      error: () => {
        this.loadingReports = false;
        this.showErrorMessage('فشل في تحميل بيانات الموظفين');
      }
    });
  }

  areAllItemsSelected(category: string): boolean {
    const state = this.multiSelectStates[category];
    return state ? state.available.length > 0 && state.selected.length === state.available.length : false;
  }

  clearSelection(category: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.selected = [];
    }
  }

  getSelectedCount(category: string): number {
    return this.multiSelectStates[category]?.selected.length || 0;
  }

  private clearAllSelections() {
    Object.keys(this.multiSelectStates).forEach(key => {
      this.multiSelectStates[key] = {
        available: this.multiSelectStates[key].available,
        selected: [],
        searchTerm: ''
      };
    });
  }

  private initializeMultiSelectStates() {
    Object.keys(this.multiSelectStates).forEach(key => {
      this.multiSelectStates[key] = {
        available: [],
        selected: [],
        searchTerm: ''
      };
    });
  }

  private updateMultiSelectState(category: string, items: SelectableItem[]) {
    if (this.multiSelectStates[category]) {
      this.multiSelectStates[category].available = items;
    }
  }

  // Generic multi-select methods
  getFilteredItems(category: string): SelectableItem[] {
    const state = this.multiSelectStates[category];
    if (!state) {
      return [];
    }
    
    if (!state.searchTerm) {
      return state.available;
    }
    
    return state.available.filter((item: SelectableItem) =>
      item.name.toLowerCase().includes(state.searchTerm.toLowerCase())
    );
  }

  isItemSelected(category: string, item: SelectableItem): boolean {
    const state = this.multiSelectStates[category];
    return state ? state.selected.some(selected => selected.id === item.id) : false;
  }

  toggleItemSelection(category: string, item: SelectableItem): void {
    const state = this.multiSelectStates[category];
    if (!state) return;

    const index = state.selected.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      state.selected.splice(index, 1);
    } else {
      state.selected.push(item);
    }
  }

  updateSearchTerm(category: string, searchTerm: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.searchTerm = searchTerm;
    }
  }

  selectAllItems(category: string): void {
    const state = this.multiSelectStates[category];
    if (state) {
      state.selected = [...state.available];
    }
  }

   private getSelectedIds(calculationType: string): number[] {
    const selectedItems = this.multiSelectStates[calculationType]?.selected || [];
    return selectedItems.map(item => Number(item.id));
  }
}
