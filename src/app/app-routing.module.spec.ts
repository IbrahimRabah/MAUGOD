import { Location } from '@angular/common';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

describe('AppRoutingModule', () => {
  let location: Location;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        AppRoutingModule
      ]
    });

    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
  });

  it('should be created', () => {
    expect(AppRoutingModule).toBeTruthy();
  });

  it('should redirect empty path to /home', fakeAsync(() => {
    router.navigate(['']);
    tick();
    expect(location.path()).toBe('/home');
  }));

  it('should load home module', fakeAsync(() => {
    router.navigate(['/home']);
    tick();
    expect(location.path()).toBe('/home');
  }));

  it('should load dashboard module', fakeAsync(() => {
    router.navigate(['/dashboard']);
    tick();
    expect(location.path()).toBe('/dashboard');
  }));

  it('should load reports module', fakeAsync(() => {
    router.navigate(['/reports']);
    tick();
    expect(location.path()).toBe('/reports');
  }));
});
