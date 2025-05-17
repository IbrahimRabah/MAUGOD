import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginTraceComponent } from './login-trace.component';

describe('LoginTraceComponent', () => {
  let component: LoginTraceComponent;
  let fixture: ComponentFixture<LoginTraceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginTraceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginTraceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
