import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isRightPanelActive: boolean = false;

  async ngOnInit() {
    // Determine initial state based on current URL
    if (this.router.url.includes('signup')) {
      this.isRightPanelActive = true;
    }
  }

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  signupForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  togglePanel() {
    this.isRightPanelActive = !this.isRightPanelActive;
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).then(() => {
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      }).catch(err => {
        console.error('Login error:', err);
        this.snackBar.open('Login failed. Please check credentials.', 'Close', { duration: 3000 });
      });
    }
  }

  onSignup() {
    if (this.signupForm.valid) {
      const { email, password, confirmPassword } = this.signupForm.value;

      if (password !== confirmPassword) {
        this.snackBar.open('Passwords do not match', 'Close', { duration: 3000 });
        return;
      }

      this.authService.signup(email, password, "farmer").then(() => {
        this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      }).catch(err => {
        console.error('Signup error:', err);
        this.snackBar.open('Signup failed. Please try again.', 'Close', { duration: 3000 });
      });
    }
  }
}
