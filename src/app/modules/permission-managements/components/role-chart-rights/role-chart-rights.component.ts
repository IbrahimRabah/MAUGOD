import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { RoleChartsService } from '../../services/role-charts.service';
import { LanguageService } from '../../../../core/services/language.service';
import { RoleChartData, RoleChartRightsResponse, Roles, RoleDropdownData, ChartDropdownData, ChartDropdownResponse } from '../../../../core/models/roleCharts';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-role-chart-rights',
  templateUrl: './role-chart-rights.component.html',
  styleUrl: './role-chart-rights.component.css',
  providers: [MessageService, ConfirmationService]
})
export class RoleChartRightsComponent implements OnInit, OnDestroy {
  // Core component state
  roleChartRights: RoleChartData[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  selectedItems: RoleChartData[] = [];
  private langSubscription?: Subscription;

  // Create Modal state
  showCreateModal = false;
  createForm!: FormGroup;
  roles: RoleDropdownData[] = [];
  charts: ChartDropdownData[] = [];
  loadingRoles = false;
  loadingCharts = false;
  selectedRole: RoleDropdownData | null = null;

  // Multi-select state for charts
  multiSelectState = {
    available: [] as ChartDropdownData[],
    selected: [] as ChartDropdownData[],
    searchTerm: ''
  };

  // Reactive Forms
  searchForm!: FormGroup;

  // Pagination
  paginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 2
  };

  constructor(
    private roleChartsService: RoleChartsService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadRoleChartRights();
    this.subscribeToLanguageChanges();
  }

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private initializeForms() {
    this.searchForm = this.fb.group({
      pageSize: [this.paginationRequest.pageSize]
    });

    this.createForm = this.fb.group({
      roleId: [null, [Validators.required]],
      chartIds: [[], [Validators.required, Validators.minLength(1)]]
    });
  }

