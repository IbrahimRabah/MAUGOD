import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-committees-data',
  templateUrl: './committees-data.component.html',
  styleUrls: ['./committees-data.component.css']
})
export class CommitteesDataComponent {
  constructor(public translate: TranslateService) {}
}
