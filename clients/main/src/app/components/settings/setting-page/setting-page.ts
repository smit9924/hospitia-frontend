import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { appRoutes } from '../../../data/app-routes';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../common/page-header/page-header';

@Component({
  selector: 'app-setting-page',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink, PageHeader],
  templateUrl: './setting-page.html',
  styleUrls: ['./setting-page.scss'],
})
export class SettingPage {
  protected readonly titleText = $localize`Settings`;

  protected readonly settings = [
    {
      id: 1,
      icon: 'darkMode',
      title: $localize`Display & Accessibility`,
      description: $localize`Adjust display and accessibility preferences.`,
      route: appRoutes.displaySettings,
    },
    {
      id: 2,
      icon: 'keySolid',
      title: $localize`Change Password`,
      description: $localize`Update your account password.`,
      route: appRoutes.changePassword,
    },
    {
      id: 3,
      icon: 'privacyTip',
      title: $localize`Privacy & Security`,
      description: $localize`Manage privacy and security settings.`,
      route: appRoutes.privacySettings,
    },
  ];

  protected trackById(_index: number, item: { id: number }) {
    return item.id;
  }
}
