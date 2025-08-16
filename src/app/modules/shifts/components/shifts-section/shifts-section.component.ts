import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-shifts-section',
  templateUrl: './shifts-section.component.html',
  styleUrl: './shifts-section.component.css'
})
export class ShiftsSectionComponent {
  constructor(private translateService: TranslateService) {}
}
