import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isAuthenticated()) {
      const userRole = this.authService.getCurrentUserRole();
      const expectedRoles = route.data['roles'] as Array<string>;

      if (expectedRoles && expectedRoles.length > 0) {
        if (userRole && expectedRoles.includes(userRole)) {
          return true; // Role matches
        } else {
          console.warn('User role does not match expected roles for this route.');
          // Redirect to an unauthorized page or home
          this.router.navigate(['/']); // Or an 'unauthorized' component
          return false;
        }
      }
      return true; // No specific roles required, just authentication
    } else {
      // Not authenticated, redirect to login page with the return url
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
      return false;
    }
  }
}