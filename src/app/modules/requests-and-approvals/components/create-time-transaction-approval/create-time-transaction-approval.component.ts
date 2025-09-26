import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { StepsService } from '../../services/steps.service';
import { RequestRouteService } from '../../services/request-route.service';
import { 
  GetTimeTransactionApprovalByIdResponse,
  TimeTransactionApprovalCreateDto,
  ApprovalLevelDetails,
  CreateTimeTransactionApprovalResponse, 
  TimeTransactionApprovalUpdateDto
} from '../../../../core/models/steps';

import { 
  DropdownItem,
  RequestLevelsDropdownData,
  AfterLimitActionsDropdownData,
  LevelsDropdownData,
  ManagersDropdownData,
  DepartmentsOrMgrDropdownData,
  BranchesOrMgrDropdownData,
  RolesDropdownData
} from '../../../../core/models/requestRoute';

@Component({
  selector: 'app-create-time-transaction-approval',
  templateUrl: './create-time-transaction-approval.component.html',
  styleUrl: './create-time-transaction-approval.component.css',
  providers: [MessageService]
})
export class CreateTimeTransactionApprovalComponent implements OnInit, OnDestroy {
  
  @Input() routeId: number = 0; // 0 means create mode, >0 means edit mode
  @Output() modalClosed = new EventEmitter<boolean>();
  @Output() approvalCreated = new EventEmitter<void>();

  createForm!: FormGroup;
  loading = false;
  currentLang = 2; // Default to Arabic
  isEditMode = false; // Track if we're in edit mode
  
  // Dropdown data
  requestLevels: DropdownItem[] = [];
  afterLimitActions: DropdownItem[] = [];
  levels: DropdownItem[] = [];
  managers: DropdownItem[] = [];
  departmentsOrMgr: DropdownItem[] = [];
  branchesOrMgr: DropdownItem[] = [];
  roles: DropdownItem[] = [];
  employees: DropdownItem[] = [];
  
  // Loading states for dropdowns
  loadingRequestLevels = false;
  loadingAfterLimitActions = false;
  loadingLevels = false;
  loadingManagers = false;
  loadingDepartmentsOrMgr = false;
  loadingBranchesOrMgr = false;
  loadingRoles = false;
  loadingEmployees = false;
  
  // Form state
  selectedForEveryone = 1; // 1 = For Everyone, 0 = For Group
  selectedRequestLevel = 0;
  activeLevels: number[] = []; // Array to track which levels are active
  
  // Form groups for each level
  levelForms: { [key: number]: FormGroup } = {};
  
