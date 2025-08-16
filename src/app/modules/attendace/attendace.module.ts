import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

import { AttendaceRoutingModule } from './attendace-routing.module';
import { AttendaceComponent } from './components/attendace/attendace.component';
import { AttendanceComponent } from './components/attendance/attendance.component';
import { PunchInTransactionsComponent } from './components/punch-in-transactions/punch-in-transactions.component';
import { ChangeAttendanceTimeDirectlyComponent } from './components/change-attendance-time-directly/change-attendance-time-directly.component';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';



// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AttendaceComponent,
    AttendanceComponent,
    PunchInTransactionsComponent,
    ChangeAttendanceTimeDirectlyComponent
  ],
  imports: [
    CommonModule,
    AttendaceRoutingModule,
    ReactiveFormsModule,
    SharedModule,
     // PrimeNG Modules
    TableModule,
    InputTextModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    ConfirmDialogModule,
    DropdownModule,
    CalendarModule,
    ToastModule,
    ToolbarModule,
    MessagesModule,
    MessageModule,
    
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
MatNativeDateModule,
MatSelectModule,
MatIconModule
,MatMenuModule,
MatButtonModule,
    FormsModule,

  ],
  providers: [
    MessageService,
    ConfirmationService ,
    

  ]
})
export class AttendaceModule { }
