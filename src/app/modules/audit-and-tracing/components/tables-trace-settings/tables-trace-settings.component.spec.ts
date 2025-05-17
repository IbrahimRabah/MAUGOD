import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablesTraceSettingsComponent } from './tables-trace-settings.component';

describe('TablesTraceSettingsComponent', () => {
  let component: TablesTraceSettingsComponent;
  let fixture: ComponentFixture<TablesTraceSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablesTraceSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TablesTraceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
