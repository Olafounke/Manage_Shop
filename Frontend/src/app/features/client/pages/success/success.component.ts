import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';
import { PaymentStatus } from '../../../../core/models/order.interface';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
})
export class SuccessComponent implements OnInit {
  sessionId: string | null = null;
  isLoading = true;
  paymentStatus = '';
  orderId: string | null = null;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.sessionId = params['session_id'];
      if (this.sessionId) {
        this.verifyPayment();
      } else {
        this.paymentStatus = 'error';
        this.errorMessage = 'Session ID manquant';
        this.isLoading = false;
      }
    });
  }

  private verifyPayment(): void {
    if (!this.sessionId) return;

    this.orderService.verifyPayment(this.sessionId).subscribe({
      next: (response: PaymentStatus) => {
        if (response.success) {
          this.paymentStatus = 'success';
          this.orderId = response.orderId || null;
        } else {
          this.paymentStatus = 'error';
          this.errorMessage =
            response.message || 'Erreur lors de la vérification du paiement';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la vérification du paiement:', error);
        this.paymentStatus = 'error';
        this.errorMessage = 'Erreur de connexion au serveur';
        this.isLoading = false;
      },
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToOrders(): void {
    this.router.navigate(['/user/orders']);
  }
}
