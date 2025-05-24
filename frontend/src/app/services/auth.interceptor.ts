 import { Injectable } from '@angular/core';
 import {
   HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
 } from '@angular/common/http';
 import { Observable } from 'rxjs';
 // No longer needs AuthService for token
 // import { AuthService } from './auth.service';

 @Injectable()
 export class AuthInterceptor implements HttpInterceptor {

   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
     // Clone the request and set withCredentials to true
     const authReq = req.clone({
       withCredentials: true
     });
     return next.handle(authReq);
   }
 }