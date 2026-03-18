import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-candidate-layout-component',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './candidate-layout-component.html',
  styleUrl: './candidate-layout-component.css',
})
export class CandidateLayoutComponent {
    protected readonly authService = inject(AuthService);
}
