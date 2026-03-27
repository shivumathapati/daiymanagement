import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  authService = inject(AuthService);
  router = inject(Router);

  features = [
    {
      title: 'Farmer Management',
      description: 'Easily register and track farmer activities and profiles.',
      icon: 'people'
    },
    {
      title: 'Real-time Milk Entry',
      description: 'Streamlined data entry for daily milk collections with instant fat/price calculations.',
      icon: 'water_drop'
    },
    {
      title: 'Dynamic Reporting',
      description: 'Generate comprehensive reports on collections, payments, and performance.',
      icon: 'assessment'
    },
    {
      title: 'Smart Notifications',
      description: 'Broadcast important updates and notices to your operators and farmers.',
      icon: 'notifications'
    }
  ];

  isLoggedIn = this.authService.userProfile;

  scrollToInfo() {
    document.getElementById('info-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
