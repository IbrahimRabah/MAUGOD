import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileAndAppComponent } from './mobile-and-app.component';

describe('MobileAndAppComponent', () => {
  let component: MobileAndAppComponent;
  let fixture: ComponentFixture<MobileAndAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MobileAndAppComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MobileAndAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