  private subscribeToLanguageChanges() {
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = this.langService.getLangValue();
      this.loadRoleChartRights();
    });
  }

  loadRoleChartRights() {
    this.loading = true;
    const lang = this.langService.getLangValue();
    
    this.roleChartsService.getRoleChartRights(
      this.paginationRequest.pageSize,
      this.paginationRequest.pageNumber,
      lang
    ).subscribe({
      next: (response: RoleChartRightsResponse) => {
        if (response.isSuccess) {
          this.roleChartRights = response.data;
          this.totalRecords = response.totalCount;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'ERROR',
            detail: 'ROLE_CHART_RIGHTS.LOAD_ERROR'
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading role chart rights:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'ERROR',
          detail: 'ROLE_CHART_RIGHTS.LOAD_ERROR'
        });
        this.loading = false;
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
    const end = this.currentPage * this.paginationRequest.pageSize;
    return Math.min(end, this.totalRecords);
  }

  // Selection state getters
  get isAllSelected(): boolean {
    return this.roleChartRights.length > 0 && this.selectedItems.length === this.roleChartRights.length;
  }

  get isPartiallySelected(): boolean {
    return this.selectedItems.length > 0 && this.selectedItems.length < this.roleChartRights.length;
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadRoleChartRights();
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
    this.paginationRequest.pageSize = this.searchForm.get('pageSize')?.value || 10;
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadRoleChartRights();
  }

  // Selection methods
  toggleSelectAll() {
    if (this.isAllSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.roleChartRights];
    }
  }

  toggleItemSelection(item: RoleChartData) {
    const index = this.selectedItems.findIndex(selected => selected.recId === item.recId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(item);
    }
  }

  isItemSelected(item: RoleChartData): boolean {
    return this.selectedItems.some(selected => selected.recId === item.recId);
  }

  // Delete methods
  deleteRoleChartRight(item: RoleChartData) {
    this.confirmationService.confirm({
      message: this.translate.instant('ROLE_CHART_RIGHTS.CONFIRM_DELETE'),
      header: this.translate.instant('ROLE_CHART_RIGHTS.DELETE_TITLE'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const lang = this.langService.getLangValue();
        this.roleChartsService.deleteRoleChartRights(item.recId, lang).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: 'SUCCESS',
                detail: 'ROLE_CHART_RIGHTS.DELETE_SUCCESS'
              });
              this.loadRoleChartRights();
              this.selectedItems = [];
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'ERROR',
                detail: response.message || 'ROLE_CHART_RIGHTS.DELETE_ERROR'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting role chart right:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'ERROR',
              detail: 'ROLE_CHART_RIGHTS.DELETE_ERROR'
            });
          }
        });
      }
    });
  }

  deleteSelected() {
    if (this.selectedItems.length === 0) return;

    this.confirmationService.confirm({
      message: 'ROLE_CHART_RIGHTS.CONFIRM_DELETE_MULTIPLE',
      header: 'ROLE_CHART_RIGHTS.DELETE_SELECTED_TITLE',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const recIds = this.selectedItems.map(item => item.recId);
        const lang = this.langService.getLangValue();
        
        this.roleChartsService.deleteMultipleRoleChartRights({ recIds }, lang).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: 'SUCCESS',
                detail: 'ROLE_CHART_RIGHTS.DELETE_MULTIPLE_SUCCESS'
              });
              this.loadRoleChartRights();
              this.selectedItems = [];
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'ERROR',
                detail: response.message || 'ROLE_CHART_RIGHTS.DELETE_ERROR'
              });
            }
          },
          error: (error) => {
            console.error('Error deleting multiple role chart rights:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'ERROR',
              detail: 'ROLE_CHART_RIGHTS.DELETE_ERROR'
            });
          }
        });
      }
    });
  }

  // Create functionality
  openCreateModal() {
    this.showCreateModal = true;
    this.loadRoles();
    this.resetCreateForm();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetCreateForm();
  }

  private resetCreateForm() {
    this.createForm.reset();
    this.selectedRole = null;
    this.charts = [];
    this.multiSelectState = {
      available: [],
      selected: [],
      searchTerm: ''
    };
  }

  loadRoles() {
    this.loadingRoles = true;
    const lang = this.langService.getLangValue();
    
    this.roleChartsService.getRoleDropdown(lang).subscribe({
      next: (response: Roles) => {
        if (response.isSuccess) {
          this.roles = response.data;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'ERROR',
            detail: 'ROLE_CHART_RIGHTS.LOAD_ERROR'
          });
        }
        this.loadingRoles = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'ERROR',
          detail: 'ROLE_CHART_RIGHTS.LOAD_ERROR'
        });
        this.loadingRoles = false;
      }
    });
  }

  onRoleSelect(event: any) {
    const roleId = parseInt(event.target.value);
    if (roleId) {
      const role = this.roles.find(r => r.roleId === roleId);
      if (role) {
        this.selectedRole = role;
        this.createForm.patchValue({ roleId: role.roleId });
        this.loadChartsForRole(role.roleId);
        
        // Reset chart selection
        this.multiSelectState = {
          available: [],
          selected: [],
          searchTerm: ''
        };
        this.createForm.patchValue({ chartIds: [] });
      }
    } else {
      this.selectedRole = null;
      this.createForm.patchValue({ roleId: null });
      this.charts = [];
      this.multiSelectState = {
        available: [],
        selected: [],
        searchTerm: ''
      };
      this.createForm.patchValue({ chartIds: [] });
    }
  }

  loadChartsForRole(roleId: number) {
    this.loadingCharts = true;
    const lang = this.langService.getLangValue();
    
    this.roleChartsService.getChartDropdown(roleId, lang).subscribe({
      next: (response: ChartDropdownResponse) => {
        if (response.isSuccess) {
          this.charts = response.data;
          this.multiSelectState.available = [...response.data];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'ERROR',
            detail: 'ROLE_CHART_RIGHTS.LOAD_ERROR'
          });
        }
        this.loadingCharts = false;
      },
      error: (error) => {
        console.error('Error loading charts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'ERROR',
          detail: 'ROLE_CHART_RIGHTS.LOAD_ERROR'
        });
        this.loadingCharts = false;
      }
    });
  }

  // Multi-select methods for charts
  getFilteredCharts(): ChartDropdownData[] {
    if (!this.multiSelectState.searchTerm) {
      return this.multiSelectState.available;
    }
    return this.multiSelectState.available.filter(chart =>
      chart.label.toLowerCase().includes(this.multiSelectState.searchTerm.toLowerCase())
    );
  }

  isChartSelected(chart: ChartDropdownData): boolean {
    return this.multiSelectState.selected.some(selected => selected.chartId === chart.chartId);
  }

  toggleChartSelection(chart: ChartDropdownData): void {
    const index = this.multiSelectState.selected.findIndex(selected => selected.chartId === chart.chartId);
    if (index > -1) {
      this.multiSelectState.selected.splice(index, 1);
      // Add back to available
      if (!this.multiSelectState.available.some(available => available.chartId === chart.chartId)) {
        this.multiSelectState.available.push(chart);
      }
    } else {
      this.multiSelectState.selected.push(chart);
      // Remove from available
      const availableIndex = this.multiSelectState.available.findIndex(available => available.chartId === chart.chartId);
      if (availableIndex > -1) {
        this.multiSelectState.available.splice(availableIndex, 1);
      }
    }
    
    // Update form
    const chartIds = this.multiSelectState.selected.map(chart => chart.chartId);
    this.createForm.patchValue({ chartIds });
  }

  selectAllCharts(): void {
    const filtered = this.getFilteredCharts();
    filtered.forEach(chart => {
      if (!this.isChartSelected(chart)) {
        this.toggleChartSelection(chart);
      }
    });
  }

  clearAllCharts(): void {
    this.multiSelectState.selected.forEach(chart => {
      if (!this.multiSelectState.available.some(available => available.chartId === chart.chartId)) {
        this.multiSelectState.available.push(chart);
      }
    });
    this.multiSelectState.selected = [];
    this.createForm.patchValue({ chartIds: [] });
  }

  submitCreate() {
    if (this.createForm.valid) {
      const formValue = this.createForm.value;
      const lang = this.langService.getLangValue();
      
      const payload = {
        roleId: formValue.roleId,
        chartIds: formValue.chartIds
      };

      this.roleChartsService.createRoleChartRights(payload, lang).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.messageService.add({
              severity: 'success',
              summary: 'SUCCESS',
              detail: 'ROLE_CHART_RIGHTS.CREATE_SUCCESS'
            });
            this.closeCreateModal();
            this.loadRoleChartRights();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'ERROR',
              detail: response.message || 'ROLE_CHART_RIGHTS.CREATE_ERROR'
            });
          }
        },
        error: (error) => {
          console.error('Error creating role chart rights:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'ERROR',
            detail: 'ROLE_CHART_RIGHTS.CREATE_ERROR'
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.createForm.controls).forEach(key => {
        this.createForm.get(key)?.markAsTouched();
      });
    }
  }

  // Getters for form validation
  get isCreateFormValid(): boolean {
    return this.createForm.valid;
  }

  get roleError(): string | null {
    const control = this.createForm.get('roleId');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) {
        return 'ROLE_CHART_RIGHTS.ROLE_REQUIRED';
      }
    }
    return null;
  }

  get chartsError(): string | null {
    const control = this.createForm.get('chartIds');
    if (control?.touched && control?.errors) {
      if (control.errors['required'] || control.errors['minlength']) {
        return 'ROLE_CHART_RIGHTS.CHARTS_REQUIRED';
      }
    }
    return null;
  }

  // Helper methods
  getRoleName(item: RoleChartData): string {
    return this.langService.getCurrentLang() === 'ar' ? item.roleNameAr : item.roleNameEn;
  }

  getChartName(item: RoleChartData): string {
    return this.langService.getCurrentLang() === 'ar' ? item.chartNameAr : item.chartNameEn;
  }

  getDelegateName(item: RoleChartData): string {
    if (!item.delegateNameAr && !item.delegateNameEn) {
      return 'ROLE_CHART_RIGHTS.NO_DELEGATE';
    }
    return this.langService.getCurrentLang() === 'ar' 
      ? (item.delegateNameAr || 'ROLE_CHART_RIGHTS.NO_DELEGATE')
      : (item.delegateNameEn || 'ROLE_CHART_RIGHTS.NO_DELEGATE');
  }
}
