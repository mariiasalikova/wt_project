import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // Added RouterModule for routerLink

@Component({
  selector: 'app-login-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-signup.component.html',
})
export class LoginSignupComponent {
  activeTab: 'login' | 'signup' = 'login';

  loginCredentials = {
    email: '',
    password: ''
  };

  signupDetails = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {}

  setActiveTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
  }

  onLoginSubmit(): void {
    if (!this.loginCredentials.email || !this.loginCredentials.password) {
      // Basic validation, more can be added with Angular forms
      alert('Please fill in all login fields.');
      return;
    }
    console.log('Login attempt:', this.loginCredentials);
    // TODO: Implement actual login logic (call API, handle response)
    // On success: this.router.navigate(['/passenger/dashboard']);
    alert('Login successful (mock)!'); // Placeholder
  }

  onSignupSubmit(): void {
    if (this.signupDetails.password !== this.signupDetails.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    // Basic validation
    if (!this.signupDetails.name || !this.signupDetails.email || !this.signupDetails.phone || !this.signupDetails.password) {
       alert('Please fill in all signup fields.');
       return;
    }
    console.log('Signup attempt:', this.signupDetails);
    // TODO: Implement actual signup logic (call API, handle response)
    // On success: this.setActiveTab('login'); alert('Signup successful! Please login.');
    alert('Sign up successful (mock)! Please login.'); // Placeholder
    this.setActiveTab('login');
  }
}