import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-flight-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flight-search.component.html',
})
export class FlightSearchComponent {
  selectedTransport: string = 'flights';

  // Dummy data for form fields
  fromLocation: string = 'Saint Petersburg';
  toLocation: string = 'San Francisco';
  flyOutDate: string = '16.02.2018';
  flyBackDate: string = '15.05.2018';
  passengers: string = '2 adults';

  constructor() { }

  selectTransport(type: string): void {
    this.selectedTransport = type;
  }

  onFormSubmit(): void {
    // Handle form submission logic
    console.log('Searching for tickets with data:', {
      from: this.fromLocation,
      to: this.toLocation,
      flyOut: this.flyOutDate,
      flyBack: this.flyBackDate,
      passengers: this.passengers,
      transportType: this.selectedTransport
    });
  }

  swapLocations(): void {
    const temp = this.fromLocation;
    this.fromLocation = this.toLocation;
    this.toLocation = temp;
  }
}