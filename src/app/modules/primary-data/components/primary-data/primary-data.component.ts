import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-primary-data',
  templateUrl: './primary-data.component.html',
  styleUrls: ['./primary-data.component.css']
})
export class PrimaryDataComponent {
  constructor(public translate: TranslateService) {}
}
