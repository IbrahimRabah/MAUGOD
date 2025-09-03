import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';
import { PostRequestService } from '../../services/post-request.service';
import { 
  CreatePostRequestBody,
  DropdownItemForPostRequest,
  GetEmployeesDropdownListPayload,
  GetPartsDropdownListPayload,
  ApiResponse,
  dropdownResponseData
} from '../../../../core/models/postRequest';

@Component({
  selector: 'app-create-post-request-modal',
  templateUrl: './create-post-request-modal.component.html',
  styleUrl: './create-post-request-modal.component.css',
  providers: [MessageService]
})
export class CreatePostRequestModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() showModal = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() requestCreated = new EventEmitter<void>();

  // Form
  createForm!: FormGroup;
  
  // Dropdown data
  employees: DropdownItemForPostRequest[] = [];
  statuses: DropdownItemForPostRequest[] = [];
  parts: DropdownItemForPostRequest[] = [];
  
  // Loading states
  loadingEmployees = false;
  loadingStatuses = false;
  loadingParts = false;
  submitting = false;
  
  // File handling
  selectedFile: File | null = null;
  fileBase64: string = '';
  maxDate = new Date();
  
  private langSubscription: Subscription = new Subscription();
  public currentLang = 2; // Default to Arabic

  constructor(
    private fb: FormBuilder,
    private postRequestService: PostRequestService,
    private authService: AuthenticationService,
    public langService: LanguageService,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.initializeLanguage();
  }

  ngOnDestroy() {
    this.langSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && changes['showModal'].currentValue) {
      this.loadDropdownData();
      this.resetForm();
    }
  }

  private initializeForm() {
    this.createForm = this.fb.group({
      employee: ['', Validators.required],
      status: ['', Validators.required],
      part: [''],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      note: ['', Validators.required],
      attachmentNote: ['']
    });
  }

  private initializeLanguage() {
    this.currentLang = this.langService.getLangValue();
    this.langSubscription = this.langService.currentLang$.subscribe(lang => {
      this.currentLang = this.langService.getLangValue();
    });
  }

  private loadDropdownData() {
    const empId = this.authService.getEmpIdAsNumber();
    if (!empId) {
      this.showErrorMessage('Employee ID not found');
      return;
    }

    // Load employees
    this.loadEmployees(empId);
    
    // Load statuses
    this.loadStatuses(empId);
    
    // Load parts
    this.loadParts(empId);
  }

  private loadEmployees(empId: number) {
    this.loadingEmployees = true;
    const payload: GetEmployeesDropdownListPayload = {
      apexEmpId: empId
    };

    this.postRequestService.getEmployeeDropdownListForPostRequest(payload, this.currentLang)
      .subscribe({
        next: (response: ApiResponse<dropdownResponseData>) => {
          this.loadingEmployees = false;
          if (response.isSuccess && response.data) {
            this.employees = response.data.dropdownListForPostRequest || [];
          } else {
            this.showErrorMessage('Error loading employees');
            this.employees = [];
          }
        },
        error: (error) => {
          this.loadingEmployees = false;
          console.error('Error loading employees:', error);
          this.showErrorMessage('Error loading employees');
          this.employees = [];
        }
      });
  }

  private loadStatuses(empId: number) {
    this.loadingStatuses = true;
    const payload: GetEmployeesDropdownListPayload = {
      apexEmpId: empId
    };

    this.postRequestService.getStatusDropdownListForPostRequest(payload, this.currentLang)
      .subscribe({
        next: (response: ApiResponse<dropdownResponseData>) => {
          this.loadingStatuses = false;
          if (response.isSuccess && response.data) {
            this.statuses = response.data.dropdownListForPostRequest || [];
          } else {
            this.showErrorMessage('Error loading statuses');
            this.statuses = [];
          }
        },
        error: (error) => {
          this.loadingStatuses = false;
          console.error('Error loading statuses:', error);
          this.showErrorMessage('Error loading statuses');
          this.statuses = [];
        }
      });
  }

  private loadParts(empId: number) {
    this.loadingParts = true;
    const payload: GetPartsDropdownListPayload = {
      empId: empId
    };

    this.postRequestService.getPartsDropdownListForPostRequest(payload, this.currentLang)
      .subscribe({
        next: (response: ApiResponse<dropdownResponseData>) => {
          this.loadingParts = false;
          if (response.isSuccess && response.data) {
            this.parts = response.data.dropdownListForPostRequest || [];
          } else {
            this.showErrorMessage('Error loading parts');
            this.parts = [];
          }
        },
        error: (error) => {
          this.loadingParts = false;
          console.error('Error loading parts:', error);
          this.showErrorMessage('Error loading parts');
          this.parts = [];
        }
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.convertFileToBase64(file);
    }
  }

  private convertFileToBase64(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data:type;base64, prefix
      this.fileBase64 = base64String.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  removeFile() {
    this.selectedFile = null;
    this.fileBase64 = '';
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onSubmit() {
    if (this.createForm.valid) {
      this.submitting = true;

      const empId = this.authService.getEmpIdAsNumber();
      if (!empId) {
        this.showErrorMessage('Employee ID not found');
        this.submitting = false;
        return;
      }

      const formValue = this.createForm.value;
      
      const payload: CreatePostRequestBody = {
        postRequestCreateDto: {
          empId: parseInt(formValue.employee),
          reqByEmpId: empId,
          statusId: formValue.status,
          partId: parseInt(formValue.part) || 0,
          sDate: formValue.startDate,
          eDate: formValue.endDate,
          note: formValue.note,
          file: this.fileBase64,
          fileType: this.selectedFile ? this.getFileExtension(this.selectedFile.name) : '',
          filePath: '',
          noteAttach: formValue.attachmentNote || ''
        }
      };

      this.postRequestService.createPostRequest(payload, this.currentLang)
        .subscribe({
          next: (response) => {
            this.submitting = false;
            if (response.isSuccess) {
              this.showSuccessMessage('CREATE_POST_REQUEST.SUCCESS_MESSAGE');
              this.requestCreated.emit();
              this.onClose();
            } else {
              this.showErrorMessage(response.message || 'CREATE_POST_REQUEST.ERROR_MESSAGE');
            }
          },
          error: (error) => {
            this.submitting = false;
            console.error('Error creating post request:', error);
            this.showErrorMessage('CREATE_POST_REQUEST.ERROR_MESSAGE');
          }
        });
    } else {
      this.markFormGroupTouched();
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  private markFormGroupTouched() {
    Object.keys(this.createForm.controls).forEach(key => {
      const control = this.createForm.get(key);
      control?.markAsTouched();
    });
  }

  private resetForm() {
    this.createForm.reset();
    this.selectedFile = null;
    this.fileBase64 = '';
    
    // Reset file input
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onClose() {
    this.resetForm();
    this.closeModal.emit();
  }

  // Helper methods for form validation
  isFieldRequired(fieldName: string): boolean {
    const field = this.createForm.get(fieldName);
    return field?.hasError('required') && field?.touched || false;
  }

  // Message helper methods
  private showSuccessMessage(message: string) {
    this.translateService.get(message).subscribe(translatedMessage => {
      this.messageService.add({
        severity: 'success',
        summary: this.translateService.instant('SUCCESS'),
        detail: translatedMessage
      });
    });
  }

  private showErrorMessage(message: string) {
    this.translateService.get(message).subscribe(translatedMessage => {
      this.messageService.add({
        severity: 'error',
        summary: this.translateService.instant('ERROR'),
        detail: translatedMessage
      });
    });
  }
}
