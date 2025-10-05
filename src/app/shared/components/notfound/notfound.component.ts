import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notfound',
  standalone: true, // ✅ Required if you’re using loadComponent()
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.css'] // 👈 notice the plural (styleUrls)
})

export class NotfoundComponent {
constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/home']);
  }
}
