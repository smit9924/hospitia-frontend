import { Injectable, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, shareReplay, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Layout implements OnDestroy {
  private router: Router = inject(Router);
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private subscriptionsToBeDisposed: Subscription[] = [];
  showNavbar = signal(false);
  showFooter = signal(false);

  constructor() {
    const routerEvents$ = this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;

          while (route.firstChild) {
            route = route.firstChild;
          }

          return {
            showNavbar: route.snapshot.data['showNavbar'] ?? false,
            showFooter: route.snapshot.data['showFooter'] ?? false,
          };
        }),
        distinctUntilChanged((prev, curr) => {
          return prev.showNavbar === curr.showNavbar && prev.showFooter === curr.showFooter;
        }),
        shareReplay(1),
      )
      .subscribe((data) => {
        this.showNavbar.set(data.showNavbar);
        this.showFooter.set(data.showFooter);
      });
    this.subscriptionsToBeDisposed.push(routerEvents$);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions to prevent memory leaks
    if (this.subscriptionsToBeDisposed !== null || this.subscriptionsToBeDisposed !== undefined) {
      for (const subscription of this.subscriptionsToBeDisposed) {
        subscription.unsubscribe();
      }
    }
  }
}
