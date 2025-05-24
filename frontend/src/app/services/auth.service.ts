import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError, map, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User, Airline, AuthResponse } from '../models/user.model'; // AuthResponse updated

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserKey = 'currentUser';

  private currentUserSubject: BehaviorSubject<User | Airline | null>;
  public currentUser: Observable<User | Airline | null>;
  private authCheckInProgress = false;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User | Airline | null>(this.getStoredUser());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | Airline | null {
    return this.currentUserSubject.value;
  }

  private storeUserData(userData: User | Airline): void {
    localStorage.setItem(this.currentUserKey, JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }

  private getStoredUser(): User | Airline | null {
    const userJson = localStorage.getItem(this.currentUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  private clearLocalUserData(): void {
    localStorage.removeItem(this.currentUserKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    // This is a synchronous check based on whether user data is loaded.
    // For guards, prefer checkAuthStatus() if you need to hit the backend.
    return !!this.currentUserValue;
  }

  getCurrentUserRole(): string | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }

  // Method to verify session with backend by checking cookie
  checkAuthStatus(): Observable<User | Airline | null> {
    if (this.authCheckInProgress) {
        return this.currentUser;
    }
    this.authCheckInProgress = true;
    return this.http.get<User | Airline | null>(`${this.apiUrl}/status`, { withCredentials: true }).pipe(
      tap(response => {
        if (response) {
          // Type assertion might be needed if backend returns generic User/Airline
          const userOrAirline = response as User | Airline;
          this.storeUserData(userOrAirline);
        } else {
          this.clearLocalUserData();
        }
      }),
      map(response => response ? (response as User | Airline) : null),
      catchError((error: HttpErrorResponse) => {
        this.clearLocalUserData();
        return of(null);
      }),
      finalize(() => {
        this.authCheckInProgress = false;
      })
    );
  }


  registerPassenger(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/passenger/register`, data, { withCredentials: true }).pipe(
      tap(response => {
        if (response.user) {
          this.storeUserData(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  loginPassenger(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/passenger/login`, credentials, { withCredentials: true }).pipe(
      tap(response => {
        if (response.user) {
          this.storeUserData(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  loginAirline(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/airline/login`, credentials, { withCredentials: true }).pipe(
      tap(response => {
        if (response.airline) {
          this.storeUserData(response.airline);
          // Navigation logic for requiresPasswordChange handled in component
        }
      }),
      catchError(this.handleError)
    );
  }

  setAirlineInitialDetails(data: any): Observable<any> {
    // Backend will clear the cookie on success
    return this.http.post<any>(`${this.apiUrl}/airline/set-initial-details`, data, { withCredentials: true }).pipe(
      tap(() => {
        this.clearLocalUserData();
        // Navigation to login will be handled by component or guard
      }),
      catchError(this.handleError)
    );
  }

  logout(navigateLogin: boolean = true): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.clearLocalUserData();
        if (navigateLogin) {
          this.router.navigate(['/login']);
        }
      }),
      catchError(err => {
        console.error('Logout API call failed, clearing local data as fallback', err);
        this.clearLocalUserData(); // Still clear local state
        if (navigateLogin) {
          this.router.navigate(['/login']);
        }
        return throwError(() => this.handleError(err)); // Rethrow or handle as appropriate
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error && typeof error.error.message === 'string') {
        errorMessage = error.error.message;
    } else if (typeof error.message === 'string') {
        errorMessage = error.message;
    }
    // If it's a 401 or 403, it might mean session expired or not authorized.
    if (error.status === 401 || error.status === 403) {
        this.clearLocalUserData();
    }
    return throwError(() => new Error(errorMessage));
  }
}