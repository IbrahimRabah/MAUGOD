import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MysalaryService } from '../../services/mysalary.service';
import { LanguageService } from '../../../../core/services/language.service';
import { MySalaryInfo, MySalaryResponse } from '../../../../core/models/mySalary';
import { Addon, AddOnsApiResponse } from '../../../../core/models/addon';
import { SalaryData, SalaryResponse } from '../../../../core/models/CalculateSalaryRequest';
import { SalariesDetailsData, SalariesDetailsResponse } from '../../../../core/models/salariesDetails';

@Component({
  selector: 'app-my-salary',
  templateUrl: './my-salary.component.html',
  styleUrl: './my-salary.component.css'
})
export class MySalaryComponent implements OnInit, OnDestroy {
  
  // Table selection
  selectedTable: string = 'salaryDetails'; // salaryDetails, salaryAddons, salaryCalculations
  
  // Loading states
  loading: boolean = false;
  
  // Data arrays
  salaryDetails: SalariesDetailsData[] = [];
  salaryAddons: Addon[] = [];
  salaryCalculations: SalaryData[] = [];
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  
  // Search
  searchTerm: string = '';
  
  // Language
  currentLang: number = 1; // 1 for English, 2 for Arabic
  
  // Employee ID from localStorage
  empId: number = 0;
  
  // Subscription for cleanup
  private langSubscription: Subscription = new Subscription();
  
  constructor(
    private mysalaryService: MysalaryService,
    public langService: LanguageService
  ) {}

  ngOnInit() {
    // Get empId from localStorage
    this.empId = this.getStoredEmpId() || 0;
    
    // Get current language
    this.currentLang = this.getStoredLanguage();
    
    // Subscribe to language changes
    this.langSubscription = this.langService.currentLang$.subscribe(() => {
      this.currentLang = this.getStoredLanguage();
      this.loadData();
    });
    
    // Load initial data
    this.loadData();
  }

  ngOnDestroy() {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  // Helper Methods
  getStoredEmpId(): number | undefined {
    const storedEmpId = localStorage.getItem('empId');
    return storedEmpId ? parseInt(storedEmpId, 10) : undefined;
  }

  getStoredLanguage(): number {
    const storedLang = localStorage.getItem('lang');
    return storedLang ? parseInt(storedLang, 10) : 1;
  }

  // Table Selection Methods
  onTableChange(tableType: string) {
    this.selectedTable = tableType;
    this.currentPage = 1;
    this.searchTerm = '';
    this.loadData();
  }

  // Data Loading Methods
  loadData() {
    if (!this.empId) {
      console.error('Employee ID not found in localStorage');
      return;
    }

    switch (this.selectedTable) {
      case 'salaryDetails':
        this.loadSalaryDetails();
        break;
      case 'salaryAddons':
        this.loadSalaryAddons();
        break;
      case 'salaryCalculations':
        this.loadSalaryCalculations();
        break;
    }
  }

  loadSalaryDetails() {
    this.loading = true;
    this.mysalaryService.getMySalaryDetails(this.empId, this.currentLang).subscribe({
      next: (response: SalariesDetailsResponse) => {
        if (response.isSuccess) {
          this.salaryDetails = response.data || [];
          this.totalRecords = response.totalCount || this.salaryDetails.length;
        } else {
          this.salaryDetails = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading salary details:', error);
        this.salaryDetails = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  loadSalaryAddons() {
    this.loading = true;
    this.mysalaryService.getMySalaryAddons(this.empId, this.currentLang).subscribe({
      next: (response: AddOnsApiResponse) => {
        if (response.isSuccess) {
          this.salaryAddons = response.data || [];
          this.totalRecords = response.totalCount || this.salaryAddons.length;
        } else {
          this.salaryAddons = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading salary addons:', error);
        this.salaryAddons = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  loadSalaryCalculations() {
    this.loading = true;
    this.mysalaryService.getMySalaryCalculation(this.empId, this.currentLang).subscribe({
      next: (response: SalaryResponse) => {
        if (response.isSuccess) {
          this.salaryCalculations = response.data || [];
          this.totalRecords = response.totalCount || this.salaryCalculations.length;
        } else {
          this.salaryCalculations = [];
          this.totalRecords = 0;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading salary calculations:', error);
        this.salaryCalculations = [];
        this.totalRecords = 0;
        this.loading = false;
      }
    });
  }

  // Pagination Methods
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadData();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadData();
    }
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.loadData();
  }

  // Search Methods
  onSearch() {
    this.currentPage = 1;
    this.loadData();
  }

  // Helper methods for data display
  getCurrentTableData(): any[] {
    switch (this.selectedTable) {
      case 'salaryDetails':
        return this.salaryDetails;
      case 'salaryAddons':
        return this.salaryAddons;
      case 'salaryCalculations':
        return this.salaryCalculations;
      default:
        return [];
    }
  }

  // Method to get salary type display text
  getSalaryTypeText(salType: number): string {
    switch (salType) {
      case 1:
        return this.currentLang === 1 ? 'Monthly' : 'شهري';
      case 2:
        return this.currentLang === 1 ? 'Yearly' : 'سنوي';
      case 3:
        return this.currentLang === 1 ? 'Hourly' : 'ساعي';
      default:
        return '';
    }
  }

  // Method to get add/deduct display text
  getAddDeductText(addDed: number): string {
    return addDed === 1 ? 
      (this.currentLang === 1 ? 'Add' : 'إضافة') : 
      (this.currentLang === 1 ? 'Deduct' : 'استقطاع');
  }

  // Method to format boolean values
  getBooleanText(value: boolean): string {
    return value ? 
      (this.currentLang === 1 ? 'Yes' : 'نعم') : 
      (this.currentLang === 1 ? 'No' : 'لا');
  }

  // Method to format dates
  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(this.currentLang === 1 ? 'en-US' : 'ar-SA');
    } catch {
      return dateString;
    }
  }
}
