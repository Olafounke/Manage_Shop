import { Injectable } from '@angular/core';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  async initializeApp(): Promise<void> {
    const token = this.tokenService.getToken();
    if (token) {
      try {
        const { isValidToken, tokenData } =
          await this.tokenService.verifyToken();
        if (isValidToken && tokenData) {
          this.authService.getCurrentUser().subscribe((user) => {
            this.userService.setUserEmail(user.email);
            this.userService.setUserFirstName(user.firstName || '');
            this.userService.setUserLastName(user.lastName || '');
            this.userService.setUserID(user._id || '');
            this.userService.setUserRole(tokenData.role);
            if (tokenData.store) {
              this.userService.setUserStore(tokenData.store);
            }
          });
        } else {
          this.userService.setUserEmail('');
          this.userService.setUserFirstName('');
          this.userService.setUserLastName('');
          this.userService.setUserID('');
          this.userService.setUserRole('');
          this.userService.setUserStore('');
          this.tokenService.removeToken();
          this.router.navigate(['/auth/login']);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        this.tokenService.removeToken();
        this.router.navigate(['/auth/login']);
      }
    }
  }
}
