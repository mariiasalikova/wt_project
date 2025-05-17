import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Added RouterModule

interface FlightSearchCriteria {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string; // For round trips
}

interface FlightResult {
    id: string;
    airline: string;
    flightNumber: string;
    fromCode: string;
    toCode: string;
    departureTime: string;
    arrivalTime: string;
    departureDate: string;
    arrivalDate: string; // Could be next day
    duration: string;
    stops: number;
    price: number;
    seatsAvailable: number; // Real-time availability simplified
}

@Component({
    selector: 'app-flight-search-results',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './flight-search-results.component.html',
})
export class FlightSearchResultsComponent implements OnInit {
    searchCriteria: FlightSearchCriteria = {
        from: '',
        to: '',
        departureDate: '',
    };

    filters = {
        maxPrice: 1500,
        stops: 'any' as 'any' | '0' | '1',
        maxDuration: 24,
    };

    sortOption: string = 'price_asc';

    allFlights: FlightResult[] = []; // Raw results from API
    filteredFlights: FlightResult[] = []; // Flights after filtering and sorting
    isLoading: boolean = false;
    searchPerformed: boolean = false;


    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.searchCriteria.from = params['from'] || '';
            this.searchCriteria.to = params['to'] || '';
            this.searchCriteria.departureDate = params['departureDate'] || new Date().toISOString().split('T')[0];
            this.searchCriteria.returnDate = params['returnDate'];

            if (this.searchCriteria.from && this.searchCriteria.to && this.searchCriteria.departureDate) {
                this.fetchFlights();
            }
        });
    }

    onSearchSubmit(): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: this.searchCriteria,
            queryParamsHandling: 'merge', // Merge with existing query params
        });
        // fetchFlights will be called by queryParams subscription
    }

    fetchFlights(): void {
        this.isLoading = true;
        this.searchPerformed = true;
        this.allFlights = [];
        this.filteredFlights = [];
        console.log('Fetching flights for:', this.searchCriteria);

        // TODO: API call to fetch flights based on this.searchCriteria
        // Simulating API call with a timeout
        setTimeout(() => {
            this.allFlights = [ // Mock data
                { id: 'FL001', airline: 'SkyHigh Airways', flightNumber: 'SH202', fromCode: 'JFK', toCode: 'LAX', departureTime: '08:00', arrivalTime: '11:30', departureDate: '2024-08-10', arrivalDate: '2024-08-10', duration: '5h 30m', stops: 0, price: 350.00, seatsAvailable: 15 },
                { id: 'FL002', airline: 'Oceanic Airlines', flightNumber: 'OA815', fromCode: 'JFK', toCode: 'LAX', departureTime: '10:00', arrivalTime: '14:00', departureDate: '2024-08-10', arrivalDate: '2024-08-10', duration: '6h 00m', stops: 1, price: 280.00, seatsAvailable: 5 },
                { id: 'FL003', airline: 'Budget Wings', flightNumber: 'BW101', fromCode: 'JFK', toCode: 'LAX', departureTime: '13:30', arrivalTime: '17:15', departureDate: '2024-08-10', arrivalDate: '2024-08-10', duration: '5h 45m', stops: 0, price: 420.00, seatsAvailable: 0 },
                { id: 'FL004', airline: 'SkyHigh Airways', flightNumber: 'SH204', fromCode: 'JFK', toCode: 'LAX', departureTime: '15:00', arrivalTime: '18:30', departureDate: '2024-08-10', arrivalDate: '2024-08-10', duration: '5h 30m', stops: 0, price: 320.00, seatsAvailable: 20 },
            ];
            this.applyFilters();
            this.isLoading = false;
        }, 1500);
    }

    applyFilters(): void {
        let tempFlights = [...this.allFlights];

        // Price filter
        tempFlights = tempFlights.filter(flight => flight.price <= this.filters.maxPrice);

        // Stops filter
        if (this.filters.stops !== 'any') {
            const numStops = parseInt(this.filters.stops, 10);
            tempFlights = tempFlights.filter(flight => flight.stops === numStops);
        }

        // Duration filter (example: duration "5h 30m" needs parsing to hours)
        tempFlights = tempFlights.filter(flight => {
            const durationParts = flight.duration.match(/(\d+)h\s*(\d*)m?/);
            if (durationParts) {
                const hours = parseInt(durationParts[1], 10) || 0;
                const minutes = parseInt(durationParts[2], 10) || 0;
                return (hours + minutes / 60) <= this.filters.maxDuration;
            }
            return true; // keep if parsing fails
        });

        this.filteredFlights = tempFlights;
        this.sortResults();
    }

    sortResults(): void {
        this.filteredFlights.sort((a, b) => {
            switch (this.sortOption) {
                case 'price_asc': return a.price - b.price;
                case 'price_desc': return b.price - a.price;
                case 'duration_asc': return this.parseDuration(a.duration) - this.parseDuration(b.duration);
                case 'departure_asc': return new Date(`${a.departureDate}T${a.departureTime}`).getTime() - new Date(`${b.departureDate}T${b.departureTime}`).getTime();
                default: return 0;
            }
        });
    }

    parseDuration(durationStr: string): number { // in minutes
        const durationParts = durationStr.match(/(\d+)h\s*(\d*)m?/);
        if (durationParts) {
            const hours = parseInt(durationParts[1], 10) || 0;
            const minutes = parseInt(durationParts[2], 10) || 0;
            return hours * 60 + minutes;
        }
        return Infinity;
    }

    selectFlight(flightId: string): void {
        console.log('Selected flight:', flightId);
        // Navigate to ticket purchase flow
        this.router.navigate(['/passenger/purchase', flightId]);
    }
}