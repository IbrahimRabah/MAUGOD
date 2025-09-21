import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserRolesService } from '../../services/user-roles.service';
import { LanguageService } from '../../../../core/services/language.service';
import { RoleData, RoleResponse, createUserRoleRequest, UpdateUserRoleRequest } from '../../../../core/models/userRoels';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrl: './user-roles.component.css',
  providers: [MessageService, ConfirmationService]
})
export class UserRolesComponent implements OnInit, OnDestroy {
  // Component state
  userRoles: RoleData[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Form for pagination
  searchForm!: FormGroup;
  
  // Dialog related properties
  showDialog = false;
  dialogTitle = '';
  roleForm!: FormGroup;
  isEditMode = false;
  currentEditingRole: RoleData | null = null;
  isSubmitting = false;
  
  // Language subscription and state management
  private langSubscription: Subscription = new Subscription();
  private isInitialized = false;
  private isLoadingInProgress = false; // Prevent multiple simultaneous calls
  public currentLang = 2; // Default to Arabic (2) - made public for template access

      searchColumns = [
  { column: 'allFields', label: 'All Columns' }, // all columns option
  { column: 'roleId', label: 'MENU.PERMISSION_MANAGEMENT.USER_ROLES.ROLE' },
  { column: 'ar', label: 'MENU.PERMISSION_MANAGEMENT.USER_ROLES.ARABIC_NAME' },
  { column: 'en', label: 'MENU.PERMISSION_MANAGEMENT.USER_ROLES.ENGLISH_NAME' },
  { column: 'isVirtual', label: 'MENU.PERMISSION_MANAGEMENT.USER_ROLES.VIRTUAL_ROLE' },
  { column: 'note', label: 'MENU.PERMISSION_MANAGEMENT.USER_ROLES.NOTE' }
];
  selectedColumnLabel: string = this.searchColumns[0].label;
  selectedColumn: string = this.searchColumns[0].column;
      searchTerm: string = '';


  constructor(
    private userRolesService: UserRolesService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
    this.initializeRoleForm();
  }

  ngOnInit() {
    console.log('UserRoles component initializing...');
    
    // Initialize current language
    this.currentLang = this.langService.getLangValue();
    
    // Subscribe to language changes - single subscription
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = lang === 'ar' ? 2 : 1;
      
      // Only reload user roles if component is already initialized (not first time)
      if (this.isInitialized) {
        this.loadUserRoles();
      }
    });
    
    // Load initial data only once
    this.loadUserRoles();
    this.isInitialized = true;
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeForm() {
    this.searchForm = this.fb.group({
      pageSize: [this.pageSize]
    });

    // Subscribe to page size changes
    this.searchForm.get('pageSize')?.valueChanges.subscribe(newPageSize => {
      this.pageSize = newPageSize;
      this.currentPage = 1;
      this.loadUserRoles();
    });
  }

  private initializeRoleForm() {
    this.roleForm = this.fb.group({
      ar: ['', [Validators.required]],
      en: ['', [Validators.required]],
      isVirtual: [false, [Validators.required]],
      note: ['']
    });
  }

  // Dialog methods
  openCreateDialog() {
    this.isEditMode = false;
    this.currentEditingRole = null;
    this.dialogTitle = this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.CREATE_NEW_ROLE');
    this.roleForm.reset({
      ar: '',
      en: '',
      isVirtual: false,
      note: ''
    });
    this.showDialog = true;
  }

  editRole(role: RoleData) {
    this.isEditMode = true;
    this.currentEditingRole = role;
    this.dialogTitle = this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.EDIT_ROLE');
    this.roleForm.patchValue({
      ar: role.ar,
      en: role.en,
      isVirtual: role.isVirtual,
      note: role.note || ''
    });
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.isEditMode = false;
    this.currentEditingRole = null;
    this.roleForm.reset();
    this.isSubmitting = false;
  }

