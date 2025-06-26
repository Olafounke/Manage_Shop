import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] || [route.data['role']];
    const userRole = this.userService.getUserRole();

    if (!userRole || !requiredRoles.includes(userRole)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}
