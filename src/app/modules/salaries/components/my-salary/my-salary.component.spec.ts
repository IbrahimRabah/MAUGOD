import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MySalaryComponent } from './my-salary.component';

describe('MySalaryComponent', () => {
  let component: MySalaryComponent;
  let fixture: ComponentFixture<MySalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MySalaryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MySalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
