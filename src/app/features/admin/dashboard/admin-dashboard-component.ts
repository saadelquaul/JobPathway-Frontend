import { Component, inject, OnInit, signal } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { JobOfferService } from '../../../core/services/job-offer.service';
import { Router } from '@angular/router';
import { JobOfferResponse } from '../../../models/job.models';
import { forkJoin } from 'rxjs';
import { JobStatus } from '../../../models/enums';

@Component({
  selector: 'app-admin-dashboard-component',
  imports: [LoadingSpinnerComponent],
  templateUrl: './admin-dashboard-component.html',
  styleUrl: './admin-dashboard-component.css',
})
export class AdminDashboardComponent implements OnInit {
  private readonly jobService = inject(JobOfferService);
  protected readonly router = inject(Router);

  loading = signal(true);
  totalJobs = signal(0);
  openJobs = signal(0);
  closedJobs = signal(0);
  recentJobs = signal<JobOfferResponse[]>([]);

  ngOnInit(): void {
    forkJoin({
      all: this.jobService.getAllJobOffers(),
      open: this.jobService.getOpenJobOffers(),
    }).subscribe({
      next: ({ all, open }) => {
        this.totalJobs.set(all.length);
        this.openJobs.set(open.length);
        this.closedJobs.set(all.filter((j) => j.status === JobStatus.CLOSED).length);
        this.recentJobs.set(all.slice(0, 5));
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  formatEnum(val: string): string {
    return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
  }
  
}

