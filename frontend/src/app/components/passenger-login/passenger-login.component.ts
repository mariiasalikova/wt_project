import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { AuthResponse, User } from '../../models/user.model'; // Import AuthResponse and User

@Component({
  selector: 'app-passenger-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './passenger-login.component.html',
})
export class PassengerLoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // If user data is already in AuthService (e.g., navigated back), redirect immediately
    if (this.authService.currentUserValue) {
      this.redirectUserBasedOnRole(this.authService.currentUserValue.role);
    } else {
      // Otherwise, check with the backend if there's a valid session cookie
      // This handles cases like page refresh when already logged in.
      this.authService.checkAuthStatus().subscribe({
        next: (user) => {
          if (user) {
            this.redirectUserBasedOnRole(user.role);
          }
          // If no user, they are not logged in, so stay on the login page.
        },
        error: () => {
          // Error checking status (e.g., network issue, or 401 if cookie invalid/expired)
          // Stay on login page. AuthService would have cleared local user data.
        }
      });
    }
  }

  private redirectUserBasedOnRole(role: string | null): void {
    // This component is PassengerLogin, so we primarily care about 'passenger'
    if (role === 'passenger') {
      this.router.navigate(['/passenger/dashboard']); // Or your passenger-specific route
    } else if (role) {
      // If for some reason a non-passenger is here and logged in, redirect to a generic place or home
      console.warn(`PassengerLoginComponent: User with role '${role}' detected. Redirecting to home.`);
      this.router.navigate(['/']);
    }
    // If role is null, do nothing (stay on login page)
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }
    this.loading = true;
    this.errorMessage = null;

    // AuthService.loginPassenger now expects AuthResponse without a token
    // but with a user object. The cookie is set by the backend.
    this.authService.loginPassenger(this.loginForm.value).subscribe({
      next: (response: AuthResponse) => { // response is AuthResponse
        this.loading = false;
        // AuthService has already processed the response and stored user data.
        // Now, just navigate based on the role from the response.
        if (response.user) {
          this.redirectUserBasedOnRole(response.user.role);
        } else {
          // This should ideally not happen if login is successful and backend sends user object
          this.errorMessage = 'Login successful, but user data was not received. Please try again.';
          console.error('Login successful but no user object in response:', response);
        }
      },
      error: (err) => { // err is an Error object from AuthService's handleError
        this.loading = false;
        this.errorMessage = err.message || 'Login failed. Please check your credentials.';
        console.error('Login error:', err);
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}