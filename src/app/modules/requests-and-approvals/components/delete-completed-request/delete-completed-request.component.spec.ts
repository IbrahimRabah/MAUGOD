import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteCompletedRequestComponent } from './delete-completed-request.component';

describe('DeleteCompletedRequestComponent', () => {
  let component: DeleteCompletedRequestComponent;
  let fixture: ComponentFixture<DeleteCompletedRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteCompletedRequestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteCompletedRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
