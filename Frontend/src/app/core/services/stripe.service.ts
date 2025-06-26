import { Injectable } from '@angular/core';
import { loadStripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {
  stripePromise = loadStripe(
    'pk_test_51RdXJDDFjLTwOvTBYa4UeWUJxnrviZTxnh80OHi80lHaj1Ww3kFSJhKPNhlRgCLCnu5KUQtlp91LdkQej6uwZnx300hRtv9cKB'
  ); // Clé publique

  constructor(private http: HttpClient) {}

  async checkout(cartId: string) {
    const session: any = await this.http
      .post(`${environment.apiUrl}/orders/checkout`, { cartId })
      .toPromise();
    const stripe = await this.stripePromise;
    await stripe?.redirectToCheckout({ sessionId: session.id });
  }
}
