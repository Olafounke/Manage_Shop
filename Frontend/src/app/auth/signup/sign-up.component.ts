import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ControlContainer, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, CommonModule, ButtonComponent],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  successMessage = '';
  errorMessage = '';

  email = '';
  password = '';
  firstName = '';
  lastName = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(signupForm: ControlContainer): void {
    if (!signupForm.value) return;

    this.successMessage = '';
    this.errorMessage = '';

    this.authService.register(signupForm.value).subscribe({
      next: () => {
        this.successMessage =
          'Inscription réussie ! Redirection vers la page de connexion...';
        setTimeout(() => {
          this.router.navigateByUrl('/auth/login');
        }, 2000);
      },
      error: (err) => {
        console.error("Erreur lors de l'inscription:", err);
        this.errorMessage =
          err.error.message || "Une erreur est survenue lors de l'inscription";
      },
    });
  }
}
