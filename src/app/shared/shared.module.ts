import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    NavbarComponent,
    FooterComponent,
    NotfoundComponent,
    SpinnerComponent,
    SidebarComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule
  ],  exports: [
    NavbarComponent,
    FooterComponent,
    NotfoundComponent,
    SpinnerComponent,
    SidebarComponent,
    TranslateModule
  ]
})
export class SharedModule { }
