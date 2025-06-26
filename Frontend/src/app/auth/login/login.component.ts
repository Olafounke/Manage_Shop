import { Component } from '@angular/core';
import { ControlContainer, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(loginForm: ControlContainer): Promise<void> {
    if (!loginForm.value) return;

    this.errorMessage = '';
    try {
      const isLoggedIn = await this.authService.login(loginForm.value);
      if (isLoggedIn) {
        this.router.navigateByUrl('/');
      } else {
        this.errorMessage = 'Email ou mot de passe incorrect';
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      this.errorMessage = 'Une erreur est survenue lors de la connexion';
    }
  }
}
