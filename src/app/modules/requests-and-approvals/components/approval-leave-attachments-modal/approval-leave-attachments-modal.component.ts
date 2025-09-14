import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Attachment, TimeTransactionApprovalRequestAttachment } from '../../../../core/models/TimeTransactionApprovalData';
import { LanguageService } from '../../../../core/services/language.service';
import { AttendanceTimeService } from '../../services/attendance-time.service';

@Component({
  selector: 'app-approval-leave-attachments-modal',
  templateUrl: './approval-leave-attachments-modal.component.html',
  styleUrl: './approval-leave-attachments-modal.component.css'
})
export class ApprovalLeaveAttachmentsModalComponent implements OnInit, OnDestroy {
@Input() showModal = false;
  @Input() requestId: number = 0;
  @Output() closeModal = new EventEmitter<void>();

  // Data arrays
  attachments: Attachment[] = [];
  
  // Loading states
  loadingAttachments = false;
  uploadingFile = false;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;

  // Forms
  uploadForm!: FormGroup;
  showUploadForm = false;
  selectedFile: File | null = null;

  public currentLang = 2;

  constructor(
    private attendanceTimeService: AttendanceTimeService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.initializeForms();
    this.currentLang = this.langService.getLangValue();
    
    if (this.showModal && this.requestId) {
      this.loadAttachments();
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions if any
  }

  ngOnChanges() {
    console.log('ngOnChanges - showModal:', this.showModal, 'requestId:', this.requestId);
    if (this.showModal && this.requestId) {
      this.loadAttachments();
    }
  }

  private initializeForms() {
    this.uploadForm = this.fb.group({
      file: ['', Validators.required],
      note: ['']
    });
  }

  private loadAttachments() {
    console.log('Loading attachments for requestId:', this.requestId);
    this.loadingAttachments = true;
    
    this.attendanceTimeService.getHandleApprovalAttachments(
      this.currentLang,
      this.requestId,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        console.log('Attachments response:', response);
        if (response.isSuccess) {
          this.attachments = response.data.attachments;
          this.totalRecords = response.data.totalCount;
          console.log('Loaded attachments:', this.attachments);
          console.log('First attachment sample:', this.attachments[0]);
          if (this.attachments && this.attachments.length > 0) {
            console.log('First attachment keys:', Object.keys(this.attachments[0]));
            console.log('First attachment ID:', this.attachments[0].attchId);
          }
        } else {
          this.showErrorMessage(response.message);
        }
        this.loadingAttachments = false;
      },
      error: (error) => {
        console.error('Error loading attachments:', error);
        this.showErrorMessage('ATTACHMENTS.LOAD_ERROR');
        this.loadingAttachments = false;
      }
    });
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get canGoNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  get canGoPrevious(): boolean {
    return this.currentPage > 1;
  }

  nextPage() {
    if (this.canGoNext) {
      this.currentPage++;
      this.loadAttachments();
    }
  }

  previousPage() {
    if (this.canGoPrevious) {
      this.currentPage--;
      this.loadAttachments();
    }
  }