  private langSubscription: Subscription = new Subscription();
  
  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService,
    private messageService: MessageService,
    private langService: LanguageService,
    private authService: AuthenticationService,
    private stepsService: StepsService,
    private requestRouteService: RequestRouteService
  ) {}

  async ngOnInit() {
    this.isEditMode = this.routeId > 0;
    this.initializeLanguage();
    this.initializeForm();
    
    await this.loadDropdownData();   // ✅ wait for dropdown options

    if (this.isEditMode) {
      this.loadExistingData();
    }
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  private initializeLanguage() {
    this.currentLang = this.langService.getLangValue();
    
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
      // Reload dropdown data when language changes
      this.loadDropdownData();
    });
  }

  private initializeForm() {
    this.createForm = this.fb.group({
      forEveryone: [1, Validators.required],
      note: [''],
      requestLevel: [0, Validators.required],
      isActive: [true, Validators.required]
    });

    // Set initial state
    this.selectedForEveryone = 1;

    // Watch for changes in forEveryone selection
    this.createForm.get('forEveryone')?.valueChanges.subscribe(value => {
      console.log('forEveryone changed to:', value); // Debug log
      this.selectedForEveryone = parseInt(value);
      if (this.selectedForEveryone === 0) {
        // For group - add additional controls
        this.addGroupControls();
      } else {
        // For everyone - remove group controls
        this.removeGroupControls();
      }
    });

    this.selectedRequestLevel = 0;

    // Watch for changes in request level
    this.createForm.get('requestLevel')?.valueChanges.subscribe(value => {
      this.selectedRequestLevel = value;
      this.updateActiveLevels();
    });
  }

  private addGroupControls() {
    this.createForm.addControl('empId', this.fb.control(0));
    this.createForm.addControl('managerId', this.fb.control(0));
    this.createForm.addControl('mgrOfDeptId', this.fb.control(0));
    this.createForm.addControl('mgrOfBranchId', this.fb.control(0));
    this.createForm.addControl('deptId', this.fb.control(0));
    this.createForm.addControl('branchId', this.fb.control(0));
    this.createForm.addControl('roleId', this.fb.control(0));
  }

  private removeGroupControls() {
    this.createForm.removeControl('empId');
    this.createForm.removeControl('managerId');
    this.createForm.removeControl('mgrOfDeptId');
    this.createForm.removeControl('mgrOfBranchId');
    this.createForm.removeControl('deptId');
    this.createForm.removeControl('branchId');
    this.createForm.removeControl('roleId');
  }

  private updateActiveLevels() {
    const requestLevel = this.selectedRequestLevel;
    this.activeLevels = [];
    
    // Create level forms for the selected number of levels
    for (let i = 1; i <= requestLevel; i++) {
      this.activeLevels.push(i);
      this.createLevelForm(i);
    }

    // Remove forms for levels that are no longer active
    Object.keys(this.levelForms).forEach(key => {
      const levelNumber = parseInt(key);
      if (levelNumber > requestLevel) {
        delete this.levelForms[levelNumber];
      }
    });
  }

  private createLevelForm(levelNumber: number) {
    if (!this.levelForms[levelNumber]) {
      this.levelForms[levelNumber] = this.fb.group({
        // Dynamic Direct Manager
        dynDirectMgr: [0],
        dynDirectMgrLevel: [0],
        dynDirectMgrDaysLimits: [0],
        dynDirectMgrAfterLimitAction: [0],

        // Dynamic Manager of Department
        dynMgrOfDept: [0],
        dynMgrOfDeptLevel: [0],
        dynMgrOfDeptDaysLimits: [0],
        dynMgrOfDeptAfterLimitAction: [0],

        // Dynamic Manager of Branch
        dynMgrOfBranch: [0],
        dynMgrOfBranchLevel: [0],
        dynMgrOfBranchDaysLimits: [0],
        dynMgrOfBranchAfterLimitAction: [0],

        // Static assignments
        empId: [0],
        mgrId: [0],
        mgrIdDaysLimits: [0],
        mgrIdAfterLimitAction: [0],

        mgrOfDeptId: [0],
        mgrOfDeptIdDaysLimits: [0],
        mgrOfDeptIdAfterLimitAction: [0],

        mgrOfBranchId: [0],
        mgrOfBranchIdDaysLimits: [0],
        mgrOfBranchIdAfterLimitAction: [0],

        deptId: [0],
        deptIdDaysLimits: [0],
        deptIdAfterLimitAction: [0],

        branchId: [0],
        branchIdDaysLimits: [0],
        branchIdAfterLimitAction: [0],

        roleId: [0],
        roleIdDaysLimits: [0],
        roleIdAfterLimitAction: [0],

        noteDetails: ['']
      });
    }
  }

  private async loadDropdownData() {
    await Promise.all([
      this.loadRequestLevels(),
      this.loadAfterLimitActions(),
      this.loadLevels(),
      this.loadManagers(),
      this.loadDepartmentsOrMgr(),
      this.loadBranchesOrMgr(),
      this.loadRoles(),
      this.loadEmployees()
    ]);
  }

  private async loadRequestLevels() {
    this.loadingRequestLevels = true;
    try {
      const response = await this.requestRouteService.getRequestLevelsDropdownListForTimeTransactionApproval(this.currentLang).toPromise();
      if (response?.isSuccess && response.data) {
        this.requestLevels = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];;
      }
    } catch (error) {
      console.error('Error loading request levels:', error);
      this.showErrorMessage(this.translateService.instant('CREATE_TIME_TRANSACTION_APPROVAL.ERROR_MESSAGE'));
    } finally {
      this.loadingRequestLevels = false;
    }
  }

  private async loadAfterLimitActions() {
    this.loadingAfterLimitActions = true;
    try {
      const response = await this.requestRouteService.getAfterLimitActionsDropdownListForTimeTransactionApproval(this.currentLang).toPromise();
      if (response?.isSuccess && response.data) {
        this.afterLimitActions = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
      }
    } catch (error) {
      console.error('Error loading after limit actions:', error);
    } finally {
      this.loadingAfterLimitActions = false;
    }
  }

  private async loadLevels() {
    this.loadingLevels = true;
    try {
      const response = await this.requestRouteService.getLevelsDropdownListForTimeTransactionApprovalForLevel(this.currentLang).toPromise();
      if (response?.isSuccess && response.data) {
        this.levels = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
      }
    } catch (error) {
      console.error('Error loading levels:', error);
    } finally {
      this.loadingLevels = false;
    }
  }

  private async loadManagers() {
    this.loadingManagers = true;
    try {
      const response = await this.requestRouteService.getManagersDropdownListForTimeTransactionApproval(this.currentLang).toPromise();
      if (response?.isSuccess && response.data) {
        this.managers = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
      }
    } catch (error) {
      console.error('Error loading managers:', error);
    } finally {
      this.loadingManagers = false;
    }
  }

  private async loadDepartmentsOrMgr() {
    this.loadingDepartmentsOrMgr = true;
    try {
      const response = await this.requestRouteService.getDepartmentsOrMgrOfDeptsDropdownListForTimeTransactionApproval(this.currentLang).toPromise();
      if (response?.isSuccess && response.data) {
        this.departmentsOrMgr = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
      }
    } catch (error) {
      console.error('Error loading departments or managers:', error);
    } finally {
      this.loadingDepartmentsOrMgr = false;
    }
  }

  private async loadBranchesOrMgr() {
    this.loadingBranchesOrMgr = true;
    try {
      const response = await this.requestRouteService.getBranchsOrMgrOfBranchsDropdownListForTimeTransactionApproval(this.currentLang).toPromise();
      if (response?.isSuccess && response.data) {
        this.branchesOrMgr = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
      }
    } catch (error) {
      console.error('Error loading branches or managers:', error);
    } finally {
      this.loadingBranchesOrMgr = false;
    }
  }

  private async loadRoles() {
    this.loadingRoles = true;
    try {
      const response = await this.requestRouteService.getRolesDropdownListForTimeTransactionApproval(this.currentLang).toPromise();
      if (response?.isSuccess && response.data) {
        this.roles = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      this.loadingRoles = false;
    }
  }

  private async loadEmployees() {
    this.loadingEmployees = true;
    try {
      const response = await this.requestRouteService.getEmployeesDropdownListForTimeTransactionApproval(this.currentLang).toPromise();
      if (response?.isSuccess && response.data) {
        this.employees = ((response.data as any)['dropdownListsForTimeTransactionApprovals'] || []) as DropdownItem[];
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      this.loadingEmployees = false;
    }
  }

  private async loadExistingData() {
    this.loading = true;
    try {
      const response = await this.stepsService.getTimeTransactionApprovalById(this.routeId, this.currentLang).toPromise();
      
      if (response?.isSuccess && response.data?.timeTransactionApprovals?.length > 0) {
        const approvalData = response.data.timeTransactionApprovals[0];
        
          // Patch main form values
          this.createForm.patchValue({
            forEveryone: approvalData.forEveryoneId,
            note: approvalData.note,
            requestLevel: approvalData.reqLevelId,
            isActive: approvalData.isActive});


          // Set selected values
          this.selectedForEveryone = approvalData.forEveryoneId;
          this.selectedRequestLevel = approvalData.reqLevelId;

          // If it's for group (0), add group controls and set their values
          if (approvalData.forEveryoneId === 0) {
            this.addGroupControls();
            
            // Wait a bit more for group controls to be added, then patch their values
              this.createForm.patchValue({
                empId: approvalData.empId ? approvalData.empId.toString() : null,
                mgrOfDeptId: approvalData.deptIdMgr ? approvalData.deptIdMgr.toString() : null,
                mgrOfBranchId: approvalData.branchIdMgr ? approvalData.branchIdMgr.toString() : null,
                deptId: approvalData.deptId ? approvalData.deptId.toString() : null,
                branchId: approvalData.branchId ? approvalData.branchId.toString() : null,
                roleId: approvalData.roleId ? approvalData.roleId.toString() : null
              });
            
          }

          // Update active levels to create level forms
          this.updateActiveLevels();

        // Note: Level-specific data mapping would need additional API response structure
        // that includes the detailed level configurations
      }
    } catch (error) {
      console.error('Error loading existing approval data:', error);
      this.showErrorMessage(this.translateService.instant('CREATE_TIME_TRANSACTION_APPROVAL.ERROR_LOADING_DATA'));
    } finally {
      this.loading = false;
    }
  }

  // Form actions
  onSave() {
    if (this.createForm.valid && this.areLevelFormsValid()) {
      this.submitForm();
    } else {
      this.showErrorMessage(this.translateService.instant('CREATE_TIME_TRANSACTION_APPROVAL.FORM_INVALID'));
    }
  }

  private areLevelFormsValid(): boolean {
    return this.activeLevels.every(level => {
      const levelForm = this.levelForms[level];
      return levelForm ? levelForm.valid : true;
    });
  }

  private async submitForm() {
    this.loading = true;
    
    try {
      const formValue = this.createForm.value;
      
      // Determine empId based on forEveryone selection
      let empId: number | null;
      if (formValue.forEveryone === 0) {
        // For group option - use selected employee
        empId = parseInt(formValue.empId) || 0;
        if (empId === 0) {
          this.showErrorMessage('Please select an employee');
          return;
        }
      } else {
        empId = null;
      }

      const dto: TimeTransactionApprovalCreateDto | TimeTransactionApprovalUpdateDto= {
        empId: empId,
        mgrOfDeptId: formValue.forEveryone === 0 ? (parseInt(formValue.mgrOfDeptId) || null) : null,
        mgrOfBranchId: formValue.forEveryone === 0 ? (parseInt(formValue.mgrOfBranchId) || null) : null,
        deptId: formValue.forEveryone === 0 ? (parseInt(formValue.deptId) || null) : null,
        branchId: formValue.forEveryone === 0 ? (parseInt(formValue.branchId) || null) : null,
        roleId: formValue.forEveryone === 0 ? (parseInt(formValue.roleId) || null) : null,
        forEveryone: formValue.forEveryone,
        reqLevels: formValue.requestLevel,
        isActive: formValue.isActive,
        note: formValue.note
      };

      // If in edit mode, add the routeId
      if (this.isEditMode) {
        dto.routeId = this.routeId;
      }

      // Add level details
      this.activeLevels.forEach(levelNumber => {
        const levelForm = this.levelForms[levelNumber];
        if (levelForm) {
          const levelDetails: ApprovalLevelDetails = levelForm.value;
          (dto as any)[`detailsLevel${levelNumber}`] = levelDetails;
        }
      });

      // Call appropriate service method based on mode
      const response = this.isEditMode 
        ? await this.stepsService.updateTimeTransactionApproval(dto, this.currentLang).toPromise()
        : await this.stepsService.createTimeTransactionApproval(dto, this.currentLang).toPromise();
      
      if (response?.isSuccess) {
        const messageKey = this.isEditMode 
          ? 'CREATE_TIME_TRANSACTION_APPROVAL.UPDATE_SUCCESS_MESSAGE'
          : 'CREATE_TIME_TRANSACTION_APPROVAL.SUCCESS_MESSAGE';
        this.showSuccessMessage(this.translateService.instant(messageKey));
        this.approvalCreated.emit();
        this.onCancel();
      } else {
        this.showErrorMessage(response?.message || this.translateService.instant('CREATE_TIME_TRANSACTION_APPROVAL.ERROR_MESSAGE'));
      }
    } catch (error) {
      console.error('Error saving time transaction approval:', error);
      this.showErrorMessage(this.translateService.instant('CREATE_TIME_TRANSACTION_APPROVAL.ERROR_MESSAGE'));
    } finally {
      this.loading = false;
    }
  }

  onCancel() {
    this.modalClosed.emit(false);
  }

  // Utility methods
  get isRTL(): boolean {
    return this.currentLang === 2; // Arabic
  }

  getLevelFormControl(levelNumber: number, controlName: string): FormControl {
    const control = this.levelForms[levelNumber]?.get(controlName) as FormControl;
    return control || new FormControl(0);
  }

  onDynamicToggle(levelNumber: number, type: 'dynDirectMgr' | 'dynMgrOfDept' | 'dynMgrOfBranch', value: number) {
    const levelForm = this.levelForms[levelNumber];
    if (levelForm) {
      levelForm.patchValue({ [type]: value });
      
      // If toggled to "No" (0), reset related fields
      if (value === 0) {
        const prefix = type;
        levelForm.patchValue({
          [`${prefix}Level`]: 0,
          [`${prefix}DaysLimits`]: 0,
          [`${prefix}AfterLimitAction`]: 0
        });
      }
    }
  }

  // Handle radio button change for everyone/group selection
  onForEveryoneChange(value: number) {
    console.log('Radio button changed to:', value); // Debug log
    this.selectedForEveryone = value;
    this.createForm.patchValue({ forEveryone: value });
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

  // Helper methods for level form values
  getLevelFormValue(levelNumber: number, fieldName: string): any {
    const levelForm = this.levelForms[levelNumber];
    if (levelForm && levelForm.get(fieldName)) {
      return levelForm.get(fieldName)?.value || '';
    }
    return '';
  }

  updateLevelFormValue(levelNumber: number, fieldName: string, event: any): void {
    const value = event.target.value;
    const levelForm = this.levelForms[levelNumber];
    if (levelForm && levelForm.get(fieldName)) {
      levelForm.get(fieldName)?.setValue(value);
    }
  }
}
