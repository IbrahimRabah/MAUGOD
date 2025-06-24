import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = new BehaviorSubject<string>(localStorage.getItem('language') || 'ar');

  currentLang$ = this.currentLang.asObservable();
  
  constructor(private translate: TranslateService) {
    // Set default language from localStorage or fallback
    const savedLang = localStorage.getItem('language') || 'ar';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.next(lang);
    localStorage.setItem('language', lang);
    switch (lang) {
      case 'ar':
        localStorage.setItem('lang', '2');
        break;
      case 'en':
        localStorage.setItem('lang', '1');
        break;
      default:
        localStorage.setItem('lang', '2'); // Default to Arabic if not recognized
    }
    
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update Bootstrap class for RTL support
    if (lang === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }

  getCurrentLang() {
    // Always return the value from localStorage for consistency
    return localStorage.getItem('language') || this.currentLang.value;
  }

  getLangValue(): number {
    const language = this.getCurrentLang();
    switch (language) {
      case 'ar':
        return 2; // Arabic
      case 'en':
        return 1; // English
      default:
        return 2; // Default to Arabic if not recognized
    }
  }
}
