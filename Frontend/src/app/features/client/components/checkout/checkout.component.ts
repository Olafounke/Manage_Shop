import { Component } from '@angular/core';
import { StripeService } from '../../../../core/services/stripe.service';

@Component({
  selector: 'app-checkout',
  template: `<button (click)="checkout()">Payer</button>`,
})
export class CheckoutComponent {
  constructor(private stripe: StripeService) {}

  checkout() {
    this.stripe.checkout('id-du-panier'); // ou récupéré dynamiquement
  }
}
