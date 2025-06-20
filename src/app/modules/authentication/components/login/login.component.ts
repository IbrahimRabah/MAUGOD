import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginResponse } from '../../../../core/models/account';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
 loginForm!: FormGroup;
  isLoading: boolean = false;
  apiError!: string;
  @ViewChild('container') containerDiv!: ElementRef;
  constructor(private authenticationService: AuthenticationService, private router: Router) { }
  ngOnInit(): void {
    this.initialization();
  }
  initialization(): void {
    this.loginForm = new FormGroup(
      {
        userName : new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
      }
    )
  }
  onSubmit(): void {
    {
      if (!this.loginForm.invalid) {
        this.authenticationService.login(this.loginForm.value).subscribe({
          next: (response: LoginResponse) => {
              this.setInfoInStorage(response);
              this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Login error:', err);
            this.isLoading = false;
            this.apiError = 'Invalid username or password';
             // this.messageService.add({ severity: 'error', summary: 'error', detail: 'Error' });
              // this.apiError = response.message;
          }
        })
      } else {
        this.apiError = "Not Valid";
      }
    }
  }
  toggle(action: string): void {
    switch (action) {
      case 'add':
        this.containerDiv.nativeElement.classList.add('active');
        break;
      default:
        this.containerDiv.nativeElement.classList.remove('active');
    }
  }
  setInfoInStorage(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    
    try {
      const decodedToken: any = jwtDecode(response.token);      
      localStorage.setItem('lang', decodedToken.lang || response.lang.toString());
      localStorage.setItem('exp', decodedToken.exp?.toString() || '');
      localStorage.setItem('langUserName', decodedToken.langUserName || '');
      localStorage.setItem('empId', decodedToken.empId?.toString() || response.empId.toString());
      localStorage.setItem('empName', decodedToken.empName || response.empName || '');
      localStorage.setItem('loginId', decodedToken.loginId || response.loginId || '');
    } catch (error) {
      console.error('Error decoding token:', error);
      // Fallback to response values if token decoding fails
      localStorage.setItem('lang', response.lang.toString());
      localStorage.setItem('empId', response.empId.toString());
      localStorage.setItem('empName', response.empName || '');
      localStorage.setItem('loginId', response.loginId || '');
    }
    
    localStorage.setItem('menuList', JSON.stringify(response.menuList));
  }
}
