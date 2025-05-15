import { Component } from '@angular/core';
import { SidebarService } from './shared/services/sidebar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mawgoud';

  constructor(public sidebarService: SidebarService) {}
}
