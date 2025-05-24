import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common'; // For ngIf, ngFor

@Component({
  selector: 'app-passenger-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './passenger-login.component.html',
  // styleUrls: ['./passenger-login.component.css'] // Add if you have styles
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
    if (this.authService.isAuthenticated()) {
        // Redirect if already logged in, perhaps to a dashboard
        const role = this.authService.getCurrentUserRole();
        if (role === 'passenger') this.router.navigate(['/passenger/dashboard']);
        // Add other role checks if needed
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }
    this.loading = true;
    this.errorMessage = null;
    this.authService.loginPassenger(this.loginForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/passenger/dashboard']); // Or wherever passengers go
      },
      error: (err) => {
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