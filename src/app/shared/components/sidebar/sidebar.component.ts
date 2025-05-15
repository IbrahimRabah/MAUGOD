import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  openSubmenus: { [key: string]: boolean } = {};

  constructor(public sidebarService: SidebarService) {}

  ngOnInit() {
    this.sidebarService.isExpanded$.subscribe(isExpanded => {
      console.log('Sidebar expanded state:', isExpanded);
    });
  }

  toggleSubmenu(menuId: string) {
    this.openSubmenus[menuId] = !this.openSubmenus[menuId];
  }

  isSubmenuOpen(menuId: string): boolean {
    return this.openSubmenus[menuId] || false;
  }
}
