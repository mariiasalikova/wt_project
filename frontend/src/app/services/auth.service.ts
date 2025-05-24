import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User, Airline, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'authToken';
  private currentUserKey = 'currentUser';

  private currentUserSubject: BehaviorSubject<User | Airline | null>;
  public currentUser: Observable<User | Airline | null>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | Airline | null>(this.getStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | Airline | null {
    return this.currentUserSubject.value;
  }

  private storeAuthData(token: string, userData: User | Airline): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.currentUserKey, JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }

  private getStoredUser(): User | Airline | null {
    const userJson = localStorage.getItem(this.currentUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }

  registerPassenger(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/passenger/register`, data).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.storeAuthData(response.token, response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  loginPassenger(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/passenger/login`, credentials).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.storeAuthData(response.token, response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  loginAirline(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/airline/login`, credentials).pipe(
      tap(response => {
        if (response.token && response.airline) {
          this.storeAuthData(response.token, response.airline);
          // Navigation logic will be handled in component based on requiresPasswordChange
        }
      }),
      catchError(this.handleError)
    );
  }

  setAirlineInitialDetails(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/airline/set-initial-details`, data).pipe(
      tap(() => {
        // After setting details, typically airline needs to log out or re-login
        // For simplicity, we can clear current user and redirect to login
        // Or backend could return a new token if flow allows
        this.logout(false); // Logout without immediate redirect, component will handle
      }),
      catchError(this.handleError)
    );
  }

  logout(navigateLogin: boolean = true): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.currentUserKey);
    this.currentUserSubject.next(null);
    if (navigateLogin) {
      this.router.navigate(['/login']); // Or a generic login page
    }
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    // Here you could parse error.error for backend messages
    let errorMessage = 'An unknown error occurred!';
    if (error.error && error.error.message) {
        errorMessage = error.error.message;
    } else if (error.message) {
        errorMessage = error.message;
    }
    return throwError(() => new Error(errorMessage));
  }
}