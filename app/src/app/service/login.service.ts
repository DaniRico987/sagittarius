import { Injectable } from '@angular/core';
import { responseLogin, UserLogin } from '../interface/user-login-interface';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  responseRegister,
  UserRegister,
} from '../interface/user-register-interface';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  token: string = '';
  // endPoint = 'https://pkbvmxnl-3000.use2.devtunnels.ms/auth';
  endPoint = environment.apiUrl + '/auth';

  constructor(private http: HttpClient, private router: Router) {
    // Load token from localStorage on service initialization
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage() {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      this.token = savedToken;
    }
  }

  setToken(token: string) {
    this.token = token;
    // Save token to localStorage
    localStorage.setItem('authToken', token);
  }

  getTokenValidation() {
    return this.token ? true : false;
  }

  loginUser(body: UserLogin): Observable<responseLogin> {
    return this.http.post<responseLogin>(this.endPoint + '/login', body);
  }

  registerUser(body: UserRegister): Observable<responseRegister> {
    return this.http.post<responseRegister>(this.endPoint + '/register', body);
  }

  resetPassword(
    email: string,
    newPassword: string
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      this.endPoint + '/reset-password',
      {
        email,
        newPassword,
      }
    );
  }

  logout() {
    this.token = '';
    // Clear token from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
