import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MawjoodDataComponent } from './mawjood-data.component';

describe('MawjoodDataComponent', () => {
  let component: MawjoodDataComponent;
  let fixture: ComponentFixture<MawjoodDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MawjoodDataComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MawjoodDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
