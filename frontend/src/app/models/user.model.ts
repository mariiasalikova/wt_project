export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Optional for passenger
  role: 'passenger' | 'admin' | 'airline'; // 'airline' role for airline users
}

export interface Airline extends User { // Airlines can share some User properties
  taxCode?: string;
  hqAddress?: string;
  isTemporaryPassword?: boolean; // From backend response
}

export interface AuthResponse {
  token: string;
  user?: User; // For passenger/admin login
  airline?: Airline; // For airline login
  requiresPasswordChange?: boolean; // For airline first-time login
}