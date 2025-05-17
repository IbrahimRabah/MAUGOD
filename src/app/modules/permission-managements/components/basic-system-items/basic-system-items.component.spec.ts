import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicSystemItemsComponent } from './basic-system-items.component';

describe('BasicSystemItemsComponent', () => {
  let component: BasicSystemItemsComponent;
  let fixture: ComponentFixture<BasicSystemItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasicSystemItemsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BasicSystemItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
