import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoaderService } from '../../../services/loader.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: ` 
    @if (loader.loading()) {
    <div class="loader-container">
      <mat-spinner></mat-spinner>
    </div>
    }
  `,
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  loader = inject(LoaderService);
 }
