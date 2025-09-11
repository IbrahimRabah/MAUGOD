import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/services/language.service';
import { RoleModuleRightService } from '../../services/role-module-right.service';
import { UserRoleModuleRight, DropdownItem } from '../../../../core/models/UserRoleModuleRight ';

@Component({
  selector: 'app-role-module-rights',
  templateUrl: './role-module-rights.component.html',
  styleUrl: './role-module-rights.component.css',
  providers: [MessageService, ConfirmationService]
})
export class RoleModuleRightsComponent implements OnInit, OnDestroy {
  
  // Core component state
  userRoleModuleRights: UserRoleModuleRight[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  
  private langSubscription: Subscription = new Subscription();
  private searchSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic (2) - made public for template access
  
  // Reactive Forms
  searchForm!: FormGroup;
  filterForm!: FormGroup;
  copyForm!: FormGroup;
  
  // Selected items for bulk operations
  selectedItems: UserRoleModuleRight[] = [];
  selectAll = false;

 selectedColumn: string = '';
  
 searchColumns = [
    { column: '', label: 'All Columns' }, // all columns option
    { column: 'ROLE_NAME_TRANS', label: 'MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.ROLE' },
    { column: 'MODULE_NAME_TRANS', label: 'MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.MODULE' },
    { column: 'CAN_VIEW_TRANS', label: 'MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.CAN_VIEW' },
    { column: 'CAN_CREATE_TRANS', label: 'MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.CAN_CREATE' },
    { column: 'CAN_DELETE_TRANS', label: 'MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.CAN_EDIT' },
    { column: 'CAN_EDIT_TRANS', label: 'MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.CAN_DELETE' },
    { column: 'CAN_ADD_PUBLC_REP_TRANS', label: 'MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.CAN_ADD_PUBLIC_REPORT' },
  ];
  searchTerm: string = '';

 selectedColumnLabel: string = this.searchColumns[0].label;


  // Copy existing modal properties
  showCopyModal = false;
  sourceRoles: DropdownItem[] = [];
  destinationRoles: DropdownItem[] = [];
  loadingSourceRoles = false;
  loadingDestinationRoles = false;
  copyType: 'typical' | 'custom' = 'typical';
  
  // Custom copy properties
  customRoleRights: UserRoleModuleRight[] = [];
  selectedCustomRights: UserRoleModuleRight[] = [];
  loadingCustomRights = false;
  selectAllCustom = false;

  // Create/Edit modal properties
  showCreateEditModal = false;
  isEditMode = false;
  editingRecordId?: number;
  createEditForm!: FormGroup;
  roleOptions: DropdownItem[] = [];
  moduleOptions: DropdownItem[] = [];
  loadingRoles = false;
  loadingModules = false;
  loadingFormData = false;

  constructor(
    private roleModuleRightService: RoleModuleRightService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.initializeLanguage();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
    this.searchSubscription.unsubscribe();
  }

  // Initialize reactive forms
  private initializeForms() {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      pageSize: [this.pageSize]
    });

    this.filterForm = this.fb.group({
      // Add filter controls if needed
    });

    this.copyForm = this.fb.group({
      sourceRoleId: [null, Validators.required],
      destinationRoleId: [null, Validators.required],
      copyType: ['typical', Validators.required]
    });

    this.createEditForm = this.fb.group({
      roleId: [null, Validators.required],
      moduleIds: [[], Validators.required],
      canView: [false],
      canCreate: [false],
      canEdit: [false],
      canDelete: [false],
      canAddPublicRep: [false]
    });
  }

  // Initialize language settings
  private initializeLanguage() {
    this.currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
    
    this.langSubscription = this.langService.currentLang$.subscribe(() => {
      this.currentLang = this.langService.getCurrentLang() === 'ar' ? 2 : 1;
      this.loadUserRoleModuleRights();
    });
  }


  // Pagination computed properties
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

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }


