import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Token, User } from '../models/user.interface';
import { TokenService } from './token.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth/';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private userService: UserService
  ) {}

  async login(user: User): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<Token>(`${this.apiUrl}login`, user)
      );
      if (!response?.token) return false;

      this.tokenService.saveToken(response.token);
      const { isValidToken, tokenData } = await this.tokenService.verifyToken();

      if (!isValidToken) {
        this.tokenService.removeToken();
        return false;
      }
      this.getCurrentUser().subscribe((user) => {
        this.userService.setUserRole(tokenData.role);
        this.userService.setUserEmail(user.email);
        this.userService.setUserFirstName(user.firstName || '');
        this.userService.setUserLastName(user.lastName || '');
        this.userService.setUserID(user._id || '');
      });
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  }

  register(user: User): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}register`, user);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}users`);
  }

  updateUser(userId: string, userData: Partial<User>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}users/${userId}`, userData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}users/${userId}`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}me`);
  }
}
