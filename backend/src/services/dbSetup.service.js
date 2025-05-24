const mongoose = require('mongoose');
const User = require('../models/User.model');
const Airline = require('../models/airline.model');
const Airport = require('../models/airport.model');
const Route = require('../models/route.model');
const Aircraft = require('../models/aircraft.model');
const Flight = require('../models/flight.model');
const Ticket = require('../models/ticket.model');
const Extra = require('../models/extra.model');
const bcrypt = require('bcryptjs');

const generateSeats = (seatConfig) => {
  const seats = [];
  const classes = [
    { name: 'first', count: seatConfig.first, prefix: 'F' },
    { name: 'business', count: seatConfig.business, prefix: 'B' },
    { name: 'economy', count: seatConfig.economy, prefix: 'E' },
  ];

  let row = 1;
  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F']; // Max 6 across, adjust if needed

  for (const seatClass of classes) {
    let seatsInClass = 0;
    while (seatsInClass < seatClass.count) {
      for (let i = 0; i < seatLetters.length && seatsInClass < seatClass.count; i++) {
        seats.push({
          seatNumber: `${String(row).padStart(2, '0')}${seatLetters[i]}`,
          class: seatClass.name,
          isTaken: false,
          ticketId: null,
        });
        seatsInClass++;
      }
      row++;
    }
  }
  return seats;
};


