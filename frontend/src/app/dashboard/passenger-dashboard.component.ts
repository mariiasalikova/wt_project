import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Added RouterModule

interface FlightBooking {
  id: string;
  from: string;
  to: string;
  date: string;
  seatNumber: string;
  class: string;
  totalPrice: number;
}

@Component({
  selector: 'app-passenger-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './passenger-dashboard.component.html',
})
export class PassengerDashboardComponent implements OnInit {
  passengerName: string = "User"; // Should be fetched from auth service
  myFlights: FlightBooking[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // TODO: Fetch passenger's name and flight bookings from a service
    this.loadPassengerData();
    this.loadMyFlights();
  }

  loadPassengerData(): void {
    // Placeholder: Fetch from auth service or user profile service
    // For now, use a default or retrieve from localStorage if stored post-login
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.passengerName = user.name || "User";
  }

  loadMyFlights(): void {
    // Placeholder: Fetch from API
    this.myFlights = [
      { id: 'TKT123', from: 'New York (JFK)', to: 'London (LHR)', date: '2024-08-15', seatNumber: '12A', class: 'Economy', totalPrice: 450.00 },
      { id: 'TKT456', from: 'Paris (CDG)', to: 'Rome (FCO)', date: '2024-09-02', seatNumber: '3B', class: 'Business', totalPrice: 780.50 },
    ];
  }

  manageBooking(flightId: string): void {
    console.log('Manage booking for flight:', flightId);
    // Navigate to a specific booking management page, e.g., add extras, change seat
    this.router.navigate(['/passenger/booking', flightId]);
  }

  viewTicket(flightId: string): void {
    console.log('View ticket for flight:', flightId);
    // Navigate to a ticket view page or open a PDF
    this.router.navigate(['/passenger/ticket', flightId]);
  }

  logout(): void {
    console.log('Logging out...');
    // TODO: Implement actual logout logic (clear session/token, call API)
    localStorage.removeItem('currentUser');
    this.router.navigate(['/auth/login']);
  }
}