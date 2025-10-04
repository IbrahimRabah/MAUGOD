import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import { RequestRouteService } from '../../services/request-route.service';
import { LanguageService } from '../../../../core/services/language.service';
import { 
  DropdownItem,
  CreateRequestApprovalRouteRequest,
  RequestApprovalRouteCreateDto,
  RouteDetailsLevel,
  RequestApprovalRouteItem,
  UpdateRequestApprovalRouteRequest,
  RequestApprovalRouteUpdateDto
} from '../../../../core/models/requestRoute';

@Component({
  selector: 'app-create-request-approval-route-modal',
  templateUrl: './create-request-approval-route-modal.component.html',
  styleUrl: './create-request-approval-route-modal.component.css',
  providers: [MessageService]
})
export class CreateRequestApprovalRouteModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() showModal = false;
  @Input() editMode = false;
  @Input() editRouteId: number | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() routeCreated = new EventEmitter<void>();

  // Form
  createForm!: FormGroup;
  
  // Dropdown data
  statuses: DropdownItem[] = [];
  requestLevels: DropdownItem[] = [];
  afterLimitActions: DropdownItem[] = [];
  levels: DropdownItem[] = [];
  employees: DropdownItem[] = [];
  managers: DropdownItem[] = [];
  departmentsOrManagers: DropdownItem[] = [];
  branchesOrManagers: DropdownItem[] = [];
  roles: DropdownItem[] = [];
  
  // Filtered dropdown data for search
  filteredStatuses: DropdownItem[] = [];
  filteredRequestLevels: DropdownItem[] = [];
  filteredAfterLimitActions: DropdownItem[] = [];
  filteredLevels: DropdownItem[] = [];
  filteredEmployees: DropdownItem[] = [];
  filteredManagers: DropdownItem[] = [];
  filteredDepartments: DropdownItem[] = [];
  filteredDepartmentsOrManagers: DropdownItem[] = [];
  filteredBranches: DropdownItem[] = [];
  filteredBranchesOrManagers: DropdownItem[] = [];
  filteredRoles: DropdownItem[] = [];
  
  // Search terms
  statusSearchTerm = '';
  requestLevelsSearchTerm = '';
  afterLimitActionsSearchTerm = '';
  levelsSearchTerm = '';
  employeesSearchTerm = '';
  managersSearchTerm = '';
  departmentsSearchTerm = '';
  branchesSearchTerm = '';
  rolesSearchTerm = '';
  
  // Dropdown open states
  openDropdown = '';
  statusDropdownOpen = false;
  requestLevelsDropdownOpen = false;
  afterLimitActionsDropdownOpen = false;
  levelsDropdownOpen = false;
  employeesDropdownOpen = false;
  managersDropdownOpen = false;
  departmentsDropdownOpen = false;
  branchesDropdownOpen = false;
  rolesDropdownOpen = false;
  
  // Loading states
  loadingStatuses = false;
  loadingRequestLevels = false;
  loadingAfterLimitActions = false;
  loadingLevels = false;
  loadingEmployees = false;
  loadingManagers = false;
  loadingDepartmentsOrManagers = false;
  loadingBranchesOrManagers = false;
  loadingRoles = false;
  submitting = false;
  loadingEditData = false;
  
  // Options for radio buttons
  forEveryoneOptions = [
    { label: 'CREATE_REQUEST_APPROVAL_ROUTE.FOR_EVERYONE', value: 1 },
    { label: 'CREATE_REQUEST_APPROVAL_ROUTE.FOR_GROUP', value: 0 }
  ];
  
  yesNoOptions = [
    { label: 'CREATE_REQUEST_APPROVAL_ROUTE.YES', value: 1 },
    { label: 'CREATE_REQUEST_APPROVAL_ROUTE.NO', value: 0 }
  ];
  
  // Selected values
  selectedForEveryone = 1; // Default to "For Everyone"
  selectedRequestLevels = 0; // Default to 0 level
  
  private langSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic

  constructor(
    private fb: FormBuilder,
    private requestRouteService: RequestRouteService,
    public langService: LanguageService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.initializeLanguage();
    this.initializeFilteredArrays();
  }

  private initializeFilteredArrays(): void {
    // Initialize filtered arrays to prevent null reference errors
    this.filteredStatuses = [];
    this.filteredRequestLevels = [];
    this.filteredAfterLimitActions = [];
    this.filteredLevels = [];
    this.filteredEmployees = [];
    this.filteredManagers = [];
    this.filteredDepartmentsOrManagers = [];
    this.filteredBranchesOrManagers = [];
    this.filteredRoles = [];
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Modal ngOnChanges called:', changes);
    console.log('Current showModal state:', this.showModal);
    console.log('Current editMode state:', this.editMode);
    
    if (changes['showModal']) {
      console.log('showModal changed from', changes['showModal'].previousValue, 'to', changes['showModal'].currentValue);
      
      if (changes['showModal'].currentValue) {
        console.log('Modal opened, loading dropdown data...');
        this.loadDropdownData();

        if (!this.editMode) {
            this.resetForm();
          } 
                
        // If in edit mode and editRouteId is provided, load the route data
        if (this.editMode && this.editRouteId) {
          this.loadRouteForEdit();
        }
      }
    }
  }

  // request-details-modal.component.ts


  private initializeForm() {
    this.createForm = this.fb.group({
      forEveryoneId: [1, Validators.required],
      // Fields for both options
      stsId: [''],
      reqLevelId: [0, Validators.required],
      note: [''],
      isActive: [true, Validators.required], // Add isActive control with default true
      // Fields for "group" option
      empId: [''],
      mgrOfDeptId: [''],
      mgrOfBranchId: [''],
      deptId: [''],
      branchId: [''],
      roleId: [''],
      levelDetails: this.fb.array([])
    });
    
    // Initialize with one level by default
    this.onRequestLevelsChange();
  }

  private initializeLanguage() {
    this.currentLang = this.langService.getLangValue();
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
    });
  }

  private loadDropdownData() {
    console.log('Loading all dropdown data...');
    this.loadStatuses();
    this.loadRequestLevels();
    this.loadAfterLimitActions();
    this.loadLevels();
    this.loadEmployees();
    this.loadManagers();
    this.loadDepartmentsOrManagers();
    this.loadBranchesOrManagers();
    this.loadRoles();
  }

  private loadStatuses() {
    this.loadingStatuses = true;
    console.log('Loading statuses...');
    this.requestRouteService.getStatuesDropdownListForRequestApprovalRoute(this.currentLang)
      .subscribe({
        next: (response) => {
          console.log('Statuses response:', response);
          if (response.isSuccess) {
            this.statuses = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
            this.filteredStatuses = [...this.statuses];
            console.log('Statuses loaded:', this.statuses);
          }
          this.loadingStatuses = false;
        },
        error: (error) => {
          console.error('Error loading statuses:', error);
          this.loadingStatuses = false;
        }
      });
  }

  private loadRequestLevels() {
    this.loadingRequestLevels = true;
    console.log('Loading request levels...');
    this.requestRouteService.getRequestLevelsDropdownListForTimeTransactionApproval(this.currentLang)
      .subscribe({
        next: (response) => {
          console.log('Request levels response:', response);
          if (response.isSuccess) {
            this.requestLevels = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
            this.filteredRequestLevels = [...this.requestLevels];
            console.log('Request levels loaded:', this.requestLevels);        
          }
          this.loadingRequestLevels = false;
        },
        error: (error) => {
          console.error('Error loading request levels:', error);
          this.loadingRequestLevels = false;
        }
      });
  }

  private loadAfterLimitActions() {
    this.loadingAfterLimitActions = true;
    console.log('Loading after limit actions...');
    this.requestRouteService.getAfterLimitActionsDropdownListForTimeTransactionApproval(this.currentLang)
      .subscribe({
        next: (response) => {
          console.log('After limit actions response:', response);
          if (response.isSuccess) {
            this.afterLimitActions = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
            this.filteredAfterLimitActions = [...this.afterLimitActions];
            console.log('After limit actions loaded:', this.afterLimitActions);
          }
          this.loadingAfterLimitActions = false;
        },
        error: (error) => {
          console.error('Error loading after limit actions:', error);
          this.loadingAfterLimitActions = false;
        }
      });
  }

  private loadLevels() {
    this.loadingLevels = true;
    console.log('Loading levels...');
    this.requestRouteService.getLevelsDropdownListForTimeTransactionApproval(this.currentLang)
      .subscribe({
        next: (response) => {
          console.log('Levels response:', response);
          if (response.isSuccess) {
            this.levels = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
            this.filteredLevels = [...this.levels];
            console.log('Levels loaded:', this.levels);
          }
          this.loadingLevels = false;
        },
        error: (error) => {
          console.error('Error loading levels:', error);
          this.loadingLevels = false;
        }
      });
  }

  private loadEmployees() {
    this.loadingEmployees = true;
    console.log('Loading employees...');
    this.requestRouteService.getEmployeesDropdownListForTimeTransactionApproval(this.currentLang)
      .subscribe({
        next: (response) => {
          console.log('Employees response:', response);
          if (response.isSuccess) {
            this.employees = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
            this.filteredEmployees = [...this.employees];
            console.log('Employees loaded:', this.employees);
          }
          this.loadingEmployees = false;
        },
        error: (error) => {
          console.error('Error loading employees:', error);
          this.loadingEmployees = false;
        }
      });
  }

  private loadManagers() {
    this.loadingManagers = true;
    console.log('Loading managers...');
    this.requestRouteService.getManagersDropdownListForTimeTransactionApproval(this.currentLang)
      .subscribe({
        next: (response) => {
          console.log('Managers response:', response);
          if (response.isSuccess) {
            this.managers = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
            this.filteredManagers = [...this.managers];
            console.log('Managers loaded:', this.managers);
          }
          this.loadingManagers = false;
        },
        error: (error) => {
          console.error('Error loading managers:', error);
          this.loadingManagers = false;
        }
      });
  }

  private loadDepartmentsOrManagers() {
    this.loadingDepartmentsOrManagers = true;
    console.log('Loading departments or managers...');
    this.requestRouteService.getDepartmentsOrMgrOfDeptsDropdownListForTimeTransactionApproval(this.currentLang)
      .subscribe({
        next: (response) => {
          console.log('Departments or managers response:', response);
          if (response.isSuccess) {
            this.departmentsOrManagers = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
            this.filteredDepartmentsOrManagers = [...this.departmentsOrManagers];
            console.log('Departments or managers loaded:', this.departmentsOrManagers);
          }
          this.loadingDepartmentsOrManagers = false;
        },
        error: (error) => {
          console.error('Error loading departments or managers:', error);
          this.loadingDepartmentsOrManagers = false;
        }
      });
  }

  private loadBranchesOrManagers() {
    this.loadingBranchesOrManagers = true;
    console.log('Loading branches or managers...');
    this.requestRouteService.getBranchsOrMgrOfBranchsDropdownListForTimeTransactionApproval(this.currentLang)
      .subscribe({
        next: (response) => {
          console.log('Branches or managers response:', response);
          if (response.isSuccess) {
            this.branchesOrManagers = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
            this.filteredBranchesOrManagers = [...this.branchesOrManagers];
            console.log('Branches or managers loaded:', this.branchesOrManagers);
          }
          this.loadingBranchesOrManagers = false;
        },
        error: (error) => {
          console.error('Error loading branches or managers:', error);
          this.loadingBranchesOrManagers = false;
        }
      });
  }

  private loadRoles() {
    this.loadingRoles = true;
    console.log('Loading roles...');
    this.requestRouteService.getRolesDropdownListForTimeTransactionApproval(this.currentLang)
      .subscribe({
        next: (response) => {
          console.log('Roles response:', response);
          if (response.isSuccess) {
            this.roles = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
            this.filteredRoles = [...this.roles];
            console.log('Roles loaded:', this.roles);
          }
          this.loadingRoles = false;
        },
        error: (error) => {
          console.error('Error loading roles:', error);
          this.loadingRoles = false;
        }
      });
  }

  private loadRouteForEdit() {
  if (!this.editRouteId) return;
  
  this.loadingEditData = true;
  console.log('Loading route for edit, ID:', this.editRouteId);
  
  this.requestRouteService.getRequestApprovalRouteById({
    routeId: this.editRouteId,
    lang: this.currentLang
  }).subscribe({
    next: (response) => {
      console.log('Edit route response:', response);
      if (response.isSuccess && response.data.requestApprovalRoutes.length > 0) {
        const routeData = response.data.requestApprovalRoutes[0];
          this.populateFormWithRouteData(routeData);
      } else {
        this.showErrorMessage('CREATE_REQUEST_APPROVAL_ROUTE.FAILED_LOAD_ROUTE');
      }
      this.loadingEditData = false;
    },
    error: (error) => {
      console.error('Error loading route for edit:', error);
      this.showErrorMessage('CREATE_REQUEST_APPROVAL_ROUTE.ERROR_LOADING_DATA');
      this.loadingEditData = false;
    }
  });
}

  private populateFormWithRouteData(routeData: RequestApprovalRouteItem) {
    console.log('Populating form with route data:', routeData);
    
    // Update selectedForEveryone based on route data
    this.selectedForEveryone = routeData.forEveryoneId;

    // Patch form values
    this.createForm.patchValue({
      forEveryoneId: routeData.forEveryoneId,
      stsId: routeData.stsId || null,
      reqLevelId: routeData.reqLevelId,
      note: routeData.note || null,
      empId: routeData.empId || null,
      mgrOfDeptId: routeData.deptIdMgr || null,
      mgrOfBranchId: routeData.branchIdMgr || null,
      deptId: routeData.deptId || null,
      branchId: routeData.branchId || null,
      roleId: routeData.roleId || null,
      isActive: routeData.isActive ?? true
    });


    // Set selected request levels and recreate level details
    this.selectedRequestLevels = routeData.reqLevelId;
    this.onRequestLevelsChange();
  }

  // Getters for form arrays
  get levelDetailsArray(): FormArray {
    return this.createForm.get('levelDetails') as FormArray;
  }