selectColumn(col: any) {
    this.selectedColumn = col.column;
    this.selectedColumnLabel = col.label;
  }




  // Core business methods
  loadUserRoleModuleRights() {
    this.loading = true;
    this.selectedItems = [];
    this.selectAll = false;
    this.roleModuleRightService.getUserRoleModuleRights(
      this.currentLang,
      this.pageSize,
      this.currentPage - 1, // API expects 0-based page index
      this.selectedColumn,
      this.searchTerm,
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.userRoleModuleRights = response.data.userRoleModuleRights || [];
          // For now, we'll use the array length as total records since total count might not be available
          // If your API returns total count, update this line accordingly
          this.totalRecords = response.data.totalCount;
          // If API returns total in response.data.totalCount, use:
          // this.totalRecords = response.data.totalCount || this.userRoleModuleRights.length;
        } else {
          this.userRoleModuleRights = [];
          this.totalRecords = 0;
          this.showErrorMessage(response.message || 'Failed to load data');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user role module rights:', error);
        this.userRoleModuleRights = [];
        this.totalRecords = 0;
        this.loading = false;
        this.showErrorMessage('An error occurred while loading data');
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUserRoleModuleRights();
    }
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadUserRoleModuleRights();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadUserRoleModuleRights();
    }
  }

  onPageSizeChange() {
    this.pageSize = Number(this.searchForm.get('pageSize')?.value) || 10;
    this.currentPage = 1;
    this.loadUserRoleModuleRights();
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUserRoleModuleRights();
  }

  // Selection methods
  onSelectAll() {
    this.selectAll = !this.selectAll;
    this.selectedItems = this.selectAll 
      ? this.userRoleModuleRights.filter(item => this.canDeleteOrSelect(item))
      : [];
  }

  onItemSelect(item: UserRoleModuleRight) {
    if (!this.canDeleteOrSelect(item)) return;
    
    const index = this.selectedItems.findIndex(selected => selected.recId === item.recId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
    
    this.selectAll = this.selectedItems.length === this.userRoleModuleRights.filter(item => this.canDeleteOrSelect(item)).length;
  }

  // Delete methods
  deleteSelected() {
    if (this.selectedItems.length === 0) return;

    this.confirmationService.confirm({
      message: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.DELETE_SELECTED_CONFIRMATION', { count: this.selectedItems.length }),
      header: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.DELETE_CONFIRMATION_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.YES'),
      rejectLabel: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.NO'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        const recIds = this.selectedItems.map(item => item.recId);
        
        this.roleModuleRightService.deleteSelectedUserRoleModuleRights(
          { recIds },
          this.currentLang
        ).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.showSuccessMessage(this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.DELETE_SELECTED_SUCCESS'));
              this.loadUserRoleModuleRights();
            } else {
              this.showErrorMessage(response.message || 'Failed to delete selected items');
            }
          },
          error: (error) => {
            console.error('Error deleting selected items:', error);
            this.showErrorMessage('An error occurred while deleting selected items');
          }
        });
      }
    });
  }

  deleteUserRoleModuleRight(item: UserRoleModuleRight) {
    if (!this.canDeleteOrSelect(item)) return;

    this.confirmationService.confirm({
      message: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.DELETE_CONFIRMATION', { name: item.roleName + ' - ' + item.modName }),
      header: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.DELETE_CONFIRMATION_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.YES'),
      rejectLabel: this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.NO'),
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.roleModuleRightService.deleteOneUserRoleModuleRight(
          item.recId,
          this.currentLang
        ).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.showSuccessMessage(this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.DELETE_SUCCESS'));
              this.loadUserRoleModuleRights();
            } else {
              this.showErrorMessage(response.message || 'Failed to delete item');
            }
          },
          error: (error) => {
            console.error('Error deleting item:', error);
            this.showErrorMessage('An error occurred while deleting the item');
          }
        });
      }
    });
  }

  // Check if item can be deleted or selected
  canDeleteOrSelect(item: UserRoleModuleRight): boolean {
    return item.del !== 'N'; // Assuming 'N' means cannot delete
  }

  // Check if item is selected
  isItemSelected(item: UserRoleModuleRight): boolean {
    return this.selectedItems.some(selected => selected.recId === item.recId);
  }

  // Helper methods for displaying permission status
  getPermissionDisplayText(value: boolean, transValue: string): string {
    return value ? (transValue || this.translateService.instant('ROLE_MODULE_RIGHTS.YES')) : this.translateService.instant('ROLE_MODULE_RIGHTS.NO');
  }

  getPermissionIcon(value: boolean): string {
    return value ? 'fas fa-check text-success' : 'fas fa-times text-danger';
  }

  // Message helper methods
  private showSuccessMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: message,
      life: 3000
    });
  }

  private showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('ERROR'),
      detail: message,
      life: 5000
    });
  }

  private showWarningMessage(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: this.translateService.instant('WARNING'),
      detail: message,
      life: 4000
    });
  }

  // Copy Existing Modal Methods
  openCopyModal() {
    this.showCopyModal = true;
    this.copyType = 'typical';
    this.copyForm.patchValue({
      sourceRoleId: null,
      destinationRoleId: null,
      copyType: 'typical'
    });
    this.resetCustomRights();
    this.loadSourceRoles();
    this.loadDestinationRoles();

    // Subscribe to copyType changes
    this.copyForm.get('copyType')?.valueChanges.subscribe(value => {
      this.copyType = value;
      if (value === 'custom' && this.copyForm.get('sourceRoleId')?.value) {
        this.loadCustomRights();
      } else {
        this.resetCustomRights();
      }
    });
  }

  closeCopyModal() {
    this.showCopyModal = false;
    this.resetCustomRights();
    this.copyForm.reset();
    this.copyForm.patchValue({
      copyType: 'typical'
    });
  }

  onCopyTypeChange(type: 'typical' | 'custom') {
    this.copyType = type;
    this.copyForm.patchValue({ copyType: type });
    
    if (type === 'custom' && this.copyForm.get('sourceRoleId')?.value) {
      this.loadCustomRights();
    } else {
      this.resetCustomRights();
    }
  }

  onSourceRoleChange() {
    if (this.copyType === 'custom') {
      this.loadCustomRights();
    }
  }

  loadSourceRoles() {
    this.loadingSourceRoles = true;
    this.roleModuleRightService.getSourceRolesDropdownListForRoleModuleRights(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data?.dropdownListsForRoleModuleRights) {
            this.sourceRoles = response.data.dropdownListsForRoleModuleRights;
          } else {
            this.sourceRoles = [];
            this.showErrorMessage(response.message || 'Failed to load source roles');
          }
          this.loadingSourceRoles = false;
        },
        error: (error) => {
          console.error('Error loading source roles:', error);
          this.sourceRoles = [];
          this.loadingSourceRoles = false;
          this.showErrorMessage('An error occurred while loading source roles');
        }
      });
  }

  loadDestinationRoles() {
    this.loadingDestinationRoles = true;
    this.roleModuleRightService.getDestinationRolesDropdownListForRoleModuleRights(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data?.dropdownListsForRoleModuleRights) {
            this.destinationRoles = response.data.dropdownListsForRoleModuleRights;
          } else {
            this.destinationRoles = [];
            this.showErrorMessage(response.message || 'Failed to load destination roles');
          }
          this.loadingDestinationRoles = false;
        },
        error: (error) => {
          console.error('Error loading destination roles:', error);
          this.destinationRoles = [];
          this.loadingDestinationRoles = false;
          this.showErrorMessage('An error occurred while loading destination roles');
        }
      });
  }

  loadCustomRights() {
    const sourceRoleId = this.copyForm.get('sourceRoleId')?.value;
    if (!sourceRoleId) return;

    this.loadingCustomRights = true;
    this.roleModuleRightService.getUserRoleModuleRightsBySrcRoleForCustomChkBox(
      Number(sourceRoleId), 
      this.currentLang
    ).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data?.userRoleModuleRights) {
          this.customRoleRights = response.data.userRoleModuleRights;
        } else {
          this.customRoleRights = [];
          this.showErrorMessage(response.message || 'Failed to load role module rights');
        }
        this.loadingCustomRights = false;
        this.resetCustomSelection();
      },
      error: (error) => {
        console.error('Error loading custom role rights:', error);
        this.customRoleRights = [];
        this.loadingCustomRights = false;
        this.showErrorMessage('An error occurred while loading role module rights');
      }
    });
  }

  resetCustomRights() {
    this.customRoleRights = [];
    this.selectedCustomRights = [];
    this.selectAllCustom = false;
    this.loadingCustomRights = false;
  }

  resetCustomSelection() {
    this.selectedCustomRights = [];
    this.selectAllCustom = false;
  }

  onSelectAllCustom() {
    this.selectAllCustom = !this.selectAllCustom;
    this.selectedCustomRights = this.selectAllCustom ? [...this.customRoleRights] : [];
  }

  onCustomRightSelect(right: UserRoleModuleRight) {
    const index = this.selectedCustomRights.findIndex(selected => selected.recId === right.recId);
    if (index > -1) {
      this.selectedCustomRights.splice(index, 1);
    } else {
      this.selectedCustomRights.push(right);
    }
    
    this.selectAllCustom = this.selectedCustomRights.length === this.customRoleRights.length;
  }

  isCustomRightSelected(right: UserRoleModuleRight): boolean {
    return this.selectedCustomRights.some(selected => selected.recId === right.recId);
  }

  get isCopyFormValid(): boolean {
    const form = this.copyForm;
    const basicValid = form.valid;
    
    if (this.copyType === 'custom') {
      return basicValid && this.selectedCustomRights.length > 0;
    }
    
    return basicValid;
  }

  submitCopy() {
    if (!this.isCopyFormValid) {
      this.showErrorMessage(this.translateService.instant('ROLE_MODULE_RIGHTS.COPY_FORM_INVALID'));
      return;
    }

    const formValue = this.copyForm.value;
    const sourceRoleId = Number(formValue.sourceRoleId);
    const destinationRoleId = Number(formValue.destinationRoleId);

    if (this.copyType === 'typical') {
      this.submitTypicalCopy(sourceRoleId, destinationRoleId);
    } else {
      this.submitCustomCopy(destinationRoleId);
    }
  }

  private submitTypicalCopy(sourceRoleId: number, destinationRoleId: number) {
    const request = {
      sourceRoleId,
      destinationRoleId
    };

    this.roleModuleRightService.typicalUserRoleModuleRightsCopy(request, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccessMessage(response.message);
            this.closeCopyModal();
            this.loadUserRoleModuleRights();
          } else {
            this.showErrorMessage(response.message || 'Failed to copy role module rights');
          }
        },
        error: (error) => {
          console.error('Error copying role module rights:', error);
          this.showErrorMessage('An error occurred while copying role module rights');
        }
      });
  }

  private submitCustomCopy(destinationRoleId: number) {
    const selectedRecIds = this.selectedCustomRights.map(right => right.recId);
    const request = {
      destinationRoleId,
      selectedRecIds
    };

    this.roleModuleRightService.customUserRoleModuleRightsCopy(request, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccessMessage(response.message);
            this.closeCopyModal();
            this.loadUserRoleModuleRights();
          } else {
            this.showErrorMessage(response.message || 'Failed to copy selected role module rights');
          }
        },
        error: (error) => {
          console.error('Error copying selected role module rights:', error);
          this.showErrorMessage('An error occurred while copying selected role module rights');
        }
      });
  }

  // Helper method to get role name by ID
  getRoleNameById(roleId: string | number): string {
    const role = [...this.sourceRoles, ...this.destinationRoles]
      .find(r => r.value.toString() === roleId.toString());
    return role ? role.label : '';
  }

  // Create/Edit Modal Methods
  get isCreateEditFormValid(): boolean {
    if (!this.createEditForm.valid) return false;
    if (this.isEditMode) return true;
    return this.createEditForm.get('moduleIds')?.value?.length > 0;
  }

  openCreateModal() {
    this.isEditMode = false;
    this.editingRecordId = undefined;
    this.resetCreateEditForm();
    this.showCreateEditModal = true;
    this.loadRoles();
  }

  openEditModal(record: UserRoleModuleRight) {
    this.isEditMode = true;
    this.editingRecordId = record.recId;
    this.showCreateEditModal = true;
    this.loadFormDataForEdit(record.recId);
  }

  closeCreateEditModal() {
    this.showCreateEditModal = false;
    this.isEditMode = false;
    this.editingRecordId = undefined;
    this.resetCreateEditForm();
    this.loadingFormData = false;
  }

  private resetCreateEditForm() {
    this.createEditForm.reset({
      roleId: null,
      moduleIds: [],
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canAddPublicRep: false
    });
    this.roleOptions = [];
    this.moduleOptions = [];
  }

  private loadRoles() {
    this.loadingRoles = true;
    this.roleModuleRightService.getRolesDropdownListForRoleModuleRights(this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data?.dropdownListsForRoleModuleRights) {
            this.roleOptions = response.data.dropdownListsForRoleModuleRights;
          }
          this.loadingRoles = false;
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          this.showErrorMessage('Error loading roles');
          this.loadingRoles = false;
        }
      });
  }

  onRoleSelectionChange() {
    const roleId = this.createEditForm.get('roleId')?.value;
    if (roleId && !this.isEditMode) {
      this.loadModules(roleId);
      this.createEditForm.patchValue({ moduleIds: [] });
    }
  }

  private loadModules(roleId: number) {
    this.loadingModules = true;
    this.moduleOptions = [];
    
    const request = { roleId };
    this.roleModuleRightService.getModulesDropdownListForRoleModuleRightsCreateForm(request, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data) {
            this.moduleOptions = response.data.dropdownListsForRoleModuleRights;
          }
          this.loadingModules = false;
        },
        error: (error) => {
          console.error('Error loading modules:', error);
          this.showErrorMessage('Error loading modules');
          this.loadingModules = false;
        }
      });
  }

  selectAllModules() {
    const allModuleIds = this.moduleOptions.map(module => module.value);
    this.createEditForm.patchValue({ moduleIds: allModuleIds });
  }

  clearAllModules() {
    this.createEditForm.patchValue({ moduleIds: [] });
  }

  private loadFormDataForEdit(recId: number) {
    this.loadingFormData = true;
    
    // First load all roles for the dropdown
    this.loadRoles();
    
    this.roleModuleRightService.getUserRoleModuleRightById(recId, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess && response.data?.userRoleModuleRights?.length > 0) {
            const record = response.data.userRoleModuleRights[0];
            this.populateEditForm(record);
          }
          this.loadingFormData = false;
        },
        error: (error) => {
          console.error('Error loading record for edit:', error);
          this.showErrorMessage('Error loading record data');
          this.loadingFormData = false;
        }
      });
  }

  private populateEditForm(record: UserRoleModuleRight) {
    // Set form values with string conversion for roleId to match dropdown
    this.createEditForm.patchValue({
      roleId: record.roleId.toString(),
      moduleIds: [record.modId.toString()],
      canView: record.canView,
      canCreate: record.canCreate,
      canEdit: record.canEdit,
      canDelete: record.canDelete,
      canAddPublicRep: record.canAddPublicRep
    });

    // Set module options for edit mode (only current module since role is disabled)
    this.moduleOptions = [{
      label: record.modName,
      value: record.modId.toString()
    }];
  }

  submitCreateEdit() {
    if (!this.isCreateEditFormValid) {
      this.showErrorMessage(this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.FORM_INVALID'));
      return;
    }

    if (this.isEditMode) {
      this.submitUpdate();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate() {
    const formValue = this.createEditForm.value;
    const moduleIdsString = formValue.moduleIds.join(':');
    
    const request = {
      roleId: parseInt(formValue.roleId),
      modIdsString: moduleIdsString,
      canView: formValue.canView,
      canCreate: formValue.canCreate,
      canEdit: formValue.canEdit,
      canDelete: formValue.canDelete,
      canAddPublicRep: formValue.canAddPublicRep
    };

    this.roleModuleRightService.createUserRoleModuleRights(request, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccessMessage(this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.CREATE_SUCCESS'));
            this.closeCreateEditModal();
            this.loadUserRoleModuleRights();
          } else {
            this.showErrorMessage(response.message || 'Create failed');
          }
        },
        error: (error) => {
          console.error('Error creating record:', error);
          this.showErrorMessage('Error creating record');
        }
      });
  }

  private submitUpdate() {
    if (!this.editingRecordId) return;

    const formValue = this.createEditForm.value;
    
    const request = {
      rec_ID: this.editingRecordId,
      roleId: parseInt(formValue.roleId),
      mod_ID: parseInt(formValue.moduleIds[0]), // For edit, only one module
      canView: formValue.canView,
      canCreate: formValue.canCreate,
      canEdit: formValue.canEdit,
      canDelete: formValue.canDelete,
      canAddPublicRep: formValue.canAddPublicRep
    };

    this.roleModuleRightService.updateUserRoleModuleRight(request, this.currentLang)
      .subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccessMessage(this.translateService.instant('MENU.PERMISSION_MANAGEMENT.ROLE_MODULE_RIGHTS.UPDATE_SUCCESS'));
            this.closeCreateEditModal();
            this.loadUserRoleModuleRights();
          } else {
            this.showErrorMessage(response.message || 'Update failed');
          }
        },
        error: (error) => {
          console.error('Error updating record:', error);
          this.showErrorMessage('Error updating record');
        }
      });
  }

  // Update the edit method to use the new modal
  editUserRoleModuleRight(item: UserRoleModuleRight) {
    this.openEditModal(item);
  }
}
