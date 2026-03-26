import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { CandidateProfileResponse } from '../../../../models/candidate.models';
import { ApplicationResponse } from '../../../../models/application.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner-component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination-component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge-component';

@Component({
  selector: 'app-user-profile-view',
  imports: [LoadingSpinnerComponent, PaginationComponent, StatusBadgeComponent, DatePipe],
  templateUrl: './user-profile-view-component.html',
  styleUrl: './user-profile-view-component.css',
})
export class UserProfileViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  protected readonly router = inject(Router);

  loading = signal(true);
  applicationsLoading = signal(false);
  profile = signal<CandidateProfileResponse | null>(null);
  applications = signal<ApplicationResponse[]>([]);
  candidateId = signal<number>(0);

  // Pagination for applications
  currentPage = signal(0);
  pageSize = signal(5);
  totalPages = signal(0);
  totalElements = signal(0);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.candidateId.set(id);
    this.loadProfile();
    this.loadApplications();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService.getCandidateProfileById(this.candidateId()).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/users']);
      },
    });
  }

  loadApplications(): void {
    this.applicationsLoading.set(true);
    this.userService
      .getCandidateApplications(this.candidateId(), this.currentPage(), this.pageSize())
      .subscribe({
        next: (page) => {
          this.applications.set(page.content);
          this.totalPages.set(page.totalPages);
          this.totalElements.set(page.totalElements);
          this.currentPage.set(page.number);
          this.applicationsLoading.set(false);
        },
        error: () => {
          this.applicationsLoading.set(false);
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadApplications();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadApplications();
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  formatEnum(value: string): string {
    return value
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
