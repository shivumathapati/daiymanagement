import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { Farmers } from './features/farmers/farmers';
import { MilkEntry } from './features/milk-entry/milk-entry';
import { Reports } from './features/reports/reports';
import { Settings } from './features/settings/settings';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { Information } from './features/information/information';
import { Product } from './features/product/product';
import { NoticeComponent } from './features/notice/notice.component';

import { WelcomeComponent } from './features/welcome/welcome.component';

export const routes: Routes = [
    // Public Routes (No Layout)
    { path: 'login', component: WelcomeComponent },
    { path: 'signup', component: WelcomeComponent },

    // Protected Routes (With Layout)
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard },
            { path: 'farmers', component: Farmers },
            { path: 'milk-entry', component: MilkEntry },
            { path: 'reports', component: Reports },

            { path: 'settings', component: Settings },
            { path: 'information', component: Information },
            { path: 'notices', component: NoticeComponent },
            { path: 'product', component: Product },
        ]
    },

    { path: '**', redirectTo: 'dashboard' }
];
