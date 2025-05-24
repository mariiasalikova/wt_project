# PJ

# Website Organization

## Website

### Home Page

- Search Bar
- "For Airlines" link (subtle placement)
- Login/Sign Up buttons
- Featured Flights/Promotions

## Authentication

### Login/Sign Up

### Passenger Sign-Up:

- Name
- Email
- Password + Confirmation
- Phone Number

### Passenger Login:

- Email
- Password

### Airline First-Time Access:

- Initial password (admin-assigned)
- Set New Password
- Tax Code
- Address

### Airline Admin Login:

- Id
- Password

---

## Passenger Section

### Passenger Dashboard

- My Flights (manage bookings and extras)
- Settings (profile editing, password changes, account deletion)

### Flight Search & Results

- Input: From, To, Date Range
- Optional Filters: Duration, Stops (0 or 1), Price
- Sorting Options
- Real-time seat availability
- Purchase

### Ticket Purchase Flow

- Select ticket class (Economy/Business/First)
- Choose seat(s)
- Add Extras
- Confirm and Pay

---

## Airline Section

### Airline Dashboard

- Overview: Statistics (passengers, revenue, popular routes)
- Actions:
    - Add Route (From–To)
    - Add Aircraft
        - Code
        - Seat type (Economy / Business / First)
    - Add Flight
        - Route
        - Date
        - Aircraft
        - Prices per ticket class
    - Manage Ticket Prices

---

## Settings

- Modify Profile Information
- Change Password
- Request Account Deletion

---

## Admin Section

- Add Airline (by invitation: name + temporary password)
- Add Airports
- Add Routes
- Add Users/Reset Passwords (optional)
- Delete Users

# MongoDB Handle

### users

```json
json
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  passwordHash: "...",
  phone: "1234567890",
  role: "passenger", // or "admin"
  deleted: false}
```

### airlines

```json
json
{
  _id: ObjectId,
  name: "Alitalia",
  email: "contact@alitalia.com",
  passwordHash: "...",
  taxCode: "IT123456789",
  hqAddress: "Rome, Italy",
  createdBy: ObjectId
}
```

### airports

```json
json
{
  _id: ObjectId,
  name: "Malpensa",
  city: "Milan",
  code: "MXP"
}
```

### routes

```json
json
{
  _id: ObjectId,
  airlineId: ObjectId,
  from: { airportId: ObjectId, code: "MXP" },
  to: { airportId: ObjectId, code: "JFK" }
}
```

### aircraft

```json
json
{
  _id: ObjectId,
  airlineId: ObjectId,
  code: "A320",
  seatConfig: {
    economy: 120,
    business: 24,
    first: 6
  }
}
```

### flights

```json
json
{
  _id: ObjectId,
  routeId: ObjectId,
  aircraftId: ObjectId,
  departure: ISODate("2025-06-10T14:00:00Z"),
  arrival: ISODate("2025-06-10T18:00:00Z"),
  prices: {
    economy: 120.0,
    business: 250.0,
    first: 400.0
  },
  seats: [
    {
      seatNumber: "12A",
      class: "economy",
      isTaken: false,
      ticketId: null},
  ]
}
```

### tickets

```json
json
{
  _id: ObjectId,
  userId: ObjectId,
  flightId: ObjectId,
  seatNumber: "12A",
  class: "economy",
  extras: [
    {
      name: "Extra Baggage",
      price: 30
    },
    {
      name: "Extra Legroom",
      price: 15
    }
  ],
  basePrice: 120,
  totalPrice: 165,
  purchasedAt: ISODate("2025-05-10T10:12:00Z")
}
```

### extras (optional collection)

```json
json
{
  _id: ObjectId,
  name: "Extra Baggage",
  price: 30
}
```