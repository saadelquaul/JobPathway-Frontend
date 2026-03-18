import { SlicePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { JobOfferService } from '../../../core/services/job-offer.service';
import { Router } from '@angular/router';
import { JobOfferResponse } from '../../../models/job.models';
import { JobType, WorkModel } from '../../../models/enums';

@Component({
  selector: 'app-job-board-component',
  imports: [FormsModule, LoadingSpinnerComponent, StatusBadgeComponent, SlicePipe],
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

  ngOnInit(): void {
    this.jobService.getOpenJobOffers().subscribe({
      next: (data) => {
        this.jobs.set(data);
        this.filteredJobs.set(data);
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
  }

  viewJob(id: number): void {
    this.router.navigate(['/candidate/jobs', id]);
  }

  formatEnum(val: string): string {
    return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
  }

}
