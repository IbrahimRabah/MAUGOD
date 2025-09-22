import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginResponse } from '../../../../core/models/account';
import { jwtDecode } from 'jwt-decode';
import { LanguageService } from '../../../../core/services/language.service';
import { PermissionsService } from '../../../../core/services/permissions.service';

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
  constructor(private authenticationService: AuthenticationService, private router: Router, private LanguageService: LanguageService, private permissionsService: PermissionsService) { }
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
    localStorage.setItem('token', response.data.token);
    
    try {
      const decodedToken: any = jwtDecode(response.data.token);      
      localStorage.setItem('lang', decodedToken.lang || response.data.lang.toString());
      localStorage.setItem('exp', decodedToken.exp?.toString() || '');
      localStorage.setItem('langUserName', decodedToken.langUserName || '');
      localStorage.setItem('empId', decodedToken.empId?.toString() || response.data.empId.toString());
      localStorage.setItem('empName', decodedToken.empName || response.data.empName || '');
      localStorage.setItem('loginId', decodedToken.loginId || response.data.loginId || '');
    } catch (error) {
      console.error('Error decoding token:', error);
      // Fallback to response values if token decoding fails
      localStorage.setItem('lang', response.data.lang.toString());
      localStorage.setItem('empId', response.data.empId.toString());
      localStorage.setItem('empName', response.data.empName || '');
      localStorage.setItem('loginId', response.data.loginId || '');
    }
     localStorage.setItem('menuList', JSON.stringify(response.data.menuList));
     
     // Set user permissions in the permissions service
     this.permissionsService.setMenuPermissions(response.data.menuList);
     
     switch (response.data.lang) {
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
