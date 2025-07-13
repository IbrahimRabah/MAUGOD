import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Job, JobResponse } from '../../../../core/models/jobs';
import { PaginationRequest } from '../../../../core/models/pagination';
import { JobService } from '../../services/job.service';
import { LanguageService } from '../../../../core/services/language.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css',
  providers: [MessageService, ConfirmationService]
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  searchTerm: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedJob: Job | null = null;
  
  // Reactive Forms
  jobForm!: FormGroup;
  
  paginationRequest: PaginationRequest = {
    pageNumber: 1,
    pageSize: 10,
    lang: 1 // Default to English
  };

  constructor(
    private jobService: JobService,
    public langService: LanguageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
    
    // Set the language for the pagination request based on the current language setting
    this.langService.currentLang$.subscribe(lang => {
      this.paginationRequest.lang = lang === 'ar' ? 2 : 1;
      this.loadJobs(); // Reload jobs when language changes
    });
  }

  initializeForm() {
    this.jobForm = this.fb.group({
      jobId: [0],
      jobTypId: [0],
      arTitle: ['', [Validators.required, CustomValidators.noEnglishInArabicValidator]],
      enTitle: ['', [Validators.required, CustomValidators.noArabicInEnglishValidator]],
      arJobDesc: [''],
      enJobDesc: [''],
      note: [''],
      del: ['']
    });
  }

  ngOnInit() {
    this.loadJobs();
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginationRequest.pageNumber = page;
      this.loadJobs();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadJobs();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginationRequest.pageNumber = this.currentPage;
      this.loadJobs();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadJobs();
  }

  onSearch() {
    this.currentPage = 1;
    this.paginationRequest.pageNumber = 1;
    this.loadJobs();
  }

  addJob() {
    this.showAddModal = true;
    this.resetForm();
  }

  editJob(job: Job) {
    this.selectedJob = job;
    this.jobForm.patchValue({
      jobId: job.jobId,
      jobTypId: job.jobTypId,
      arTitle: job.arTitle,
      enTitle: job.enTitle,
      arJobDesc: job.arJobDesc,
      enJobDesc: job.enJobDesc,
      note: job.note,
      del: job.del
    });
    this.showEditModal = true;
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.selectedJob = null;
    this.resetForm();
  }

  resetForm() {
    this.jobForm.reset({
      jobId: 0,
      jobTypId: 0,
      arTitle: '',
      enTitle: '',
      arJobDesc: '',
      enJobDesc: '',
      note: '',
      del: ''
    });
  }

  submitJob() {
    if (this.jobForm.valid) {
      const formValue = this.jobForm.value;
      
      if (this.showEditModal && this.selectedJob) {
        console.log('Updating job:', formValue);
        formValue.jobId = this.jobForm.get('jobTypId')?.value; // Ensure jobId is set for
        // Update job - form already contains jobId
        this.jobService.updateJob(formValue).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم تحديث الوظيفة بنجاح' : 'Job updated successfully'
            });
            this.closeModal();
            this.loadJobs();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في تحديث الوظيفة' : 'Failed to update job'
            });
          }
        });
      } else {
        // Add new job
        this.jobService.addJob(formValue).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم إضافة الوظيفة بنجاح' : 'Job added successfully'
            });
            this.closeModal();
            this.loadJobs();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في إضافة الوظيفة' : 'Failed to add job'
            });
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.jobForm.markAllAsTouched();
    }
  }

  loadJobs() {
    this.loading = true;
    this.jobService.getJobs(this.paginationRequest, this.searchTerm).subscribe({
      next: (response: JobResponse) => {
        if (response.isSuccess) {
          this.jobs = response.data.jobs;
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

  deleteJob(job: Job) {
    console.log('Deleting job:', job);
    this.confirmationService.confirm({
      message: this.langService.getCurrentLang() === 'ar' ? 
        `هل أنت متأكد من حذف الوظيفة "${job.arTitle}"؟` : 
        `Are you sure you want to delete the job "${job.enTitle}"?`,
      header: this.langService.getCurrentLang() === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.jobService.deleteJob(job.jobTypId).subscribe({
          next: () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'نجح' : 'Success', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'تم حذف الوظيفة بنجاح' : 'Job deleted successfully'
            });
            this.loadJobs();
          },
          error: (error) => {
            this.messageService.add({ 
              severity: 'error', 
              summary: this.langService.getCurrentLang() === 'ar' ? 'خطأ' : 'Error', 
              detail: this.langService.getCurrentLang() === 'ar' ? 'فشل في حذف الوظيفة' : 'Failed to delete job'
            });
          }
        });
      }
    });
  }

  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.jobForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.jobForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      const isArabic = this.langService.getCurrentLang() === 'ar';
      return CustomValidators.getErrorMessage(field.errors, fieldName, isArabic);
    }
    return '';
  }

  // Getter method for form validation
  get isFormValid(): boolean {
    return this.jobForm.valid;
  }
}
