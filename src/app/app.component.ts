import { Component } from '@angular/core';
import { SidebarService } from './shared/services/sidebar.service';
import { AuthenticationService } from './modules/authentication/services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mawgoud';

  constructor(
    public sidebarService: SidebarService,
    public authService: AuthenticationService
  ) {}
}
