import { Component, inject, OnInit, signal } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { JobOfferService } from '../../../core/services/job-offer.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { JobOfferResponse } from '../../../models/job.models';

@Component({
  selector: 'app-job-detail-component',
  imports: [LoadingSpinnerComponent, StatusBadgeComponent, DatePipe],
  templateUrl: './job-detail-component.html',
  styleUrl: './job-detail-component.css',
})
export class JobDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobService = inject(JobOfferService);
  private readonly appService = inject(ApplicationService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  applying = signal(false);
  job = signal<JobOfferResponse | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.jobService.getJobOfferById(id).subscribe({
      next: (data) => {
        this.job.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load job details');
      },
    });
  }

  apply(): void {
    const id = this.job()?.id;
    if (!id) return;
    this.applying.set(true);
    this.appService.applyForJob(id).subscribe({
      next: () => {
        this.applying.set(false);
        this.toast.success('Application submitted successfully!');
      },
      error: (err) => {
        this.applying.set(false);
        this.toast.error(err.error?.message || 'Failed to submit application');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/candidate/dashboard']);
  }

  formatEnum(val: string): string {
    return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
  }
}
