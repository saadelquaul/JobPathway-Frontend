import { Component, inject, OnInit, signal } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner-component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge-component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination-component';
import { DatePipe } from '@angular/common';
import { ApplicationService } from '../../../core/services/application.service';
import { Router } from '@angular/router';
import { ApplicationResponse } from '../../../models/application.models';
import { PageResponse } from '../../../models/pagination.models';

@Component({
  selector: 'app-my-applications-component',
  imports: [LoadingSpinnerComponent, StatusBadgeComponent, PaginationComponent, DatePipe],
  templateUrl: './my-applications-component.html',
  styleUrl: './my-applications-component.css',
})
export class MyApplicationsComponent implements OnInit {
  private readonly appService = inject(ApplicationService);
  protected readonly router = inject(Router);

  loading = signal(true);
  applications = signal<ApplicationResponse[]>([]);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(0);
  totalElements = signal(0);

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading.set(true);
    this.appService.getMyApplicationsPaginated(this.currentPage(), this.pageSize()).subscribe({
      next: (page: PageResponse<ApplicationResponse>) => {
        this.applications.set(page.content);
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
    this.loadApplications();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadApplications();
  }
}

