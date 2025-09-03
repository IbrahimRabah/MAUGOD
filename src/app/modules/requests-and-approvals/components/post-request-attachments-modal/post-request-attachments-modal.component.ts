import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LanguageService } from '../../../../core/services/language.service';
import { PostRequestService } from '../../services/post-request.service';
import { 
  PostRequestAttachment, 
  UploadPostRequestAttachmentBody,
  DeletePostRequestAttachmentParams,
  ApiResponse
} from '../../../../core/models/postRequest';

@Component({
  selector: 'app-post-request-attachments-modal',
  templateUrl: './post-request-attachments-modal.component.html',
  styleUrl: './post-request-attachments-modal.component.css',
  providers: [MessageService, ConfirmationService]
})
export class PostRequestAttachmentsModalComponent implements OnChanges {
  @Input() showModal = false;
  @Input() requestId: number = 0;
  @Input() attachments: PostRequestAttachment[] = [];
  @Input() totalCount: number = 0;
  @Input() loading: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() attachmentDeleted = new EventEmitter<void>();
  @Output() attachmentUploaded = new EventEmitter<void>();

  // Upload dialog state
  showUploadDialog = false;
  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  uploading = false;
  deleting = false;
  
  public currentLang = 2;

  constructor(
    public langService: LanguageService,
    private translateService: TranslateService,
    private postRequestService: PostRequestService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeUploadForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['showModal'] && this.showModal) {
      this.currentLang = this.langService.getLangValue();
      console.log('Post Request Attachments Modal opened for request:', this.requestId);
      console.log('Attachments data:', this.attachments);
    }
  }

  onCloseModal() {
    this.closeModal.emit();
  }

  // Initialize upload form
  private initializeUploadForm() {
    this.uploadForm = this.fb.group({
      note: ['', Validators.required]
    });
  }

  // Upload dialog methods
  openUploadDialog() {
    this.showUploadDialog = true;
    this.uploadForm.reset();
    this.selectedFile = null;
  }

  closeUploadDialog() {
    this.showUploadDialog = false;
    this.uploadForm.reset();
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onUploadSubmit() {
    if (this.uploadForm.valid && this.selectedFile) {
      this.uploading = true;
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1]; // Remove data:type;base64, prefix
        
        const uploadData: UploadPostRequestAttachmentBody = {
          uploadPostRequestAttachmentDto: {
            reqType: 1, // You may need to adjust this based on your requirements
            reqId: this.requestId,
            file: base64Data,
            fileType: this.getFileExtension(this.selectedFile!.name),
            filePath: '', // Optional server path
            note: this.uploadForm.get('note')?.value || ''
          }
        };

        this.postRequestService.uploadPostRequestAttachment(uploadData, this.currentLang)
          .subscribe({
            next: (response: ApiResponse<any>) => {
              this.uploading = false;
              if (response.isSuccess) {
                this.showSuccessMessage('POST_REQUEST.UPLOAD_SUCCESS');
                this.closeUploadDialog();
                this.attachmentUploaded.emit();
              } else {
                this.showErrorMessage(response.message || 'POST_REQUEST.UPLOAD_ERROR');
              }
            },
            error: (error) => {
              this.uploading = false;
              console.error('Error uploading attachment:', error);
              this.showErrorMessage('POST_REQUEST.UPLOAD_ERROR');
            }
          });
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Delete attachment method
  deleteAttachment(attachment: PostRequestAttachment) {
    this.confirmationService.confirm({
      message: this.translateService.instant('POST_REQUEST.DELETE_ATTACHMENT_CONFIRMATION'),
      header: this.translateService.instant('COMMON.CONFIRM'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performDeleteAttachment(attachment.attchs_ID);
      }
    });
  }

  private performDeleteAttachment(attachId: number) {
    this.deleting = true;
    
    const deleteParams: DeletePostRequestAttachmentParams = {
      attachId: attachId
    };

    this.postRequestService.deletePostRequestAttachment(deleteParams, this.currentLang)
      .subscribe({
        next: (response: ApiResponse<any>) => {
          this.deleting = false;
          if (response.isSuccess) {
            // Show success message with immediate display
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('SUCCESS'),
              detail: this.translateService.instant('POST_REQUEST.DELETE_ATTACHMENT_SUCCESS'),
              life: 5000, // Show for 5 seconds
              sticky: false,
              closable: true
            });
            
            // Wait a moment before refreshing to ensure user sees the message
            setTimeout(() => {
              this.attachmentDeleted.emit(); // This triggers parent to refresh attachments
            }, 1000); // Increased delay to 1 second
          } else {
            // Show exact API error message without translation
            if (response.message) {
              // If API provides a message, show it directly
              this.messageService.add({
                severity: 'error',
                summary: this.translateService.instant('ERROR'),
                detail: response.message,
                life: 6000
              });
            } else {
              // If no API message, use translated error
              this.showErrorMessage('POST_REQUEST.DELETE_ATTACHMENT_ERROR');
            }
          }
        },
        error: (error) => {
          this.deleting = false;
          console.error('Error deleting attachment:', error);
          // Show specific error message from server if available
          const errorMessage = error?.error?.message || 'POST_REQUEST.DELETE_ATTACHMENT_ERROR';
          this.showErrorMessage(errorMessage);
        }
      });
  }

  // Utility methods
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  triggerFileInput() {
    const fileInput = document.getElementById('uploadFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Message helper methods
  private showSuccessMessage(message: string) {
    // Direct translation and message display for better reliability
    const translatedMessage = this.translateService.instant(message);
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('SUCCESS'),
      detail: translatedMessage,
      life: 5000, // Show for 5 seconds
      sticky: false // Allow auto-dismiss
    });
  }

  private showErrorMessage(message: string) {
    const translatedMessage = this.translateService.instant(message);
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('ERROR'),
      detail: translatedMessage,
      life: 6000 // Show errors a bit longer
    });
  }

  downloadAttachment(attachment: PostRequestAttachment) {
    if (attachment.m_File) {
      // Convert base64 to blob and download
      const byteCharacters = atob(attachment.m_File);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: this.getMimeType(attachment.m_File_Type) });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attachment_${attachment.attchs_ID}.${attachment.m_File_Type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  }

  viewAttachment(attachment: PostRequestAttachment) {
    if (attachment.m_File) {
      const byteCharacters = atob(attachment.m_File);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: this.getMimeType(attachment.m_File_Type) });
      
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(fileType: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'fa-file-pdf-o',
      'jpg': 'fa-file-image-o',
      'jpeg': 'fa-file-image-o',
      'png': 'fa-file-image-o',
      'gif': 'fa-file-image-o',
      'doc': 'fa-file-word-o',
      'docx': 'fa-file-word-o',
      'xls': 'fa-file-excel-o',
      'xlsx': 'fa-file-excel-o',
      'txt': 'fa-file-text-o'
    };
    return icons[fileType.toLowerCase()] || 'fa-file-o';
  }
}
