import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing-component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login-component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register-component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'candidate',
    loadComponent: () =>
      import('./features/candidate/layout/candidate-layout-component').then(
        (m) => m.CandidateLayoutComponent,
      ),
    canActivate: [authGuard, roleGuard],
    data: { role: 'CANDIDATE' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/candidate/job-board/job-board-component').then(
            (m) => m.JobBoardComponent,
          ),
      },
      {
        path: 'jobs/:id',
        loadComponent: () =>
          import('./features/candidate/job-detail/job-detail-component').then(
            (m) => m.JobDetailComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/candidate/profile/profile').then(
            (m) => m.Profile,
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/candidate/my-applications/my-applications-component').then(
            (m) => m.MyApplicationsComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/layout/admin-layout-component').then(
        (m) => m.AdminLayoutComponent,
      ),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard-component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'job-offers',
        loadComponent: () =>
          import('./features/admin/job-offers/job-offer-list/job-offer-list-component').then(
            (m) => m.JobOfferListComponent,
          ),
      },
      {
        path: 'job-offers/new',
        loadComponent: () =>
          import('./features/admin/job-offers/job-offer-form/job-offer-form').then(
            (m) => m.JobOfferForm,
          ),
      },
      {
        path: 'job-offers/:id/edit',
        loadComponent: () =>
          import('./features/admin/job-offers/job-offer-form/job-offer-form').then(
            (m) => m.JobOfferForm,
          ),
      },
      {
        path: 'applications/:jobId',
        loadComponent: () =>
          import('./features/admin/applications/manage-applications-component').then(
            (m) => m.ManageApplicationsComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/user-list/user-list-component').then(
            (m) => m.UserListComponent,
          ),
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./features/admin/users/user-profile-view/user-profile-view-component').then(
            (m) => m.UserProfileViewComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