const setupDatabase = async () => {
  try {
    // Check if already seeded (e.g., by checking for an admin user)
    // Or use an environment variable to force seeding
    if (process.env.FORCE_DB_SETUP !== 'true') {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
        console.log('Database already contains data. Skipping setup.');
        return { message: 'Database already seeded. Set FORCE_DB_SETUP=true in .env to override.' };
        }
    }

    console.log('Starting database setup...');

    // Clear existing data (important for idempotent setup)
    // Order matters due to refs, delete children first
    console.log('Clearing existing data...');
    await Ticket.deleteMany({});
    await Flight.deleteMany({});
    await Aircraft.deleteMany({});
    await Route.deleteMany({});
    await Extra.deleteMany({}); // Optional
    await Airline.deleteMany({});
    await Airport.deleteMany({});
    await User.deleteMany({});
    console.log('Existing data cleared.');

    // Create Admin User
    console.log('Creating admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: 'AdminPassword123!', // Will be hashed by pre-save hook
      phone: '0000000000',
      role: 'admin',
    });
    console.log(`Admin user created with ID: ${adminUser._id}`);

    // Create Passenger User
    console.log('Creating passenger user...');
    const passengerUser = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      passwordHash: 'PassengerPassword123!', // Will be hashed
      phone: '1234567890',
      role: 'passenger',
    });
    console.log(`Passenger user created with ID: ${passengerUser._id}`);


    // Create Airports
    console.log('Creating airports...');
    const airportLHR = await Airport.create({ name: 'Heathrow Airport', city: 'London', code: 'LHR' });
    const airportJFK = await Airport.create({ name: 'John F. Kennedy International Airport', city: 'New York', code: 'JFK' });
    const airportMXP = await Airport.create({ name: 'Malpensa Airport', city: 'Milan', code: 'MXP' });
    console.log('Airports created.');

    // Create Airline Admin User & Airline
    console.log('Creating airline admin user...');
     const airlineAdminUser = await User.create({
      name: 'BA Admin',
      email: 'admin@ba.com',
      passwordHash: 'AirlineAdminPass1!', // Will be hashed
      phone: '1112223333',
      role: 'airline_admin',
    });
    console.log(`Airline admin user created with ID: ${airlineAdminUser._id}`);

    console.log('Creating airline...');
    const airlineBA = await Airline.create({
      name: 'British Airways',
      taxCode: 'GB123456789',
      hqAddress: 'Waterside, Harmondsworth, UK',
      createdBy: adminUser._id, // The main admin created this airline entry
      // email: 'contact@ba.com', // if airline entity has its own email/password
      passwordHash: 'AirlinePassword!', // if airline entity has its own email/password
    });
    console.log(`Airline BA created with ID: ${airlineBA._id}`);
    // Associate airlineAdminUser with airlineBA (you might add a field like `airlineId` to User model for airline_admin)
    // For now, this is implicitly linked by context or could be a separate mapping if needed.

    // 5. Create Aircraft for the Airline
    console.log('Creating aircraft for BA...');
    const aircraftA320 = await Aircraft.create({
      airlineId: airlineBA._id,
      code: 'A320neo',
      seatConfig: { economy: 150, business: 12, first: 0 },
    });
    const aircraftB777 = await Aircraft.create({
      airlineId: airlineBA._id,
      code: 'B777-300ER',
      seatConfig: { economy: 220, business: 48, first: 14 },
    });
    console.log('Aircraft created.');

    // 6. Create Routes for the Airline
    console.log('Creating routes for BA...');
    const routeLHRtoJFK = await Route.create({
      airlineId: airlineBA._id,
      from: { airportId: airportLHR._id, code: airportLHR.code },
      to: { airportId: airportJFK._id, code: airportJFK.code },
    });
    const routeLHRtoMXP = await Route.create({
      airlineId: airlineBA._id,
      from: { airportId: airportLHR._id, code: airportLHR.code },
      to: { airportId: airportMXP._id, code: airportMXP.code },
    });
    console.log('Routes created.');

    // 7. Create Flights
    console.log('Creating flights...');
    const departureLHRJFK = new Date();
    departureLHRJFK.setDate(departureLHRJFK.getDate() + 7); // 7 days from now
    departureLHRJFK.setHours(14, 0, 0, 0);
    const arrivalLHRJFK = new Date(departureLHRJFK);
    arrivalLHRJFK.setHours(arrivalLHRJFK.getHours() + 8); // 8 hour flight

    const seatsForB777 = generateSeats(aircraftB777.seatConfig);

    const flightBA101 = await Flight.create({
      routeId: routeLHRtoJFK._id,
      aircraftId: aircraftB777._id,
      airlineId: airlineBA._id,
      departure: departureLHRJFK,
      arrival: arrivalLHRJFK,
      prices: { economy: 350.00, business: 1200.00, first: 2500.00 },
      seats: seatsForB777,
      status: 'scheduled',
    });
    console.log(`Flight BA101 created with ${flightBA101.seats.length} seats.`);

    const departureLHRMXP = new Date();
    departureLHRMXP.setDate(departureLHRMXP.getDate() + 5); // 5 days from now
    departureLHRMXP.setHours(10, 30, 0, 0);
    const arrivalLHRMXP = new Date(departureLHRMXP);
    arrivalLHRMXP.setHours(arrivalLHRMXP.getHours() + 2); // 2 hour flight

    const seatsForA320 = generateSeats(aircraftA320.seatConfig);

    const flightBA201 = await Flight.create({
        routeId: routeLHRtoMXP._id,
        aircraftId: aircraftA320._id,
        airlineId: airlineBA._id,
        departure: departureLHRMXP,
        arrival: arrivalLHRMXP,
        prices: { economy: 99.00, business: 250.00, first: 0 }, // No first class on this aircraft
        seats: seatsForA320,
        status: 'scheduled',
    });
    console.log(`Flight BA201 created with ${flightBA201.seats.length} seats.`);


    // 8. Create Extras (Optional)
    console.log('Creating extras...');
    const extraBaggage = await Extra.create({ name: 'Extra Baggage', price: 50, description: 'One extra checked bag up to 23kg.' });
    const extraLegroom = await Extra.create({ name: 'Extra Legroom Seat', price: 30, description: 'More space to stretch your legs.' });
    console.log('Extras created.');

    // 9. Create a sample Ticket
    console.log('Creating a sample ticket...');
    const firstEconomySeat = flightBA101.seats.find(s => s.class === 'economy' && !s.isTaken);
    if (firstEconomySeat) {
      const ticket = await Ticket.create({
        userId: passengerUser._id,
        flightId: flightBA101._id,
        seatNumber: firstEconomySeat.seatNumber,
        class: firstEconomySeat.class,
        extras: [{ name: extraBaggage.name, price: extraBaggage.price }],
        basePrice: flightBA101.prices.economy,
        totalPrice: flightBA101.prices.economy + extraBaggage.price,
        purchasedAt: new Date(),
      });
      console.log(`Sample ticket created with ID: ${ticket._id}`);

      // Mark seat as taken
      await Flight.updateOne(
        { _id: flightBA101._id, 'seats.seatNumber': firstEconomySeat.seatNumber },
        { $set: { 'seats.$.isTaken': true, 'seats.$.ticketId': ticket._id } }
      );
      console.log(`Seat ${firstEconomySeat.seatNumber} on flight ${flightBA101._id} marked as taken.`);
    } else {
        console.log('Could not find an available economy seat for sample ticket.');
    }


    console.log('Database setup completed successfully!');
    return { message: 'Database setup completed successfully!' };

  } catch (error) {
    console.error('Error during database setup:', error);
    throw error; // Re-throw to be caught by controller
  }
};

module.exports = { setupDatabase };