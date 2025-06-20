import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CtsDataComponent } from './cts-data.component';

describe('CtsDataComponent', () => {
  let component: CtsDataComponent;
  let fixture: ComponentFixture<CtsDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CtsDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CtsDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
