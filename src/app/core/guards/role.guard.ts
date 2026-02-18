import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map, take, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const snackBar = inject(MatSnackBar);
    const requiredRoles = route.data['role'] as string[];

    return authService.userProfile$.pipe(
        take(1),
        map(profile => {
            // Allow if no roles defined (shouldn't happen if guard is used)
            if (!requiredRoles || requiredRoles.length === 0) return true;

            if (!profile || !profile.role) return false;

            // Check if user has one of the required roles
            return requiredRoles.includes(profile.role);
        }),
        tap(hasAccess => {
            if (!hasAccess) {
                snackBar.open('Access Denied: Insufficient Permissions', 'Close', { duration: 3000 });
                router.navigate(['/dashboard']);
            }
        })
    );
};
