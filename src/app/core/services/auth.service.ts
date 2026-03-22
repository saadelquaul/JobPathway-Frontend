import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, AdminCreateRequest } from '../../models/auth.models';
import { Role } from '../../models/enums';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly currentUser = signal<AuthResponse | null>(this.loadUser());

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly userName = computed(() => this.currentUser()?.name ?? '');

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, req).pipe(
      tap((res) => this.storeUser(res)),
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/register`, req).pipe(
      tap((res) => this.storeUser(res)),
    );
  }

  createAdmin(req: AdminCreateRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/admin/create`, req);
  }

  logout(): void {
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  getRole(): string | null {
    return this.currentUser()?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getRole() === Role.ADMIN;
  }

  isCandidate(): boolean {
    return this.getRole() === Role.CANDIDATE;
  }

  private storeUser(res: AuthResponse): void {
    localStorage.setItem('auth_user', JSON.stringify(res));
    this.currentUser.set(res);
  }

  private loadUser(): AuthResponse | null {
    const data = localStorage.getItem('auth_user');
    if (!data) return null;
    try {
      return JSON.parse(data) as AuthResponse;
    } catch {
      return null;
    }
  }
}
