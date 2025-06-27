import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarService } from './shared/services/sidebar.service';
import { AuthenticationService } from './modules/authentication/services/authentication.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mawgoud';
  isAuthenticated = false;
  private destroy$ = new Subject<void>();
  
  constructor(
    public sidebarService: SidebarService,
    public authService: AuthenticationService
  ) {}

  ngOnInit() {
    // Subscribe to authentication status changes
    this.authService.authStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
