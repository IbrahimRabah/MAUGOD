import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLang = new BehaviorSubject<string>('ar');
  currentLang$ = this.currentLang.asObservable();
  
  constructor(private translate: TranslateService) {
    // Set default language
    const savedLang = localStorage.getItem('language') || 'ar';
    this.setLanguage(savedLang);
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.next(lang);
    localStorage.setItem('language', lang);
    
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
    return this.currentLang.value;
  }
}
