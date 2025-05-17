import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileSignLocationsComponent } from './mobile-sign-locations.component';

describe('MobileSignLocationsComponent', () => {
  let component: MobileSignLocationsComponent;
  let fixture: ComponentFixture<MobileSignLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MobileSignLocationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MobileSignLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
