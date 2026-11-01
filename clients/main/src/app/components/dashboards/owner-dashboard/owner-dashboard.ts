import { Component } from '@angular/core';
import { DashboardOverview } from '../dashboard-overview/dashboard-overview';

@Component({
  selector: 'app-owner-dashboard',
  imports: [DashboardOverview],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.scss',
})
export class OwnerDashboard {}
