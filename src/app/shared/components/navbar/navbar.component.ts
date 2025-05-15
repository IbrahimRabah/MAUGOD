import { Component } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  constructor(public sidebarService: SidebarService) { }

  toggleSidebar() {
    console.log('NavbarComponent: Toggle button clicked');
    this.sidebarService.toggle();
  }

  logout() {
    // Implement logout logic here
    console.log('Logout clicked');
  }

  changeLanguage(lang: string) {
    // Implement language change logic here
    console.log('Language changed to:', lang);
  }
}
