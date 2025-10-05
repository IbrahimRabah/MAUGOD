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
      isActive: [true, Validators.required],
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
    if (!this.createForm.get('empId')) {
      this.createForm.addControl('empId', this.fb.control(0));
    }
    if (!this.createForm.get('managerId')) {
      this.createForm.addControl('managerId', this.fb.control(0));
    }
    if (!this.createForm.get('mgrOfDeptId')) {
      this.createForm.addControl('mgrOfDeptId', this.fb.control(0));
    }
    if (!this.createForm.get('mgrOfBranchId')) {
      this.createForm.addControl('mgrOfBranchId', this.fb.control(0));
    }
    if (!this.createForm.get('deptId')) {
      this.createForm.addControl('deptId', this.fb.control(0));
    }
    if (!this.createForm.get('branchId')) {
      this.createForm.addControl('branchId', this.fb.control(0));
    }
    if (!this.createForm.get('roleId')) {
      this.createForm.addControl('roleId', this.fb.control(0));
    }
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
        console.log('Loading existing time transaction approval data:', approvalData);
        
        // Wait a bit to ensure dropdown data is loaded
        await this.waitForDropdownData();
        
        // Populate the form with existing data
        this.populateFormWithApprovalData(approvalData);
      }
    } catch (error) {
      console.error('Error loading existing approval data:', error);
      this.showErrorMessage(this.translateService.instant('CREATE_TIME_TRANSACTION_APPROVAL.ERROR_LOADING_DATA'));
    } finally {
      this.loading = false;
    }
  }

  private async waitForDropdownData(maxWait = 2000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      console.log('Waiting for dropdown data...', {
        employees: this.employees.length,
        departmentsOrMgr: this.departmentsOrMgr.length,
        managers: this.managers.length,
        branchesOrMgr: this.branchesOrMgr.length,
        roles: this.roles.length
      });
      
      if (this.employees.length > 0 && this.departmentsOrMgr.length > 0 && this.managers.length > 0) {
        console.log('Dropdown data loaded successfully');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.warn('Timeout waiting for dropdown data to load');
  }

  private populateFormWithApprovalData(approvalData: any) {
    console.log('Populating form with approval data:', approvalData);
    
    // Helper function to convert values for dropdowns
    const convertToDropdownValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      // Don't treat 0 as empty - it might be a valid ID
      return String(value);
    };

    // Set selected values first
    this.selectedForEveryone = approvalData.forEveryoneId;
    this.selectedRequestLevel = approvalData.reqLevelId;

    // Patch main form values
    this.createForm.patchValue({
      forEveryone: approvalData.forEveryoneId,
      note: approvalData.note || '',
      requestLevel: approvalData.reqLevelId,
      isActive: approvalData.isActive ?? true
    });

    console.log('Main form values patched:', {
      forEveryone: approvalData.forEveryoneId,
      note: approvalData.note,
      requestLevel: approvalData.reqLevelId,
      isActive: approvalData.isActive
    });

    // Check if we have any group-related data that needs to be preserved
    const hasGroupData = (approvalData.empId) || 
                        (approvalData.deptIdMgr) || 
                        (approvalData.branchIdMgr) || 
                        (approvalData.deptId) || 
                        (approvalData.branchId) || 
                        (approvalData.roleId);
    
    console.log('Checking group data:', {
      forEveryoneId: approvalData.forEveryoneId,
      hasGroupData,
      empId: approvalData.empId,
      deptIdMgr: approvalData.deptIdMgr,
      branchIdMgr: approvalData.branchIdMgr,
      deptId: approvalData.deptId,
      branchId: approvalData.branchId,
      roleId: approvalData.roleId
    });
    
    // Handle empId field (always patch since it's always available)
    this.createForm.patchValue({
      empId: convertToDropdownValue(approvalData.empId)
    });

    console.log('Employee ID patched:', {
      rawEmpId: approvalData.empId,
      convertedEmpId: convertToDropdownValue(approvalData.empId)
    });

    // Handle different scenarios for additional group controls
    if (approvalData.forEveryoneId === 0) {
      // "For Group" mode - UI will show additional group controls, so add them and patch values
      console.log('For Group mode - adding additional group controls and patching values');
      this.addGroupControls();
      
      setTimeout(() => {
        this.patchGroupControlValues(approvalData, convertToDropdownValue);
      }, 50);
      
    } else if (this.isEditMode && hasGroupData) {
      // "For Everyone" mode but in edit mode with existing group data
      // Add controls silently to preserve data for form submission, even though UI won't show them
      console.log('For Everyone mode with existing group data - adding hidden controls to preserve data');
      this.addGroupControls();
      
      setTimeout(() => {
        this.patchGroupControlValues(approvalData, convertToDropdownValue);
      }, 50);
    } else {
      console.log('For Everyone mode - only empId control needed (already patched)');
    }

    // Update active levels to create level forms
    this.updateActiveLevels();
  }

  private patchGroupControlValues(approvalData: any, convertToDropdownValue: (value: any) => string) {
    // Don't include empId here since it's already patched in the main form
    const groupValues = {
      mgrOfDeptId: convertToDropdownValue(approvalData.deptIdMgr),
      mgrOfBranchId: convertToDropdownValue(approvalData.branchIdMgr),
      deptId: convertToDropdownValue(approvalData.deptId),
      branchId: convertToDropdownValue(approvalData.branchId),
      roleId: convertToDropdownValue(approvalData.roleId)
    };
    
    // Log form structure before patching
    console.log('Form controls before patching:', Object.keys(this.createForm.controls));
    console.log('Form has empId control:', this.createForm.get('empId') !== null);
    
    this.createForm.patchValue(groupValues);
    
    // Log form values after patching
    console.log('Group form values patched:', groupValues);
    console.log('Form values after patching:', this.createForm.value);
    console.log('Raw approval data values:', {
      empId: approvalData.empId,
      deptIdMgr: approvalData.deptIdMgr,
      branchIdMgr: approvalData.branchIdMgr,
      deptId: approvalData.deptId,
      branchId: approvalData.branchId,
      roleId: approvalData.roleId
    });

    // Verify dropdown values
    this.verifyTimeTransactionDropdownValues(approvalData);

    // Force form control updates for PrimeNG dropdowns
    setTimeout(() => {
      this.forceFormControlUpdates();
      
      // Final verification - check what the form actually contains after all patching
      this.logFinalFormState();
    }, 200);

    // Populate level details after level forms are created
    setTimeout(() => {
      this.populateTimeTransactionLevelDetails(approvalData);
    }, 100);
  }

  private verifyTimeTransactionDropdownValues(approvalData: any) {
    console.log('Verifying time transaction dropdown values...');
    
    // Helper to check if value exists in dropdown options
    const checkValue = (value: any, options: DropdownItem[], fieldName: string) => {
      if (value === null || value === undefined) return; // Skip null/undefined values
      
      const stringValue = String(value);
      const found = options.find(option => option.value === stringValue);
      
      if (!found && options.length > 0) {
        console.warn(`Value "${stringValue}" not found in ${fieldName} dropdown options. Available options:`, 
                     options.slice(0, 5).map(o => `${o.value}:"${o.label}"`));
      } else if (found) {
        console.log(`✓ Value "${stringValue}" found in ${fieldName} dropdown as "${found.label}"`);
      } else if (options.length === 0) {
        console.warn(`No options loaded yet for ${fieldName} dropdown`);
      }
    };

    // Check main dropdown values - check all values, even 0
    console.log('=== DROPDOWN VALUE VERIFICATION ===');
    checkValue(approvalData.empId, this.employees, 'employees');
    checkValue(approvalData.deptIdMgr, this.departmentsOrMgr, 'departmentsOrMgr (mgrOfDept)');
    checkValue(approvalData.branchIdMgr, this.branchesOrMgr, 'branchesOrMgr (mgrOfBranch)');
    checkValue(approvalData.deptId, this.departmentsOrMgr, 'departmentsOrMgr (dept)');
    checkValue(approvalData.branchId, this.branchesOrMgr, 'branchesOrMgr (branch)');
    checkValue(approvalData.roleId, this.roles, 'roles');
    console.log('=== END DROPDOWN VERIFICATION ===');
    
    console.log('Current dropdown data lengths:', {
      employees: this.employees.length,
      departmentsOrMgr: this.departmentsOrMgr.length,
      branchesOrMgr: this.branchesOrMgr.length,
      roles: this.roles.length,
      managers: this.managers.length,
      requestLevels: this.requestLevels.length,
      afterLimitActions: this.afterLimitActions.length,
      levels: this.levels.length
    });
  }

  private populateTimeTransactionLevelDetails(approvalData: any) {
    console.log('Populating time transaction level details:', approvalData);
    
    // Array of level detail properties in the approval data
    const levelDetailProperties = [
      'detailsLevel1', 'detailsLevel2', 'detailsLevel3', 
      'detailsLevel4', 'detailsLevel5', 'detailsLevel6', 
      'detailsLevel7', 'detailsLevel8', 'detailsLevel9'
    ];

    levelDetailProperties.forEach((levelProperty, index) => {
      const levelData = approvalData[levelProperty];
      const levelNumber = index + 1;
      
      console.log(`Processing ${levelProperty} (level ${levelNumber}):`, levelData);
      
      if (levelData && this.levelForms[levelNumber]) {
        try {
          // Helper function to convert values for level details
          const convertForLevelField = (value: any): number | null => {
            if (value === null || value === undefined || value === '') return null;
            return isNaN(Number(value)) ? null : Number(value);
          };


          // Safely patch each field in the level form
          this.levelForms[levelNumber].patchValue({
            // Dynamic Direct Manager
            dynDirectMgr: levelData.dynDirectMgr,
            dynDirectMgrLevel: convertForLevelField(levelData.dynDirectMgrLevel),
            dynDirectMgrDaysLimits: convertForLevelField(levelData.dynDirectMgrDaysLimits),
            dynDirectMgrAfterLimitAction: convertForLevelField(levelData.dynDirectMgrAfterLimitAction),
            
            // Dynamic Manager of Department
            dynMgrOfDept: levelData.dynMgrOfDept,
            dynMgrOfDeptLevel: convertForLevelField(levelData.dynMgrOfDeptLevel),
            dynMgrOfDeptDaysLimits: convertForLevelField(levelData.dynMgrOfDeptDaysLimits),
            dynMgrOfDeptAfterLimitAction: convertForLevelField(levelData.dynMgrOfDeptAfterLimitAction),
            
            // Dynamic Manager of Branch
            dynMgrOfBranch: levelData.dynMgrOfBranch,
            dynMgrOfBranchLevel: convertForLevelField(levelData.dynMgrOfBranchLevel),
            dynMgrOfBranchDaysLimits: convertForLevelField(levelData.dynMgrOfBranchDaysLimits),
            dynMgrOfBranchAfterLimitAction: convertForLevelField(levelData.dynMgrOfBranchAfterLimitAction),
            
            // Static assignments
            empId: convertForLevelField(levelData.empId),
            mgrId: convertForLevelField(levelData.mgrId),
            mgrIdDaysLimits: convertForLevelField(levelData.mgrIdDaysLimits),
            mgrIdAfterLimitAction: convertForLevelField(levelData.mgrIdAfterLimitAction),
            
            mgrOfDeptId: convertForLevelField(levelData.mgrOfDeptId),
            mgrOfDeptIdDaysLimits: convertForLevelField(levelData.mgrOfDeptIdDaysLimits),
            mgrOfDeptIdAfterLimitAction: convertForLevelField(levelData.mgrOfDeptIdAfterLimitAction),
            
            mgrOfBranchId: convertForLevelField(levelData.mgrOfBranchId),
            mgrOfBranchIdDaysLimits: convertForLevelField(levelData.mgrOfBranchIdDaysLimits),
            mgrOfBranchIdAfterLimitAction: convertForLevelField(levelData.mgrOfBranchIdAfterLimitAction),
            
            deptId: convertForLevelField(levelData.deptId),
            deptIdDaysLimits: convertForLevelField(levelData.deptIdDaysLimits),
            deptIdAfterLimitAction: convertForLevelField(levelData.deptIdAfterLimitAction),
            
            branchId: convertForLevelField(levelData.branchId),
            branchIdDaysLimits: convertForLevelField(levelData.branchIdDaysLimits),
            branchIdAfterLimitAction: convertForLevelField(levelData.branchIdAfterLimitAction),
            
            roleId: convertForLevelField(levelData.roleId),
            roleIdDaysLimits: convertForLevelField(levelData.roleIdDaysLimits),
            roleIdAfterLimitAction: convertForLevelField(levelData.roleIdAfterLimitAction),
            
            noteDetails: levelData.noteDetails ?? null
          });
          
          console.log(`Successfully populated level ${levelNumber} with data:`, this.levelForms[levelNumber].value);
        } catch (error) {
          console.error(`Error populating level ${levelNumber}:`, error);
        }
      } else {
        if (!levelData) {
          console.log(`No level data found for ${levelProperty}`);
        }
        if (!this.levelForms[levelNumber]) {
          console.warn(`Level form not found for level ${levelNumber}`);
        }
      }
    });
  }

  private logFinalFormState() {
    console.log('=== FINAL FORM STATE ===');
    console.log('Main form values:', this.createForm.value);
    console.log('Selected states:', {
      selectedForEveryone: this.selectedForEveryone,
      selectedRequestLevel: this.selectedRequestLevel
    });
    
    // Check if dropdown values are actually displayed correctly
    const empIdControl = this.createForm.get('empId');
    if (empIdControl) {
      const empIdValue = empIdControl.value;
      const empFound = this.employees.find(emp => emp.value === empIdValue);
      console.log(`Employee Control Status:`);
      console.log(`  - Value: ${empIdValue}`);
      console.log(`  - Found in dropdown: ${empFound ? empFound.label : 'NOT FOUND'}`);
      console.log(`  - Control exists: ${empIdControl !== null}`);
      console.log(`  - Control enabled: ${empIdControl.enabled}`);
      console.log(`  - For Everyone mode: ${this.selectedForEveryone === 1}`);
      console.log(`  - Employee dropdown should be visible: ${this.selectedForEveryone === 1}`);
    }
    
    console.log('Available employees count:', this.employees.length);
    console.log('First 3 employees:', this.employees.slice(0, 3));
    
    console.log('=== END FINAL FORM STATE ===');
  }

  private forceFormControlUpdates() {
    // Force all form controls to update their value and validity
    // This helps with PrimeNG dropdowns that sometimes don't update properly
    const controlNames = ['empId', 'mgrOfDeptId', 'mgrOfBranchId', 'deptId', 'branchId', 'roleId'];
    
    controlNames.forEach(controlName => {
      const control = this.createForm.get(controlName);
      if (control) {
        const currentValue = control.value;
        control.updateValueAndValidity();
        
        // Log for debugging
        console.log(`Force updated ${controlName}: ${currentValue}`);
      }
    });

    // Special handling for empId since it's always available
    const empIdControl = this.createForm.get('empId');
    if (empIdControl) {
      empIdControl.markAsTouched();
      empIdControl.updateValueAndValidity();
      console.log('EmpId control specially updated:', empIdControl.value);
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

        if (formValue.empId === null ) {
          this.showErrorMessage('Please select an employee');
          return;
        }
        // For group option - use selected employee
        empId = parseInt(formValue.empId);
        
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
    } catch (error:any) {
      console.error('Error saving time transaction approval:', error);
      this.showErrorMessage(error.error?.message || this.translateService.instant('CREATE_TIME_TRANSACTION_APPROVAL.ERROR_MESSAGE'));
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
