import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell-component';

@Component({
  selector: 'app-candidate-layout-component',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './candidate-layout-component.html',
  styleUrl: './candidate-layout-component.css',
})
export class CandidateLayoutComponent {
    protected readonly authService = inject(AuthService);
}