  onSubmit() {
    if (this.roleForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      if (this.isEditMode) {
        this.updateUserRole();
      } else {
        this.createUserRole();
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.roleForm.controls).forEach(key => {
        this.roleForm.get(key)?.markAsTouched();
      });
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUserRoles();
  }

selectColumn(col: any) {
  this.selectedColumn = col.column;
  this.selectedColumnLabel = col.label;
}
  private createUserRole() {
    const formValue = this.roleForm.value;
    const request: createUserRoleRequest = {
      ar: formValue.ar,
      en: formValue.en,
      isVirtual: formValue.isVirtual,
      note: formValue.note || null
    };

    this.userRolesService.createUserRole(request, this.currentLang)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.SUCCESS'),
            detail: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.CREATE_SUCCESS')
          });
          this.closeDialog();
          this.loadUserRoles(); // Reload the data
        },
        error: (error) => {
          console.error('Error creating user role:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.ERROR'),
            detail: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.CREATE_ERROR')
          });
          this.isSubmitting = false;
        }
      });
  }

  private updateUserRole() {
    if (!this.currentEditingRole) {
      return;
    }

    const formValue = this.roleForm.value;
    const request: UpdateUserRoleRequest = {
      roleId: this.currentEditingRole.roleId,
      ar: formValue.ar,
      en: formValue.en,
      isVirtual: formValue.isVirtual,
      note: formValue.note || null
    };

    this.userRolesService.updateUserRole(request, this.currentLang)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.SUCCESS'),
            detail: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.UPDATE_SUCCESS')
          });
          this.closeDialog();
          this.loadUserRoles(); // Reload the data
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.ERROR'),
            detail: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.UPDATE_ERROR')
          });
          this.isSubmitting = false;
        }
      });
  }

  loadUserRoles() {
    // Prevent multiple simultaneous calls
    if (this.isLoadingInProgress) {
      console.log('UserRoles: Load already in progress, skipping...');
      return;
    }
    
    console.log('UserRoles: Loading data with language:', this.currentLang);
    this.loading = true;
    this.isLoadingInProgress = true;
    const lang = this.currentLang;
    
    // Use pageIndex starting from 1, not 0
    this.userRolesService.getAllUserRoles(lang, this.pageSize, this.currentPage,this.selectedColumn,this.searchTerm)
      .subscribe({
        next: (response: RoleResponse) => {
          this.userRoles = response.data || [];
          this.totalRecords = response.totalCount || 0;
          this.loading = false;
          this.isLoadingInProgress = false;
          console.log('UserRoles: Data loaded successfully, total records:', this.totalRecords);
        },
        error: (error) => {
          console.error('Error loading user roles:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ERROR'),
            detail: this.translateService.instant('USER_ROLES.LOAD_ERROR')
          });
          this.loading = false;
          this.isLoadingInProgress = false;
        }
      });
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get currentPageStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get currentPageEnd(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.totalRecords ? this.totalRecords : end;
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUserRoles();
    }
  }

  goToFirstPage() {
    this.onPageChange(1);
  }

  goToPreviousPage() {
    this.onPageChange(this.currentPage - 1);
  }

  goToNextPage() {
    this.onPageChange(this.currentPage + 1);
  }

  goToLastPage() {
    this.onPageChange(this.totalPages);
  }

  // Delete role with confirmation
  deleteRole(role: RoleData) {
    this.confirmationService.confirm({
      message: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.CONFIRM_DELETE'),
      header: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.DELETE_TITLE'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDelete(role);
      }
    });
  }

  private performDelete(role: RoleData) {
    const lang = this.currentLang;
    
    this.userRolesService.deleteUserRole(role.roleId, lang)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.SUCCESS'),
            detail: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.USER_ROLES.DELETE_SUCCESS')
          });
          this.loadUserRoles(); // Reload the data
        },
        error: (error) => {
          console.error('Error deleting user role:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant(error.error.message),
            detail: this.translateService.instant(error.error.message)
          });
        }
      });
  }
}
