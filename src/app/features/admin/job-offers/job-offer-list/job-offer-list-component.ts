import { Component, inject, OnInit, signal } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DatePipe } from '@angular/common';
import { JobOfferService } from '../../../../core/services/job-offer.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { Router } from '@angular/router';
import { JobOfferResponse } from '../../../../models/job.models';
import { JobStatus } from '../../../../models/enums';

@Component({
  selector: 'app-job-offer-list-component',
  imports: [LoadingSpinnerComponent, StatusBadgeComponent, ConfirmDialogComponent, DatePipe],
  templateUrl: './job-offer-list-component.html',
  styleUrl: './job-offer-list-component.css',
})
export class JobOfferListComponent implements OnInit {
  private readonly jobService = inject(JobOfferService);
  private readonly toast = inject(ToastService);
  protected readonly router = inject(Router);

  loading = signal(true);
  jobs = signal<JobOfferResponse[]>([]);
  showDeleteConfirm = signal(false);
  deleteId = signal<number | null>(null);
  readonly JobStatus = JobStatus;

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.jobService.getAllJobOffers().subscribe({
      next: (data) => { this.jobs.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  confirmDelete(id: number): void {
    this.deleteId.set(id);
    this.showDeleteConfirm.set(true);
  }

  executeDelete(): void {
    const id = this.deleteId();
    if (!id) return;
    this.jobService.deleteJobOffer(id).subscribe({
      next: () => {
        this.jobs.update((list) => list.filter((j) => j.id !== id));
        this.toast.success('Job offer deleted');
        this.showDeleteConfirm.set(false);
      },
      error: () => {
        this.toast.error('Failed to delete job offer');
        this.showDeleteConfirm.set(false);
      },
    });
  }

  formatEnum(val: string): string {
    return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
  }

  toggleStatus(job: JobOfferResponse): void {
    const newStatus = job.status === JobStatus.OPEN ? JobStatus.CLOSED : JobStatus.OPEN;
    this.jobService.updateJobOfferStatus(job.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.jobs.update((list) => list.map((j) => (j.id === updated.id ? updated : j)));
        this.toast.success(`Job offer ${newStatus === JobStatus.OPEN ? 'opened' : 'closed'}`);
      },
      error: () => this.toast.error('Failed to update status'),
    });
  }
}

