import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IconList } from '../../../data/icon-list';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-icons',
  imports: [MatIconModule, MatCardModule],
  templateUrl: './icons.html',
  styleUrl: './icons.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icons {
  protected readonly IconList = IconList;
}
