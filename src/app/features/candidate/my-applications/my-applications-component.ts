import { Component, inject, OnInit, signal } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { DatePipe } from '@angular/common';
import { ApplicationService } from '../../../core/services/application.service';
import { Router } from '@angular/router';
import { ApplicationResponse } from '../../../models/application.models';

@Component({
  selector: 'app-my-applications-component',
  imports: [LoadingSpinnerComponent, StatusBadgeComponent, DatePipe],
  templateUrl: './my-applications-component.html',
  styleUrl: './my-applications-component.css',
})
export class MyApplicationsComponent implements OnInit {
  private readonly appService = inject(ApplicationService);
  protected readonly router = inject(Router);

  loading = signal(true);
  applications = signal<ApplicationResponse[]>([]);

  ngOnInit(): void {
    this.appService.getMyApplications().subscribe({
      next: (data) => {
        this.applications.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}

