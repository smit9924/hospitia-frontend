import { Component } from '@angular/core';
import { DashboardOverview } from '../dashboard-overview/dashboard-overview';

@Component({
  selector: 'app-admin-dashboard',
  imports: [DashboardOverview],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {}
