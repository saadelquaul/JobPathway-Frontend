import { SlicePipe } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner-component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge-component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination-component';
import { JobOfferService } from '../../../core/services/job-offer.service';
import { Router } from '@angular/router';
import { JobOfferResponse } from '../../../models/job.models';
import { JobType, WorkModel } from '../../../models/enums';

@Component({
  selector: 'app-job-board-component',
  imports: [FormsModule, LoadingSpinnerComponent, StatusBadgeComponent, SlicePipe, PaginationComponent],
  templateUrl: './job-board-component.html',
  styleUrl: './job-board-component.css',
})
export class JobBoardComponent implements OnInit{

  private readonly jobService = inject(JobOfferService);
  private readonly router = inject(Router);

  loading = signal(true);
  jobs = signal<JobOfferResponse[]>([]);
  filteredJobs = signal<JobOfferResponse[]>([]);

  searchQuery = '';
  selectedType = '';
  selectedWorkModel = '';

  jobTypes = Object.values(JobType);
  workModels = Object.values(WorkModel);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(9);

  // Computed pagination for filtered results
  totalElements = computed(() => this.filteredJobs().length);
  totalPages = computed(() => Math.ceil(this.totalElements() / this.pageSize()));
  paginatedJobs = computed(() => {
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredJobs().slice(start, end);
  });

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading.set(true);
    // Load all open jobs for client-side filtering
    this.jobService.getOpenJobOffersPaginated(0, 1000).subscribe({
      next: (page) => {
        this.jobs.set(page.content);
        this.filteredJobs.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  filterJobs(): void {
    let result = this.jobs();
    const query = this.searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(query) ||
          j.description.toLowerCase().includes(query) ||
          j.location?.toLowerCase().includes(query) ||
          j.requiredSkills.some((s) => s.name.toLowerCase().includes(query)),
      );
    }
    if (this.selectedType) {
      result = result.filter((j) => j.type === this.selectedType);
    }
    if (this.selectedWorkModel) {
      result = result.filter((j) => j.workModel === this.selectedWorkModel);
    }
    this.filteredJobs.set(result);
    this.currentPage.set(0); // Reset to first page when filters change
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
  }

  viewJob(id: number): void {
    this.router.navigate(['/candidate/jobs', id]);
  }

  formatEnum(val: string): string {
    return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
  }

}
