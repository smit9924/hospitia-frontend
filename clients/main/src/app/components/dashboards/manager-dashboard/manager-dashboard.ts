import { Component } from '@angular/core';
import { DashboardOverview } from '../dashboard-overview/dashboard-overview';

@Component({
  selector: 'app-manager-dashboard',
  imports: [DashboardOverview],
  templateUrl: './manager-dashboard.html',
  styleUrl: './manager-dashboard.scss',
})
export class ManagerDashboard {}
