import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-airline-first-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './airline-first-access.component.html',
})
export class AirlineFirstAccessComponent {
  airlineSetupData = {
    initialPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    taxCode: '',
    address: ''
  };

  constructor(private router: Router) {}

  onSetupSubmit(): void {
    if (this.airlineSetupData.newPassword !== this.airlineSetupData.confirmNewPassword) {
      alert('New passwords do not match.');
      return;
    }
    // Basic validation
    if (!this.airlineSetupData.initialPassword || !this.airlineSetupData.newPassword || !this.airlineSetupData.taxCode || !this.airlineSetupData.address) {
      alert('Please fill all fields.');
      return;
    }

    console.log('Airline setup data:', this.airlineSetupData);
    // TODO: Implement actual setup logic (call API, handle response)
    // Likely involves sending the airline's email/ID (obtained from a token or route param) along with this data.
    // On success: this.router.navigate(['/airline/dashboard']);
    alert('Airline account setup successful (mock)!'); // Placeholder
    this.router.navigate(['/airline/dashboard']); // Navigate to airline dashboard
  }
}