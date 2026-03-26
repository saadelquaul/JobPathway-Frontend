import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UserService } from '../../../../core/services/user.service';
import { CandidateProfileResponse } from '../../../../models/candidate.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner-component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination-component';

@Component({
  selector: 'app-user-list',
  imports: [LoadingSpinnerComponent, PaginationComponent],
  templateUrl: './user-list-component.html',
  styleUrl: './user-list-component.css',
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly router = inject(Router);

  loading = signal(true);
  users = signal<CandidateProfileResponse[]>([]);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService
      .getAllUsersPaginated(this.currentPage(), this.pageSize(), ['id,desc'])
      .subscribe({
        next: (page) => {
          this.users.set(page.content);
          this.totalPages.set(page.totalPages);
          this.totalElements.set(page.totalElements);
          this.currentPage.set(page.number);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadUsers();
  }

  viewProfile(userId: number): void {
    this.router.navigate(['/admin/users', userId]);
  }

  viewApplications(userId: number): void {
    this.router.navigate(['/admin/users', userId], { fragment: 'applications' });
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
