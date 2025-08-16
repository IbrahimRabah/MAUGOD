import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';

// Services
import { SignLocationsService } from '../../services/sign-locations.service';
import { LanguageService } from '../../../../core/services/language.service';
import { AuthenticationService } from '../../../authentication/services/authentication.service';

// Models
import { MobileSignLocation, CreateMobileSignLocationRequest, UpdateMobileSignLocationRequest } from '../../../../core/models/signLocation';

@Component({
  selector: 'app-mobile-sign-locations',
  templateUrl: './mobile-sign-locations.component.html',
  styleUrl: './mobile-sign-locations.component.css',
  providers: [MessageService, ConfirmationService]
})
export class MobileSignLocationsComponent implements OnInit, OnDestroy {
  // Core component state
  mobileSignLocations: MobileSignLocation[] = [];
  loading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Modal state
  showAddModal = false;
  isEditMode = false;
  selectedLocation: MobileSignLocation | null = null;
  
  // Forms
  searchForm!: FormGroup;
  locationForm!: FormGroup;

  // Subscriptions
  private langSubscription!: Subscription;

  constructor(
    private signLocationsService: SignLocationsService,
    public langService: LanguageService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private translateService: TranslateService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadMobileSignLocations();
    
    // Subscribe to language changes
    this.langSubscription = this.langService.currentLang$.subscribe(() => {
      this.loadMobileSignLocations();
    });
  }

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  initializeForm() {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.locationForm = this.fb.group({
      ar: ['', Validators.required],
      en: ['', Validators.required],
      note: ['']
    });
  }

