// Assumes AuthService is injectable and provided.
// Assumes HttpRequest, HttpHandler, HttpEvent are types/classes available from Angular's HTTP module.

export class AuthInterceptor { // In TS, would implement HttpInterceptor
  constructor(authService) {
    this.authService = authService; // Instance of your AuthService
  }

  intercept(req, next) { // req: HttpRequest, next: HttpHandler
    const authToken = this.authService.getToken();
    if (authToken) {
      // Clone the request to add the new header.
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${authToken}`)
      });
      // Pass on the cloned request instead of the original request.
      return next.handle(authReq);
    }
    return next.handle(req);
  }
}