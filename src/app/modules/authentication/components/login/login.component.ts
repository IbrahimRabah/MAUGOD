import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginResponse } from '../../../../core/models/account';
import { jwtDecode } from 'jwt-decode';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
 loginForm!: FormGroup;
  isLoading: boolean = false;
  apiError!: string;
  showPassword: boolean = false;
  rememberMe: boolean = false;
  @ViewChild('container') containerDiv!: ElementRef;
  constructor(private authenticationService: AuthenticationService, private router: Router,private LanguageService:LanguageService) { }
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
     switch (response.lang) {
      case 2:
        this.LanguageService.setLanguage('ar');
        break;
      case 1:
        this.LanguageService.setLanguage('en');
        break;
      default:
        this.LanguageService.setLanguage('ar');
  }
}
togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
