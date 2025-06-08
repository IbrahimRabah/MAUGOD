import { Component } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(
    public sidebarService: SidebarService,
    private languageService: LanguageService
  ) { }

  toggleSidebar() {
    console.log('NavbarComponent: Toggle button clicked');
    this.sidebarService.toggle();
  }

  logout() {
    // Implement logout logic here
    console.log('Logout clicked');
  }

  switchLanguage() {
    const currentLang = this.getCurrentLang();
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    this.languageService.setLanguage(newLang);
  }

  getCurrentLang() {
    return this.languageService.getCurrentLang();
  }
}
