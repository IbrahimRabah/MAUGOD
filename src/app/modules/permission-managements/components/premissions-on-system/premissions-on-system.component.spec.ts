import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremissionsOnSystemComponent } from './premissions-on-system.component';

describe('PremissionsOnSystemComponent', () => {
  let component: PremissionsOnSystemComponent;
  let fixture: ComponentFixture<PremissionsOnSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PremissionsOnSystemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PremissionsOnSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
