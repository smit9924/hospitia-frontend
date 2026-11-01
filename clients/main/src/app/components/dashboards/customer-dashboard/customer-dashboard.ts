import { Component } from '@angular/core';
import { DashboardOverview } from '../dashboard-overview/dashboard-overview';

@Component({
  selector: 'app-customer-dashboard',
  imports: [DashboardOverview],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.scss',
})
export class CustomerDashboard {}
