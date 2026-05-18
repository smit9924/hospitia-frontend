import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LoaderContainer } from './components/loaders/loader-container/loader-container';
import { Icon } from './services/icon';
import { Navbar } from './components/common/navbar/navbar';
import { Footer } from './components/common/footer/footer';
import { Theme } from './services/theme';
import { distinctUntilChanged, filter, map, shareReplay, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderContainer, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  // Initialize icon service to register icons globally on application start
  private readonly _iconService: Icon = inject(Icon);
  private readonly _themeService: Theme = inject(Theme);
  private router: Router = inject(Router);
  private subscriptionsToBeDisposed: Subscription[] = [];
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  protected showNavbar = signal(false);
  protected showFooter = signal(false);

  protected readonly title = signal('main');

  ngOnInit(): void {
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
