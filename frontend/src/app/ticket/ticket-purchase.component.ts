import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface ClassOption {
    name: 'Economy' | 'Business' | 'First';
    price: number;
    seatsAvailable: number;
}

interface FlightFullDetails {
    id: string;
    flightNumber: string;
    fromCode: string;
    toCode: string;
    departureDate: string;
    availableClasses: ClassOption[];
    // Other details like airline, departure/arrival times etc.
}

interface ExtraOption {
    id: string;
    name: string;
    price: number;
}

interface PurchaseDetails {
    ticketClass: 'Economy' | 'Business' | 'First' | null;
    seatNumbers: string; // Comma-separated for multiple, simplified
    selectedExtras: ExtraOption[];
    basePrice: number;
    totalPrice: number;
}

@Component({
    selector: 'app-ticket-purchase',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './ticket-purchase.component.html',
})
export class TicketPurchaseComponent implements OnInit {
    flightId: string | null = null;
    flightDetails: FlightFullDetails | null = null;
    isLoadingFlight: boolean = true;
    submitted: boolean = false; // To show validation messages on submit attempt if needed

    purchaseDetails: PurchaseDetails = {
        ticketClass: null,
        seatNumbers: '',
        selectedExtras: [],
        basePrice: 0,
        totalPrice: 0
    };

    availableExtras: ExtraOption[] = [
        { id: 'ext1', name: 'Extra Baggage (23kg)', price: 30 },
        { id: 'ext2', name: 'Priority Boarding', price: 15 },
        { id: 'ext3', name: 'In-flight Meal Upgrade', price: 20 },
        { id: 'ext4', name: 'Travel Insurance', price: 25 },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.flightId = this.route.snapshot.paramMap.get('flightId');
        if (this.flightId) {
            this.loadFlightDetails(this.flightId);
        } else {
            this.isLoadingFlight = false;
            // Handle error: no flight ID
            console.error("No flight ID provided");
            this.router.navigate(['/flights/search']);
        }
    }

    loadFlightDetails(id: string): void {
        this.isLoadingFlight = true;
        console.log('Loading details for flight ID:', id);
        // TODO: API call to fetch full flight details including class prices and seat availability
        // Mocking API call
        setTimeout(() => {
            // This data should come from your 'flights' collection, specifically prices and seat availability.
            this.flightDetails = {
                id: id,
                flightNumber: 'SH202',
                fromCode: 'JFK',
                toCode: 'LAX',
                departureDate: '2024-08-10',
                availableClasses: [
                    { name: 'Economy', price: 350.00, seatsAvailable: 15 },
                    { name: 'Business', price: 750.00, seatsAvailable: 5 },
                    { name: 'First', price: 1200.00, seatsAvailable: 2 },
                ]
            };
            this.isLoadingFlight = false;
        }, 1000);
    }

    selectClass(className: 'Economy' | 'Business' | 'First'): void {
        this.purchaseDetails.ticketClass = className;
        const selectedClassDetail = this.flightDetails?.availableClasses.find(c => c.name === className);
        this.purchaseDetails.basePrice = selectedClassDetail ? selectedClassDetail.price : 0;
        this.calculateTotalPrice();
    }

    toggleExtra(extra: ExtraOption, event: Event): void {
        const checkbox = event.target as HTMLInputElement;
        if (checkbox.checked) {
            this.purchaseDetails.selectedExtras.push(extra);
        } else {
            this.purchaseDetails.selectedExtras = this.purchaseDetails.selectedExtras.filter(e => e.id !== extra.id);
        }
        this.calculateTotalPrice();
    }

    getBasePrice(): number {
        return this.purchaseDetails.basePrice;
    }

    calculateTotalPrice(): number {
        let total = this.purchaseDetails.basePrice;
        this.purchaseDetails.selectedExtras.forEach(extra => {
            total += extra.price;
        });
        this.purchaseDetails.totalPrice = total;
        return total;
    }

    confirmPurchase(): void {
        this.submitted = true;
        if (!this.purchaseDetails.ticketClass) {
            alert('Please select a ticket class.');
            return;
        }
        if (!this.purchaseDetails.seatNumbers) {
            alert('Please enter your seat selection.');
            return;
        }

        console.log('Confirming purchase:', this.purchaseDetails);
        // TODO: API call to create ticket(s) and process payment
        // On success:
        alert(`Purchase Confirmed (Mock)! Total: $${this.purchaseDetails.totalPrice.toFixed(2)}. Ticket ID: TKT${Math.floor(Math.random() * 900000) + 100000}`);
        this.router.navigate(['/passenger/dashboard']); // Or to a "thank you" page
        // On failure:
        // alert('Purchase failed. Please try again.');
    }
}