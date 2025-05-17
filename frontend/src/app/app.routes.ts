import { Routes } from '@angular/router';
import { FlightSearchComponent } from './home/flight-search.component';
import { LoginSignupComponent } from './authentic/login-signup/login-signup.component';


export const routes: Routes = [
    { path: '', component: FlightSearchComponent },
];
