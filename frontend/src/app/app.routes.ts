import { Routes } from '@angular/router';
import { FlightSearchComponent } from './home/flight-search.component';
import { LoginSignupComponent } from './auth/login-signup.component';
import { AirlineFirstAccessComponent } from './auth/airline-first-access.component';
import { FlightSearchResultsComponent } from './search/flight-search-results.component';
import { PassengerDashboardComponent } from './dashboard/passenger-dashboard.component';
import { TicketPurchaseComponent } from './ticket/ticket-purchase.component';

export const routes: Routes = [
    { path: '', component: FlightSearchComponent },
    { path: 'e', component: TicketPurchaseComponent }
];
