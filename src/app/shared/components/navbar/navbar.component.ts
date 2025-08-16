import { Component } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';
import { LanguageService } from '../../../core/services/language.service';
import { AuthenticationService } from '../../../modules/authentication/services/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  UserName: string = '';
  constructor(
    public sidebarService: SidebarService,
    private languageService: LanguageService,
     private authenticationService: AuthenticationService
  ) { 
    this.getEmpName();
  }

  toggleSidebar() {
    console.log('NavbarComponent: Toggle button clicked');
    this.sidebarService.toggle();
  }

  logout() {
    this.authenticationService.logout();
  }

  switchLanguage() {
    const currentLang = this.getCurrentLang();
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    this.languageService.setLanguage(newLang);
  }

  getCurrentLang() {
    return this.languageService.getCurrentLang();
  }
  getEmpName() {
    this.UserName = this.authenticationService.getEmpName();
  }
}
