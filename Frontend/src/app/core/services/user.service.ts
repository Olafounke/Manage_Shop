import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private email = signal('');
  private role = signal('');
  private firstName = signal('');
  private lastName = signal('');
  private _id = signal('');
  private store = signal('');

  getUserEmail(): string {
    return this.email();
  }

  setUserEmail(email: string): void {
    this.email.set(email);
  }

  getUserRole(): string {
    return this.role();
  }

  setUserRole(userRole: string): void {
    this.role.set(userRole);
  }

  getUserFirstName(): string {
    return this.firstName();
  }

  setUserFirstName(firstName: string): void {
    this.firstName.set(firstName);
  }

  getUserLastName(): string {
    return this.lastName();
  }

  setUserLastName(lastName: string): void {
    this.lastName.set(lastName);
  }

  getUserStore(): string {
    return this.store();
  }

  setUserStore(store: string): void {
    this.store.set(store);
  }

  getUserID(): string {
    return this._id();
  }

  setUserID(id: string): void {
    this._id.set(id);
  }
}