// Event handlers
onForEveryoneChange() {
  this.selectedForEveryone = this.createForm.get('forEveryoneId')?.value;

  if (this.selectedForEveryone === 0) {
    // For group option → keep fields but make them optional
    this.createForm.get('empId')?.clearValidators();
    this.createForm.get('mgrOfDeptId')?.clearValidators();
    this.createForm.get('mgrOfBranchId')?.clearValidators();
    this.createForm.get('deptId')?.clearValidators();
    this.createForm.get('branchId')?.clearValidators();
    this.createForm.get('roleId')?.clearValidators();
  } else {
    // For everyone option → also optional
    this.createForm.get('empId')?.clearValidators();
    this.createForm.get('mgrOfDeptId')?.clearValidators();
    this.createForm.get('mgrOfBranchId')?.clearValidators();
    this.createForm.get('deptId')?.clearValidators();
    this.createForm.get('branchId')?.clearValidators();
    this.createForm.get('roleId')?.clearValidators();
  }

  // Update validation status
  this.createForm.get('empId')?.updateValueAndValidity();
  this.createForm.get('mgrOfDeptId')?.updateValueAndValidity();
  this.createForm.get('mgrOfBranchId')?.updateValueAndValidity();
  this.createForm.get('deptId')?.updateValueAndValidity();
  this.createForm.get('branchId')?.updateValueAndValidity();
  this.createForm.get('roleId')?.updateValueAndValidity();
}


  onRequestLevelsChange() {
    const levels = this.createForm.get('reqLevelId')?.value || 0;
    this.selectedRequestLevels = levels;
    
    // Clear existing level details
    while (this.levelDetailsArray.length !== 0) {
      this.levelDetailsArray.removeAt(0);
    }
    
    // Add form groups for each level
    for (let i = 0; i < levels; i++) {
      this.levelDetailsArray.push(this.createLevelDetailsFormGroup());
    }
  }

  private createLevelDetailsFormGroup(): FormGroup {
    return this.fb.group({
      // Dynamic options
      dynDirectMgr: [0],
      dynDirectMgrLevel: [''],
      dynDirectMgrDaysLimits: [''],
      dynDirectMgrAfterLimitAction: [''],
      
      dynMgrOfDept: [0],
      dynMgrOfDeptLevel: [''],
      dynMgrOfDeptDaysLimits: [''],
      dynMgrOfDeptAfterLimitAction: [''],
      
      dynMgrOfBranch: [0],
      dynMgrOfBranchLevel: [''],
      dynMgrOfBranchDaysLimits: [''],
      dynMgrOfBranchAfterLimitAction: [''],
      
      // Dropdown selections
      mgrId: [''],
      mgrIdDaysLimits: [''],
      mgrIdAfterLimitAction: [''],
      
      mgrOfDeptId: [''],
      mgrOfDeptIdDaysLimits: [''],
      mgrOfDeptIdAfterLimitAction: [''],
      
      mgrOfBranchId: [''],
      mgrOfBranchIdDaysLimits: [''],
      mgrOfBranchIdAfterLimitAction: [''],
      
      deptId: [''],
      deptIdDaysLimits: [''],
      deptIdAfterLimitAction: [''],
      
      branchId: [''],
      branchIdDaysLimits: [''],
      branchIdAfterLimitAction: [''],
      
      roleId: [''],
      roleIdDaysLimits: [''],
      roleIdAfterLimitAction: [''],
      
      noteDetails: ['']
    });
  }

  // Helper methods for checking dynamic selections
  isDynDirectMgrSelected(levelIndex: number): boolean {
    return this.levelDetailsArray.at(levelIndex)?.get('dynDirectMgr')?.value === 1;
  }

  isDynMgrOfDeptSelected(levelIndex: number): boolean {
    return this.levelDetailsArray.at(levelIndex)?.get('dynMgrOfDept')?.value === 1;
  }

  isDynMgrOfBranchSelected(levelIndex: number): boolean {
    return this.levelDetailsArray.at(levelIndex)?.get('dynMgrOfBranch')?.value === 1;
  }

  // Unified search method for all dropdowns
  private filterDropdownOptions<T extends DropdownItem>(
    options: T[], 
    searchTerm: string
  ): T[] {
    if (!searchTerm.trim()) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Search methods for each dropdown type
  searchStatuses(term: string): void {
    this.statusSearchTerm = term;
    this.filteredStatuses = this.filterDropdownOptions(this.statuses, term);
  }

  searchRequestLevels(term: string): void {
    this.requestLevelsSearchTerm = term;
    this.filteredRequestLevels = this.filterDropdownOptions(this.requestLevels, term);
  }

  searchAfterLimitActions(term: string): void {
    this.afterLimitActionsSearchTerm = term;
    this.filteredAfterLimitActions = this.filterDropdownOptions(this.afterLimitActions, term);
  }

  searchLevels(term: string): void {
    this.levelsSearchTerm = term;
    this.filteredLevels = this.filterDropdownOptions(this.levels, term);
  }

  searchEmployees(term: string): void {
    this.employeesSearchTerm = term;
    this.filteredEmployees = this.filterDropdownOptions(this.employees, term);
  }
  searchManagers(term: string): void {
    this.managersSearchTerm = term;
    this.filteredManagers = this.filterDropdownOptions(this.managers, term);
  }

  searchDepartments(term: string): void {
    this.departmentsSearchTerm = term;
    this.filteredDepartmentsOrManagers = this.filterDropdownOptions(this.departmentsOrManagers, term);
  }

  searchBranches(term: string): void {
    this.branchesSearchTerm = term;
    this.filteredBranchesOrManagers = this.filterDropdownOptions(this.branchesOrManagers, term);
  }

  searchRoles(term: string): void {
    this.rolesSearchTerm = term;
    this.filteredRoles = this.filterDropdownOptions(this.roles, term);
  }

  // Methods to select options and close dropdowns
  selectStatus(status: DropdownItem) {
    this.createForm.patchValue({ stsId: status.value });
    this.statusDropdownOpen = false;
    this.statusSearchTerm = '';
  }

  selectRequestLevel(level: DropdownItem) {
    this.createForm.patchValue({ reqLevelId: level.value });
    this.requestLevelsDropdownOpen = false;
    this.requestLevelsSearchTerm = '';
    this.onRequestLevelsChange();
  }

  selectAfterLimitAction(action: DropdownItem, levelIndex: number, field: string) {
    const levelControl = this.levelDetailsArray.at(levelIndex);
    levelControl?.patchValue({ [field]: action.value });
    this.afterLimitActionsDropdownOpen = false;
    this.afterLimitActionsSearchTerm = '';
  }

  selectLevel(level: DropdownItem, levelIndex: number, field: string) {
    const levelControl = this.levelDetailsArray.at(levelIndex);
    levelControl?.patchValue({ [field]: level.value });
    this.levelsDropdownOpen = false;
    this.levelsSearchTerm = '';
  }

  selectEmployee(employee: DropdownItem, levelIndex: number) {
    const levelControl = this.levelDetailsArray.at(levelIndex);
    levelControl?.patchValue({ mgrId: employee.value });
    this.employeesDropdownOpen = false;
    this.employeesSearchTerm = '';
  }

  selectManager(manager: DropdownItem, levelIndex: number) {
    const levelControl = this.levelDetailsArray.at(levelIndex);
    levelControl?.patchValue({ mgrId: manager.value });
    this.managersDropdownOpen = false;
    this.managersSearchTerm = '';
  }

  selectDepartment(dept: DropdownItem, levelIndex: number, field: string) {
    const levelControl = this.levelDetailsArray.at(levelIndex);
    levelControl?.patchValue({ [field]: dept.value });
    this.departmentsDropdownOpen = false;
    this.departmentsSearchTerm = '';
  }

  selectBranch(branch: DropdownItem, levelIndex: number, field: string) {
    const levelControl = this.levelDetailsArray.at(levelIndex);
    levelControl?.patchValue({ [field]: branch.value });
    this.branchesDropdownOpen = false;
    this.branchesSearchTerm = '';
  }

  selectRole(role: DropdownItem, levelIndex: number) {
    const levelControl = this.levelDetailsArray.at(levelIndex);
    levelControl?.patchValue({ roleId: role.value });
    this.rolesDropdownOpen = false;
    this.rolesSearchTerm = '';
  }

  // Get selected option label
  getSelectedStatusLabel(): string {
    const selectedValue = this.createForm.get('stsId')?.value;
    return this.statuses.find(s => s.value === selectedValue)?.label || 'Select Status';
  }

  getSelectedRequestLevelLabel(): string {
    const selectedValue = this.createForm.get('reqLevelId')?.value;
    return this.requestLevels.find(l => l.value === selectedValue)?.label || 'Select Request Level';
  }

  getSelectedAfterLimitActionLabel(levelIndex: number, field: string): string {
    const selectedValue = this.levelDetailsArray.at(levelIndex)?.get(field)?.value;
    return this.afterLimitActions.find(a => a.value === selectedValue)?.label || 'Select Action';
  }

  getSelectedLevelLabel(levelIndex: number, field: string): string {
    const selectedValue = this.levelDetailsArray.at(levelIndex)?.get(field)?.value;
    return this.levels.find(l => l.value === selectedValue)?.label || 'Select Level';
  }

  getSelectedEmployeeLabel(levelIndex: number): string {
    const selectedValue = this.levelDetailsArray.at(levelIndex)?.get('mgrId')?.value;
    return this.employees.find(e => e.value === selectedValue)?.label || 'Select Manager';
  }
  getSelectedManagerLabel(levelIndex: number): string {
    const selectedValue = this.levelDetailsArray.at(levelIndex)?.get('mgrId')?.value;
    return this.managers.find(m => m.value === selectedValue)?.label || 'Select Manager';
  }

  getSelectedDepartmentLabel(levelIndex: number, field: string): string {
    const selectedValue = this.levelDetailsArray.at(levelIndex)?.get(field)?.value;
    return this.departmentsOrManagers.find(d => d.value === selectedValue)?.label || 'Select Department';
  }

  getSelectedBranchLabel(levelIndex: number, field: string): string {
    const selectedValue = this.levelDetailsArray.at(levelIndex)?.get(field)?.value;
    return this.branchesOrManagers.find(b => b.value === selectedValue)?.label || 'Select Branch';
  }

  getSelectedRoleLabel(levelIndex: number): string {
    const selectedValue = this.levelDetailsArray.at(levelIndex)?.get('roleId')?.value;
    return this.roles.find(r => r.value === selectedValue)?.label || 'Select Role';
  }

  // Level label generator
  getLevelLabel(index: number): string {
    const levelNames = [
      'First Level', 'Second Level', 'Third Level', 'Fourth Level', 'Fifth Level',
      'Sixth Level', 'Seventh Level', 'Eighth Level', 'Ninth Level'
    ];
    return levelNames[index] || `Level ${index + 1}`;
  }

  onSubmit() {
    if (this.createForm.invalid) {
      this.markFormGroupTouched();
      this.showErrorMessage('CREATE_REQUEST_APPROVAL_ROUTE.FORM_INVALID');
      return;
    }

    this.submitting = true;
    const formValue = this.createForm.value;
    
    function toNullableInt(value: any): number | null {
      return value ? parseInt(value) : null;
    }

    const createDto: RequestApprovalRouteCreateDto = {
      empId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.empId) : null,
      mgrOfDeptId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.mgrOfDeptId) : null,
      mgrOfBranchId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.mgrOfBranchId) : null,
      deptId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.deptId) : null,
      branchId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.branchId) : null,
      roleId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.roleId) : null,
      stsId: formValue.stsId && formValue.stsId.trim() !== "" 
              ? formValue.stsId 
              : null,
      forEveryoneId: formValue.forEveryoneId,
      reqLevelId: formValue.reqLevelId,
      isActive: formValue.isActive ?? true,
      note: formValue.note
    };

    const updateDto: RequestApprovalRouteUpdateDto = {
      empId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.empId) : null,
      mgrOfDeptId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.mgrOfDeptId) : null,
      mgrOfBranchId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.mgrOfBranchId) : null,
      deptId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.deptId) : null,
      branchId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.branchId) : null,
      roleId: formValue.forEveryoneId === 0 ? toNullableInt(formValue.roleId) : null,
      stsId: formValue.stsId && formValue.stsId.trim() !== "" 
              ? formValue.stsId 
              : null,
      forEveryoneId: formValue.forEveryoneId,
      reqLevelId: formValue.reqLevelId,
      isActive: formValue.isActive ?? true,
      note: formValue.note
    };


    // Add level details
    formValue.levelDetails.forEach((levelDetail: any, index: number) => {
      const levelKey = `detailsLevel${index + 1}` as keyof RequestApprovalRouteCreateDto;
      (createDto as any)[levelKey] = {
        dynDirectMgr: levelDetail.dynDirectMgr || null,
        dynDirectMgrLevel: parseInt(levelDetail.dynDirectMgrLevel) || null,
        dynDirectMgrDaysLimits: parseInt(levelDetail.dynDirectMgrDaysLimits) || null,
        dynDirectMgrAfterLimitAction: parseInt(levelDetail.dynDirectMgrAfterLimitAction) || null,
        dynMgrOfDept: levelDetail.dynMgrOfDept || null,
        dynMgrOfDeptLevel: parseInt(levelDetail.dynMgrOfDeptLevel) || null,
        dynMgrOfDeptDaysLimits: parseInt(levelDetail.dynMgrOfDeptDaysLimits) || null,
        dynMgrOfDeptAfterLimitAction: parseInt(levelDetail.dynMgrOfDeptAfterLimitAction) || null,
        dynMgrOfBranch: levelDetail.dynMgrOfBranch || null,
        dynMgrOfBranchLevel: parseInt(levelDetail.dynMgrOfBranchLevel) || null,
        dynMgrOfBranchDaysLimits: parseInt(levelDetail.dynMgrOfBranchDaysLimits) || null,
        dynMgrOfBranchAfterLimitAction: parseInt(levelDetail.dynMgrOfBranchAfterLimitAction) || null,
        mgrId: parseInt(levelDetail.mgrId) || null,
        mgrIdDaysLimits: parseInt(levelDetail.mgrIdDaysLimits) || null,
        mgrIdAfterLimitAction: parseInt(levelDetail.mgrIdAfterLimitAction) || null,
        mgrOfDeptId: parseInt(levelDetail.mgrOfDeptId) || null,
        mgrOfDeptIdDaysLimits: parseInt(levelDetail.mgrOfDeptIdDaysLimits) || null,
        mgrOfDeptIdAfterLimitAction: parseInt(levelDetail.mgrOfDeptIdAfterLimitAction) || null,
        mgrOfBranchId: parseInt(levelDetail.mgrOfBranchId) || null,
        mgrOfBranchIdDaysLimits: parseInt(levelDetail.mgrOfBranchIdDaysLimits) || null,
        mgrOfBranchIdAfterLimitAction: parseInt(levelDetail.mgrOfBranchIdAfterLimitAction) || null,
        deptId: parseInt(levelDetail.deptId) || null,
        deptIdDaysLimits: parseInt(levelDetail.deptIdDaysLimits) || null,
        deptIdAfterLimitAction: parseInt(levelDetail.deptIdAfterLimitAction) || null,
        branchId: parseInt(levelDetail.branchId) || null,
        branchIdDaysLimits: parseInt(levelDetail.branchIdDaysLimits) || null,
        branchIdAfterLimitAction: parseInt(levelDetail.branchIdAfterLimitAction) || null,
        roleId: parseInt(levelDetail.roleId) || null,
        roleIdDaysLimits: parseInt(levelDetail.roleIdDaysLimits) || null,
        roleIdAfterLimitAction: parseInt(levelDetail.roleIdAfterLimitAction) || null,
        noteDetails: levelDetail.noteDetails || ''
      } as RouteDetailsLevel;
    });

     // Add level details
    formValue.levelDetails.forEach((levelDetail: any, index: number) => {
      const levelKey = `detailsLevel${index + 1}` as keyof RequestApprovalRouteUpdateDto;
      (updateDto as any)[levelKey] = {
        dynDirectMgr: levelDetail.dynDirectMgr || 0,
        dynDirectMgrLevel: parseInt(levelDetail.dynDirectMgrLevel) || 0,
        dynDirectMgrDaysLimits: parseInt(levelDetail.dynDirectMgrDaysLimits) || 0,
        dynDirectMgrAfterLimitAction: parseInt(levelDetail.dynDirectMgrAfterLimitAction) || 0,
        dynMgrOfDept: levelDetail.dynMgrOfDept || 0,
        dynMgrOfDeptLevel: parseInt(levelDetail.dynMgrOfDeptLevel) || 0,
        dynMgrOfDeptDaysLimits: parseInt(levelDetail.dynMgrOfDeptDaysLimits) || 0,
        dynMgrOfDeptAfterLimitAction: parseInt(levelDetail.dynMgrOfDeptAfterLimitAction) || 0,
        dynMgrOfBranch: levelDetail.dynMgrOfBranch || 0,
        dynMgrOfBranchLevel: parseInt(levelDetail.dynMgrOfBranchLevel) || 0,
        dynMgrOfBranchDaysLimits: parseInt(levelDetail.dynMgrOfBranchDaysLimits) || 0,
        dynMgrOfBranchAfterLimitAction: parseInt(levelDetail.dynMgrOfBranchAfterLimitAction) || 0,
        mgrId: parseInt(levelDetail.mgrId) || 0,
        mgrIdDaysLimits: parseInt(levelDetail.mgrIdDaysLimits) || 0,
        mgrIdAfterLimitAction: parseInt(levelDetail.mgrIdAfterLimitAction) || 0,
        mgrOfDeptId: parseInt(levelDetail.mgrOfDeptId) || 0,
        mgrOfDeptIdDaysLimits: parseInt(levelDetail.mgrOfDeptIdDaysLimits) || 0,
        mgrOfDeptIdAfterLimitAction: parseInt(levelDetail.mgrOfDeptIdAfterLimitAction) || 0,
        mgrOfBranchId: parseInt(levelDetail.mgrOfBranchId) || 0,
        mgrOfBranchIdDaysLimits: parseInt(levelDetail.mgrOfBranchIdDaysLimits) || 0,
        mgrOfBranchIdAfterLimitAction: parseInt(levelDetail.mgrOfBranchIdAfterLimitAction) || 0,
        deptId: parseInt(levelDetail.deptId) || 0,
        deptIdDaysLimits: parseInt(levelDetail.deptIdDaysLimits) || 0,
        deptIdAfterLimitAction: parseInt(levelDetail.deptIdAfterLimitAction) || 0,
        branchId: parseInt(levelDetail.branchId) || 0,
        branchIdDaysLimits: parseInt(levelDetail.branchIdDaysLimits) || 0,
        branchIdAfterLimitAction: parseInt(levelDetail.branchIdAfterLimitAction) || 0,
        roleId: parseInt(levelDetail.roleId) || 0,
        roleIdDaysLimits: parseInt(levelDetail.roleIdDaysLimits) || 0,
        roleIdAfterLimitAction: parseInt(levelDetail.roleIdAfterLimitAction) || 0,
        noteDetails: levelDetail.noteDetails || ''
      } as RouteDetailsLevel;
    });

    const createRequest: CreateRequestApprovalRouteRequest = {
      requestApprovalRouteCreateDto: createDto
    };

    const updateRequest: UpdateRequestApprovalRouteRequest = {
      requestApprovalRouteUpdateDto: createDto
    };

    // Add routeId for update operation
    if (this.editMode && this.editRouteId) {
      (createDto as any).routeId = this.editRouteId;
    }

    const serviceCall = this.editMode ? 
      this.requestRouteService.updateRequestApprovalRoute(updateRequest, this.currentLang) :
      this.requestRouteService.createRequestApprovalRoute(createRequest, this.currentLang);

    serviceCall.subscribe({
        next: (response) => {
          if (response.isSuccess) {
            const successMessage = this.editMode ? 
              'CREATE_REQUEST_APPROVAL_ROUTE.SUCCESS_UPDATE_MESSAGE' : 
              'CREATE_REQUEST_APPROVAL_ROUTE.SUCCESS_MESSAGE';
            this.showSuccessMessage(successMessage);
            this.routeCreated.emit();
            this.onClose();
          } else {
            this.showErrorMessage(response.message || 'CREATE_REQUEST_APPROVAL_ROUTE.ERROR_MESSAGE');
          }
          this.submitting = false;
          this.onClose();
        },
        error: (error) => {
          console.error('Error with request approval route:', error);
          this.showErrorMessage(error.error?.message || 'CREATE_REQUEST_APPROVAL_ROUTE.ERROR_MESSAGE');
          this.submitting = false;
          this.onClose();
        }
      });
  }

  private markFormGroupTouched() {
    Object.keys(this.createForm.controls).forEach(key => {
      const control = this.createForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(innerKey => {
              arrayControl.get(innerKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }

  private resetForm() {
    this.createForm.reset();
    this.createForm.patchValue({
      forEveryoneId: 1,
      reqLevelId: 0,
      empId: '',
      mgrOfDeptId: '',
      mgrOfBranchId: '',
      deptId: '',
      branchId: '',
      roleId: '',
      stsId: '',
      note: '',
      isActive: true
    });
    this.selectedForEveryone = 1;
    this.selectedRequestLevels = 0;
    this.onForEveryoneChange(); // Update validators
    this.onRequestLevelsChange();
  }

  onClose() {
    this.closeModal.emit();
  }

  // Helper methods for form validation
  isFieldRequired(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  isLevelFieldRequired(levelIndex: number, fieldName: string): boolean {
    const field = this.levelDetailsArray.at(levelIndex)?.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  // Message helper methods
  private showSuccessMessage(messageKey: string) {
    this.translateService.get(messageKey).subscribe(translatedMessage => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: translatedMessage,
        life: 3000
      });
    });
  }

  private showErrorMessage(messageKey: string) {
    this.translateService.get(messageKey).subscribe(translatedMessage => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: translatedMessage,
        life: 5000
      });
    });
  }

  // Helper method to select dropdown option and close dropdown
  selectOption(formControlName: string, value: any, dropdownType: string): void {
    this.createForm.get(formControlName)?.setValue(value);
    this.closeAllDropdowns();
  }

  // Select dropdown option for level details
  selectDropdownOption(fieldName: string, value: any, levelIndex: number): void {
    const levelControl = this.levelDetailsArray.at(levelIndex);
    levelControl?.get(fieldName)?.setValue(value);
    this.closeAllDropdowns();
  }

  // Get display text for selected dropdown option
  getSelectedText(options: DropdownItem[], selectedValue: any): string {
    if (!selectedValue || !options?.length) return '';
    const selectedOption = options.find(option => option.value === selectedValue);
    return selectedOption?.label || '';
  }

  // Toggle dropdown visibility
  toggleDropdown(dropdownType: string): void {
    if (this.openDropdown === dropdownType) {
      this.closeAllDropdowns();
    } else {
      this.closeAllDropdowns();
      this.openDropdown = dropdownType;
    }
  }

  // Close all dropdowns
  private closeAllDropdowns(): void {
    this.openDropdown = '';
    this.statusDropdownOpen = false;
    this.requestLevelsDropdownOpen = false;
    this.afterLimitActionsDropdownOpen = false;
    this.levelsDropdownOpen = false;
    this.employeesDropdownOpen = false;
    this.managersDropdownOpen = false;
    this.departmentsDropdownOpen = false;
    this.branchesDropdownOpen = false;
    this.rolesDropdownOpen = false;
  }

  // Utility methods
  get isRTL(): boolean {
    return this.currentLang === 2; // Arabic
  }
}
