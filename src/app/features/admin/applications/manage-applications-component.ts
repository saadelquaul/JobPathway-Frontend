import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner-component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge-component';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { JobOfferService } from '../../../core/services/job-offer.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ApplicationResponse } from '../../../models/application.models';
import { ApplicationStatus } from '../../../models/enums';

@Component({
  selector: 'app-manage-applications-component',
  imports: [FormsModule, LoadingSpinnerComponent, StatusBadgeComponent, DatePipe],
  templateUrl: './manage-applications-component.html',
  styleUrl: './manage-applications-component.css',
})
export class ManageApplicationsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly appService = inject(ApplicationService);
  private readonly jobService = inject(JobOfferService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  applications = signal<ApplicationResponse[]>([]);
  jobTitle = signal('');
  statuses = Object.values(ApplicationStatus);
  selectedStatus = signal<Record<number, string>>({});
  meetingDates = signal<Record<number, string>>({});
  updating = signal<Record<number, boolean>>({});

  ngOnInit(): void {
    const jobId = Number(this.route.snapshot.paramMap.get('jobId'));

    this.jobService.getJobOfferById(jobId).subscribe({
      next: (job) => this.jobTitle.set(job.title),
    });

    this.appService.getApplicationsByJobOffer(jobId).subscribe({
      next: (data) => {
        this.applications.set(data);
        const statuses: Record<number, string> = {};
        const dates: Record<number, string> = {};
        data.forEach((a) => {
          statuses[a.id] = a.status;
          if (a.meetingDate) dates[a.id] = a.meetingDate;
        });
        this.selectedStatus.set(statuses);
        this.meetingDates.set(dates);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); },
    });
  }

  onStatusChange(app: ApplicationResponse, newStatus: string): void {
    this.selectedStatus.update((s) => ({ ...s, [app.id]: newStatus }));
  }

  onMeetingDateChange(appId: number, date: string): void {
    this.meetingDates.update((d) => ({ ...d, [appId]: date }));
  }

  updateStatus(app: ApplicationResponse): void {
    const status = this.selectedStatus()[app.id] as ApplicationStatus;
    const meetingDate = status === ApplicationStatus.MEETING_SCHEDULED ? this.meetingDates()[app.id] : undefined;
    this.updating.update((u) => ({ ...u, [app.id]: true }));
    this.appService.updateApplicationStatus(app.id, { status, meetingDate }).subscribe({
      next: (updated) => {
        this.applications.update((list) => list.map((a) => (a.id === app.id ? updated : a)));
        this.updating.update((u) => ({ ...u, [app.id]: false }));
        this.toast.success('Status updated');
      },
      error: () => {
        this.updating.update((u) => ({ ...u, [app.id]: false }));
        this.toast.error('Failed to update status');
      },
    });
  }

  formatEnum(val: string): string {
    return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
  }
}

