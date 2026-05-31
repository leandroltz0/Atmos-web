import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
  effect,
  afterNextRender,
  ElementRef
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { gsap } from 'gsap';

import { MatInputModule } from '@angular/material/input';

import { Router } from '@angular/router';

import { EMPTY, Observable, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, take } from 'rxjs/operators';

import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';
import { AuthService } from '../../core/services/auth.service';
import { CitiesService, CityItem, CitySearchState } from '../../core/services/cities.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { SearchHistoryService } from '../../core/services/search-history.service';
import { FavoriteCity, SearchHistoryEntry } from '../../core/models/favorite.model';

import { SearchBackgroundComponent } from '../../components/search/background/background.component';
import { SearchHeaderComponent } from '../../components/search/header/header.component';
import { SearchFieldComponent } from '../../components/search/search-field/search-field.component';
import { SearchFavoritesSectionComponent } from '../../components/search/favorites-section/favorites-section.component';
import { SearchRecentSectionComponent } from '../../components/search/recent-section/recent-section.component';
import { SearchResultsComponent } from '../../components/search/search-results/search-results.component';
import { SearchStatusStatesComponent } from '../../components/search/status-states/status-states.component';

type SearchStatus = 'initial' | 'writing' | 'loading' | 'results' | 'no-results' | 'error' | 'offline';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    SearchBackgroundComponent,
    SearchHeaderComponent,
    SearchFieldComponent,
    SearchFavoritesSectionComponent,
    SearchRecentSectionComponent,
    SearchResultsComponent,
    SearchStatusStatesComponent
  ],
  templateUrl: './search.page.html',
  styleUrl: './search.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPage implements OnInit, OnDestroy {
  protected readonly queryControl = new FormControl('', { nonNullable: true });
  protected readonly status = signal<SearchStatus>('initial');
  protected readonly results = signal<CityItem[]>([]);
  protected readonly recent = signal<SearchHistoryEntry[]>([]);
  protected readonly favoriteMap = signal<Record<string, string>>({});
  protected readonly favorites = signal<FavoriteCity[]>([]);
  protected readonly favoritesLoading = signal(true);
  protected readonly favoritesError = signal<string | null>(null);
  protected readonly isOffline = signal(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  protected readonly hasQuery = computed(() => this.queryControl.value.trim().length > 0);
  protected readonly query = computed(() => this.queryControl.value.trim());

  private searchSubscription?: Subscription;
  private retrySubscription?: Subscription;
  private readonly citiesService = inject(CitiesService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly searchHistoryService = inject(SearchHistoryService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);

  private readonly handleOnline = () => {
    this.isOffline.set(false);
    if (this.query().length >= 2) {
      this.status.set('writing');
    } else {
      this.status.set('initial');
    }
  };

  private readonly handleOffline = () => {
    this.isOffline.set(true);
    this.status.set('offline');
  };

  constructor() {
    afterNextRender(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo(this.el.nativeElement.querySelector('.search-header'),
        { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 })
        .fromTo(this.el.nativeElement.querySelector('.search-input-wrap'),
        { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 }, '-=1.05')
        .fromTo(this.el.nativeElement.querySelectorAll('.recent-section, .fav-section'),
        { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, '-=1.0')
        .fromTo(this.el.nativeElement.querySelectorAll('.recent-chip, .fav-card, .fav-skeleton-item, .fav-error'),
        { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.04 }, '-=0.8');
    });

    effect(() => {
      const currentStatus = this.status();
      const currentResults = this.results();

      setTimeout(() => {
        if (!this.el?.nativeElement) return;

        if (currentStatus === 'results') {
          gsap.fromTo(this.el.nativeElement.querySelectorAll('.result-item'),
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.05, clearProps: 'all' }
          );
        } else if (currentStatus === 'loading') {
          gsap.fromTo(this.el.nativeElement.querySelectorAll('.skeleton-item'),
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05, clearProps: 'all' }
          );
        } else if (currentStatus === 'initial') {
           gsap.fromTo(this.el.nativeElement.querySelectorAll('.fav-card, .fav-skeleton-item, .fav-error, .recent-chip, .empty-state'),
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.04, clearProps: 'all' }
          );
        } else if (currentStatus === 'no-results' || currentStatus === 'error' || currentStatus === 'offline') {
           gsap.fromTo(this.el.nativeElement.querySelector('.empty-state'),
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', clearProps: 'all' }
          );
        }
      }, 20);
    });
  }

  ngOnInit(): void {
    this.loadFavorites();
    this.loadHistory();

    this.bindNetworkEvents();

    this.searchSubscription = this.queryControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(rawValue => this.handleQuery(rawValue))
      )
      .subscribe((state: CitySearchState) => {
        this.results.set(state.cities);

        if (state.loading) {
          this.status.set('loading');
        } else if (state.error) {
          this.status.set('error');
        } else {
          this.status.set(state.cities.length > 0 ? 'results' : 'no-results');
        }
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.retrySubscription?.unsubscribe();

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  protected clearQuery(): void {
    this.queryControl.setValue('');
    this.results.set([]);
    this.status.set(this.isOffline() ? 'offline' : 'initial');
  }

  protected selectRecent(item: SearchHistoryEntry): void {
    this.queryControl.setValue(item.label);
  }

  protected clearRecent(): void {
    const previous = this.recent();
    this.recent.set([]);

    this.searchHistoryService.clear().pipe(
      catchError(() => {
        this.recent.set(previous);
        return EMPTY;
      })
    ).subscribe();
  }

  private loadFavorites(): void {
    this.favoritesLoading.set(true);
    this.favoritesError.set(null);

    this.favoritesService.getAll().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.favoritesLoading.set(false);

        const map: Record<string, string> = {};

        for (const fav of favorites) {
          const key = `${fav.name}|${fav.country}|${fav.lat}|${fav.lon}`;
          map[key] = fav.cityId;
        }

        this.favoriteMap.set(map);
      },
      error: (err) => {
        this.favoritesLoading.set(false);

        if (err.status === 401) {
          this.auth.logout();
          return;
        }

        this.favoritesError.set('No pudimos cargar tus ciudades favoritas.');
      }
    });
  }

  protected retryLoadFavorites(): void {
    this.loadFavorites();
  }

  protected selectFavoriteCity(fav: FavoriteCity): void {
    void this.router.navigate([`/${APP_ROUTE_PATHS.dashboard}`], {
      queryParams: {
        city: fav.name,
        country: fav.countryCode,
        lat: fav.lat,
        lon: fav.lon
      }
    });
  }

  protected removeFavorite(fav: FavoriteCity, event: Event): void {
    event.stopPropagation();

    const previous = this.favorites();
    const previousMap = this.favoriteMap();

    const nextFavorites = previous.filter((item) => item.cityId !== fav.cityId);
    this.favorites.set(nextFavorites);

    const key = `${fav.name}|${fav.country}|${fav.lat}|${fav.lon}`;
    const nextMap = { ...previousMap };
    delete nextMap[key];
    this.favoriteMap.set(nextMap);

    this.favoritesService
      .remove(fav.cityId)
      .pipe(
        catchError((err) => {
          if (err.status === 401) {
            this.auth.logout();
            return EMPTY;
          }

          this.favorites.set(previous);
          this.favoriteMap.set(previousMap);
          return EMPTY;
        })
      )
      .subscribe();
  }

  protected selectCity(city: CityItem): void {
    this.addRecent(city);
    this.router.navigate([`/${APP_ROUTE_PATHS.dashboard}`], {
      queryParams: {
        city: city.name,
        country: city.countryCode,
        lat: city.lat,
        lon: city.lon
      }
    });
  }

  protected toggleFavorite(city: CityItem, event: Event): void {
    event.stopPropagation();

    const key = this.favoriteKey(city);
    const map = this.favoriteMap();

    if (key in map) {
      const cityId = map[key];

      this.favoritesService
        .remove(cityId)
        .pipe(
          catchError((err) => {
            if (err.status === 401) {
              this.auth.logout();
            }

            return EMPTY;
          })
        )
        .subscribe(() => {
          const next = { ...this.favoriteMap() };
          delete next[key];
          this.favoriteMap.set(next);
        });

      return;
    }

    this.favoritesService
      .create({
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon
      })
      .pipe(
        catchError((err) => {
          if (err.status === 401) {
            this.auth.logout();
            return EMPTY;
          }

          if (err.status === 409) {
            this.loadFavorites();
          }

          return EMPTY;
        })
      )
      .subscribe((favorite) => {
        this.favoriteMap.set({ ...this.favoriteMap(), [key]: favorite.cityId });
      });
  }

  private favoriteKey(city: CityItem): string {
    return `${city.name}|${city.country}|${city.lat}|${city.lon}`;
  }

  protected retrySearch(): void {
    this.retrySubscription?.unsubscribe();
    this.retrySubscription = this.handleQuery(this.queryControl.value)
      .pipe(take(1))
      .subscribe((state: CitySearchState) => {
        this.results.set(state.cities);

        if (state.loading) {
          this.status.set('loading');
        } else if (state.error) {
          this.status.set('error');
        } else {
          this.status.set(state.cities.length > 0 ? 'results' : 'no-results');
        }
      });
  }

  private handleQuery(rawValue: string): Observable<CitySearchState> {
    const value = rawValue.trim();

    if (this.isOffline()) {
      this.status.set('offline');
      this.results.set([]);
      return EMPTY;
    }

    if (!value) {
      this.status.set('initial');
      this.results.set([]);
      return EMPTY;
    }

    if (value.length < 2) {
      this.status.set('writing');
      this.results.set([]);
      return EMPTY;
    }

    if (value.toLowerCase() === 'error') {
      this.status.set('error');
      this.results.set([]);
      return EMPTY;
    }

    return this.citiesService.search(value);
  }

  private addRecent(city: CityItem): void {
    this.searchHistoryService
      .create({
        name: city.name,
        country: city.country,
        lat: city.lat,
        lon: city.lon
      })
      .pipe(
        catchError((err) => {
          if (err.status === 401) {
            this.auth.logout();
          }

          return EMPTY;
        })
      )
      .subscribe((entry) => {
        const deduped = this.recent().filter((item) => item.cityId !== entry.cityId);
        const next = [entry, ...deduped].slice(0, 10);
        this.recent.set(next);
      });
  }

  private loadHistory(): void {
    this.searchHistoryService.getAll().subscribe({
      next: (history) => {
        this.recent.set(history);
      },
      error: (err) => {
        if (err.status === 401) {
          this.auth.logout();
        }
      }
    });
  }

  private bindNetworkEvents(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.isOffline.set(!navigator.onLine);

    if (this.isOffline()) {
      this.status.set('offline');
    }

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }
}