  // File handling methods
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadForm.patchValue({ file: file.name });
    }
  }

  showUploadDialog() {
    this.showUploadForm = true;
    this.uploadForm.reset();
    this.selectedFile = null;
  }

  hideUploadDialog() {
    this.showUploadForm = false;
    this.uploadForm.reset();
    this.selectedFile = null;
  }

  uploadAttachment() {
    if (!this.selectedFile || this.uploadForm.invalid) {
      this.showWarningMessage('ATTACHMENTS.INVALID_FORM');
      return;
    }

    this.uploadingFile = true;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (data:application/pdf;base64,)
      const base64Data = base64String.split(',')[1];
      
      const note = this.uploadForm.get('note')?.value || null;

      this.attendanceTimeService.UploadTimeTransactionApprovalRequestAttachment(
        this.currentLang,
        this.requestId,
        base64Data,
        this.selectedFile!.name,
        this.selectedFile!.type,
        note
      ).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.showSuccessMessage('ATTACHMENTS.UPLOAD_SUCCESS');
            this.hideUploadDialog();
            this.loadAttachments(); // Refresh the list
          } else {
            this.showErrorMessage(response.message);
          }
          this.uploadingFile = false;
        },
        error: (error) => {
          console.error('Error uploading attachment:', error);
          this.showErrorMessage('ATTACHMENTS.UPLOAD_ERROR');
          this.uploadingFile = false;
        }
      });
    };

    reader.readAsDataURL(this.selectedFile);
  }
  private getMimeType(fileType: string): string {
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain'
    };
    return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
  }

  private getFileExtension(mimeType: string): string {
    const extensionMap: { [key: string]: string } = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt'
    };
    return extensionMap[mimeType.toLowerCase()] || 'bin';
  }
  downloadAttachment(attachment: Attachment) {
    // if (attachment.m_File) {
    //   // Convert base64 to blob and download
    //   const byteCharacters = atob(attachment.m_File);
    //   const byteNumbers = new Array(byteCharacters.length);
    //   for (let i = 0; i < byteCharacters.length; i++) {
    //     byteNumbers[i] = byteCharacters.charCodeAt(i);
    //   }
    //   const byteArray = new Uint8Array(byteNumbers);
    //   const blob = new Blob([byteArray], { type: this.getMimeType(attachment.m_File_Type) });
      
    //   const url = window.URL.createObjectURL(blob);
    //   const link = document.createElement('a');
    //   link.href = url;
    //   const fileExtension = this.getFileExtension(attachment.m_File_Type);
    //   link.download = `attachment_${attachment.attchs_ID}.${fileExtension}`;
    //   document.body.appendChild(link);
    //   link.click();
    //   document.body.removeChild(link);
    //   window.URL.revokeObjectURL(url);
    // }
  }
  

  deleteAttachment(attachment: Attachment) {
    // Check if attachment has a valid ID
    // if (!attachment.attchId || attachment.attchId === undefined || attachment.attchId === null) {
    //   console.error('Cannot delete attachment: Invalid ID', attachment);
    //   this.showErrorMessage('ATTACHMENTS.INVALID_ATTACHMENT_ID');
    //   return;
    // }
    
    // this.confirmationService.confirm({
    //   message: this.translateService.instant('ATTACHMENTS.DELETE_CONFIRMATION', { fileName: attachment.fileType }),
    //   header: this.translateService.instant('ATTACHMENTS.DELETE_HEADER'),
    //   icon: 'fas fa-exclamation-triangle',
    //   acceptLabel: this.translateService.instant('COMMON.YES'),
    //   rejectLabel: this.translateService.instant('COMMON.NO'),
    //   accept: () => {
    //     console.log('Delete confirmed for attachment ID:', attachment.attchId);
    //     console.log('Calling delete service with lang:', this.currentLang, 'and ID:', attachment.attchId);
        
    //     try {
    //       this.attendanceTimeService.DeleteTimeTransactionApprovalRequestAttachment(
    //         this.currentLang,
    //         attachment.attchId // Using attachment.id as the attchId parameter
    //       ).subscribe({
    //         next: (response) => {
    //           console.log('Delete response:', response);
    //           if (response.isSuccess) {
    //             this.showSuccessMessage('ATTACHMENTS.DELETE_SUCCESS');
    //             this.loadAttachments(); // Refresh the list
    //           } else {
    //             this.showErrorMessage(response.message);
    //           }
    //         },
    //         error: (error) => {
    //           console.error('Error deleting attachment:', error);
    //           this.showErrorMessage('ATTACHMENTS.DELETE_ERROR');
    //         }
    //       });
    //     } catch (error) {
    //       console.error('Exception in delete service call:', error);
    //       this.showErrorMessage('ATTACHMENTS.DELETE_ERROR');
    //     }
    //   }
    // });
  }

  onClose() {
    this.closeModal.emit();
  }

  // Track by function for better performance
  trackByAttachmentId(index: number, item: TimeTransactionApprovalRequestAttachment): number {
    return item.id;
  }

  // Message helper methods
  private showSuccessMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: this.translateService.instant(message)
    });
  }

  private showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('ERROR'),
      detail: this.translateService.instant(message)
    });
  }

  private showWarningMessage(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: this.translateService.instant('WARNING'),
      detail: this.translateService.instant(message)
    });
  }

  private showInfoMessage(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('INFO'),
      detail: this.translateService.instant(message)
    });
  }
}
