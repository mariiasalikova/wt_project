import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map, catchError, switchMap } from 'rxjs/operators';
import { User, Airline } from '../models/user.model'; // Ensure User/Airline types are available

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.currentUser.pipe(
      switchMap(user => {
        if (user) {
          // User data already loaded, proceed with authorization check
          return of(this.handleAuthorization(route, user, state));
        } else {
          return this.authService.checkAuthStatus().pipe(
            map(statusUser => {
              if (statusUser) {
                return this.handleAuthorization(route, statusUser, state);
              } else {
                return this.redirectToLogin(state);
              }
            }),
            catchError(() => {
              return of(this.redirectToLogin(state));
            })
          );
        }
      })
    );
  }

  private handleAuthorization(route: ActivatedRouteSnapshot, user: User | Airline, state: RouterStateSnapshot): boolean | UrlTree {
    const expectedRoles = route.data['roles'] as Array<string>;

    if (expectedRoles && expectedRoles.length > 0) {
      if (user.role && expectedRoles.includes(user.role)) {
        return true; // Role matches
      } else {
        console.warn(`User role '${user.role}' does not match expected roles '${expectedRoles.join(', ')}' for route ${state.url}.`);
        // Redirect to an unauthorized page or home
        this.router.navigate(['/']);
        return false;
      }
    }
    return true;
  }

  private redirectToLogin(state: RouterStateSnapshot): UrlTree {
    console.log(`AuthGuard: Not authenticated, redirecting to login. Target URL: ${state.url}`);
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url }});
  }
}