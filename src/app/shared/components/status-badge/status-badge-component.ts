import { Component, input } from '@angular/core';
import { ApplicationStatus, JobStatus } from '../../../models/enums';

@Component({
  selector: 'app-status-badge-component',
  imports: [],
  templateUrl: './status-badge-component.html',
  styleUrl: './status-badge-component.css',
})
export class StatusBadgeComponent {
status = input.required<string>();

  badgeClass(): string {
    const s = this.status();
    switch (s) {
      case ApplicationStatus.PENDING: return 'badge-pending';
      case ApplicationStatus.IN_REVIEW: return 'badge-in-review';
      case ApplicationStatus.APPROVED: return 'badge-approved';
      case ApplicationStatus.REJECTED: return 'badge-rejected';
      case ApplicationStatus.MEETING_SCHEDULED: return 'badge-meeting';
      case JobStatus.OPEN: return 'badge-open';
      case JobStatus.CLOSED: return 'badge-closed';
      default: return 'badge-default';
    }
  }

  formatLabel(): string {
    return this.status().replace(/_/g, ' ').toLowerCase();
  }
}