  // Load mobile sign locations
  loadMobileSignLocations() {
    this.loading = true;
    const lang = this.langService.getLangValue();
    
    this.signLocationsService.getMobileSignLocations(this.currentPage, this.pageSize, lang).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.mobileSignLocations = response.data.mobileSignLocations || [];
          this.totalRecords = this.mobileSignLocations.length; // Update this if API provides total count
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ERROR'),
            detail: response.message
          });
          this.mobileSignLocations = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading mobile sign locations:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ERROR'),
          detail: 'Failed to load mobile sign locations'
        });
        this.loading = false;
        this.mobileSignLocations = [];
        this.totalRecords = 0;
      }
    });
  }

  // Search functionality
  onSearch() {
    this.currentPage = 1;
    this.loadMobileSignLocations();
  }

  // Pagination computed properties
  get totalPages(): number {
    return Math.ceil(this.totalRecords / this.pageSize);
  }

  get currentPageStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get currentPageEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  get searchTerm(): string {
    return this.searchForm.get('searchTerm')?.value || '';
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadMobileSignLocations();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMobileSignLocations();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMobileSignLocations();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadMobileSignLocations();
  }

  onPageSizeChangeEvent(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSize = parseInt(target.value, 10);
    this.onPageSizeChange();
  }

  // Edit location
  editLocation(item: MobileSignLocation) {
    this.isEditMode = true;
    this.selectedLocation = item;
    this.showAddModal = true;
    
    // Load location details by ID
    const lang = this.langService.getLangValue();
    this.signLocationsService.getMobileSignLocationById(lang, item.locId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data && response.data.mobileSignLocations && response.data.mobileSignLocations.length > 0) {
          const locationData = response.data.mobileSignLocations[0]; // Get the first location from the array
          this.locationForm.patchValue({
            ar: locationData.ar || '',
            en: locationData.en || '',
            note: locationData.note || ''
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('ERROR'),
            detail: response.message || 'Failed to load location details'
          });
        }
      },
      error: (error) => {
        console.error('Error loading location details:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('ERROR'),
          detail: 'Failed to load location details'
        });
      }
    });
  }

  // Add new location
  addLocation() {
    this.isEditMode = false;
    this.selectedLocation = null;
    this.locationForm.reset();
    this.showAddModal = true;
  }

  // Close modal
  closeModal() {
    this.showAddModal = false;
    this.isEditMode = false;
    this.selectedLocation = null;
    this.locationForm.reset();
  }

  // Submit location form
  onSubmitLocation() {
    if (this.locationForm.valid) {
      const formValue = this.locationForm.value;
      const lang = this.langService.getLangValue();

      if (this.isEditMode && this.selectedLocation) {
        // Update existing location
        const updateRequest: UpdateMobileSignLocationRequest = {
          mobileSignLocationUpdateDto: {
            loc_Id: this.selectedLocation.locId,
            ar: formValue.ar,
            en: formValue.en,
            x: this.selectedLocation.x, // Keep existing coordinates
            y: this.selectedLocation.y,
            radius: this.selectedLocation.radius,
            note: formValue.note || ''
          }
        };

        this.signLocationsService.updateMobileSignLocation(updateRequest, lang).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: this.translateService.instant('SUCCESS'),
                detail: this.translateService.instant('MOBILE_SIGN_LOCATIONS.LOCATION_UPDATED_SUCCESS')
              });
              this.closeModal();
              this.loadMobileSignLocations();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.translateService.instant('ERROR'),
                detail: response.message
              });
            }
          },
          error: (error) => {
            console.error('Error updating location:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translateService.instant('ERROR'),
              detail: this.translateService.instant('MOBILE_SIGN_LOCATIONS.UPDATE_ERROR')
            });
          }
        });
      } else {
        // Create new location
        const createRequest: CreateMobileSignLocationRequest = {
          mobileSignLocationCreateDto: {
            ar: formValue.ar,
            en: formValue.en,
            x: 0, // Default coordinates - you may want to add these fields to the form
            y: 0,
            radius: 100, // Default radius
            status: 1, // Active by default
            note: formValue.note || ''
          }
        };

        this.signLocationsService.createMobileSignLocation(createRequest, lang).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.messageService.add({
                severity: 'success',
                summary: this.translateService.instant('SUCCESS'),
                detail: this.translateService.instant('MOBILE_SIGN_LOCATIONS.LOCATION_CREATED_SUCCESS')
              });
              this.closeModal();
              this.loadMobileSignLocations();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: this.translateService.instant('ERROR'),
                detail: response.message
              });
            }
          },
          error: (error) => {
            console.error('Error creating location:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translateService.instant('ERROR'),
              detail: this.translateService.instant('MOBILE_SIGN_LOCATIONS.CREATE_ERROR')
            });
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.locationForm.controls).forEach(key => {
        this.locationForm.get(key)?.markAsTouched();
      });
    }
  }

  // Form validation getters
  get isLocationFormValid(): boolean {
    return this.locationForm.valid;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.locationForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.locationForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return this.translateService.instant(`MOBILE_SIGN_LOCATIONS.${fieldName.toUpperCase()}_REQUIRED`);
      }
    }
    return '';
  }

  // Delete location
  deleteLocation(item: MobileSignLocation) {
    this.confirmationService.confirm({
      message: this.translateService.instant('MOBILE_SIGN_LOCATIONS.DELETE_CONFIRMATION_MESSAGE'),
      header: this.translateService.instant('MOBILE_SIGN_LOCATIONS.DELETE_CONFIRMATION'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translateService.instant('MOBILE_SIGN_LOCATIONS.YES'),
      rejectLabel: this.translateService.instant('MOBILE_SIGN_LOCATIONS.NO'),
      accept: () => {
        const lang = this.langService.getLangValue();
        
        this.signLocationsService.deleteMobileSignLocation(lang, item.locId).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('SUCCESS'),
              detail: this.translateService.instant('MOBILE_SIGN_LOCATIONS.LOCATION_DELETED_SUCCESS')
            });
            this.loadMobileSignLocations();
          },
          error: (error) => {
            console.error('Error deleting location:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translateService.instant('ERROR'),
              detail: this.translateService.instant('MOBILE_SIGN_LOCATIONS.DELETE_ERROR')
            });
          }
        });
      }
    });
  }

  // Preview location (not working as requested)
  previewLocation(item: MobileSignLocation) {
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('INFO'),
      detail: 'Preview functionality is not working yet'
    });
  }

  // Get status display text
  getStatusText(status: string): string {
    return status === '1' 
      ? this.translateService.instant('MOBILE_SIGN_LOCATIONS.ACTIVE')
      : this.translateService.instant('MOBILE_SIGN_LOCATIONS.INACTIVE');
  }

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    return status === '1' ? 'boolean-badge yes' : 'boolean-badge no';
  }
}
