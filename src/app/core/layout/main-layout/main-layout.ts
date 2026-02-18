import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../shared/material.module';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MatToolbar } from '@angular/material/toolbar';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { MatNavList } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, MatToolbar, MatSidenavContainer, MatNavList, MatIcon],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  private breakpointObserver = inject(BreakpointObserver);
  authService = inject(AuthService);
  private router = inject(Router);

  isAdmin = this.authService.isAdmin;
  isoperator = this.authService.isoperator;
  isfarmer = this.authService.isfarmer;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
