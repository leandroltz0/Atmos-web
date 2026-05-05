import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  signal
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatInputModule } from '@angular/material/input';

import { Router } from '@angular/router';

import { debounceTime, distinctUntilChanged } from 'rxjs';

import { APP_ROUTE_PATHS } from '../../shared/constants/app-routes';

type SearchStatus = 'initial' | 'writing' | 'loading' | 'results' | 'no-results' | 'error' | 'offline';

interface CityItem {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region?: string;
  lat: number;
  lon: number;
}

interface RecentSearch {
  id: string;
  label: string;
}

const RECENT_STORAGE_KEY = 'atmos.search.recent';
const FAVORITE_STORAGE_KEY = 'atmos.search.favorites';
const RECENT_LIMIT = 10;

const MOCK_CITIES: CityItem[] = [
  { id: 'bue-ar', name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', region: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { id: 'cor-ar', name: 'Cordoba', country: 'Argentina', countryCode: 'AR', region: 'Cordoba', lat: -31.4201, lon: -64.1888 },
  { id: 'mdz-ar', name: 'Mendoza', country: 'Argentina', countryCode: 'AR', region: 'Mendoza', lat: -32.8895, lon: -68.8458 },
  { id: 'ros-ar', name: 'Rosario', country: 'Argentina', countryCode: 'AR', region: 'Santa Fe', lat: -32.9442, lon: -60.6505 },
  { id: 'mad-es', name: 'Madrid', country: 'Spain', countryCode: 'ES', region: 'Comunidad de Madrid', lat: 40.4168, lon: -3.7038 },
  { id: 'bar-es', name: 'Barcelona', country: 'Spain', countryCode: 'ES', region: 'Catalonia', lat: 41.3874, lon: 2.1686 },
  { id: 'sev-es', name: 'Seville', country: 'Spain', countryCode: 'ES', region: 'Andalusia', lat: 37.3891, lon: -5.9845 },
  { id: 'scl-cl', name: 'Santiago', country: 'Chile', countryCode: 'CL', region: 'Metropolitan', lat: -33.4489, lon: -70.6693 },
  { id: 'lim-pe', name: 'Lima', country: 'Peru', countryCode: 'PE', region: 'Lima', lat: -12.0464, lon: -77.0428 },
  { id: 'bog-co', name: 'Bogota', country: 'Colombia', countryCode: 'CO', region: 'Bogota D.C.', lat: 4.711, lon: -74.0721 },
  { id: 'mex-mx', name: 'Mexico City', country: 'Mexico', countryCode: 'MX', region: 'CDMX', lat: 19.4326, lon: -99.1332 },
  { id: 'mon-uy', name: 'Montevideo', country: 'Uruguay', countryCode: 'UY', region: 'Montevideo', lat: -34.9011, lon: -56.1645 },
  { id: 'nyc-us', name: 'New York', country: 'United States', countryCode: 'US', region: 'New York', lat: 40.7128, lon: -74.006 },
  { id: 'lon-uk', name: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'England', lat: 51.5072, lon: -0.1276 },
  { id: 'par-fr', name: 'Paris', country: 'France', countryCode: 'FR', region: 'Ile-de-France', lat: 48.8566, lon: 2.3522 },
  { id: 'ber-de', name: 'Berlin', country: 'Germany', countryCode: 'DE', region: 'Berlin', lat: 52.52, lon: 13.405 },
  { id: 'rom-it', name: 'Rome', country: 'Italy', countryCode: 'IT', region: 'Lazio', lat: 41.9028, lon: 12.4964 },
  { id: 'tok-jp', name: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'Tokyo', lat: 35.6762, lon: 139.6503 }
];

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRippleModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit, OnDestroy {
  protected readonly queryControl = new FormControl('', { nonNullable: true });
  protected readonly status = signal<SearchStatus>('initial');
  protected readonly results = signal<CityItem[]>([]);
  protected readonly recent = signal<RecentSearch[]>([]);
  protected readonly favorites = signal<string[]>([]);
  protected readonly isOffline = signal(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  protected readonly hasQuery = computed(() => this.queryControl.value.trim().length > 0);
  protected readonly query = computed(() => this.queryControl.value.trim());

  protected readonly title = 'Buscar ciudad';
  protected readonly subtitle = 'Encontra el clima de cualquier lugar en segundos.';

  private searchTimer?: number;
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

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.recent.set(this.readRecent());
    this.favorites.set(this.readFavorites());

    this.bindNetworkEvents();

    this.queryControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => this.search(value));
  }

  ngOnDestroy(): void {
    if (this.searchTimer !== undefined) {
      window.clearTimeout(this.searchTimer);
    }

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

  protected selectRecent(item: RecentSearch): void {
    this.queryControl.setValue(item.label);
  }

  protected clearRecent(): void {
    this.recent.set([]);
    localStorage.removeItem(RECENT_STORAGE_KEY);
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

    const current = this.favorites();
    const exists = current.includes(city.id);
    const next = exists ? current.filter((id) => id !== city.id) : [...current, city.id];
    this.favorites.set(next);
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(next));
  }

  protected isFavorite(city: CityItem): boolean {
    return this.favorites().includes(city.id);
  }

  protected cityLabel(city: CityItem): string {
    return city.region ? `${city.name}, ${city.region}, ${city.country}` : `${city.name}, ${city.country}`;
  }

  protected retrySearch(): void {
    this.search(this.queryControl.value);
  }

  private search(rawValue: string): void {
    const value = rawValue.trim();

    if (this.isOffline()) {
      this.status.set('offline');
      this.results.set([]);
      return;
    }

    if (!value) {
      this.status.set('initial');
      this.results.set([]);
      return;
    }

    this.status.set('writing');

    if (value.length < 2) {
      this.results.set([]);
      return;
    }

    this.status.set('loading');

    if (this.searchTimer !== undefined) {
      window.clearTimeout(this.searchTimer);
    }

    this.searchTimer = window.setTimeout(() => {
      if (value.toLowerCase() === 'error') {
        this.status.set('error');
        this.results.set([]);
        return;
      }

      const normalized = value.toLowerCase();
      const nextResults = MOCK_CITIES.filter((city) => {
        const haystack = `${city.name} ${city.country} ${city.countryCode} ${city.region ?? ''}`.toLowerCase();
        return haystack.includes(normalized);
      }).slice(0, 8);

      this.results.set(nextResults);
      this.status.set(nextResults.length > 0 ? 'results' : 'no-results');
    }, 450);
  }

  private addRecent(city: CityItem): void {
    const nextItem: RecentSearch = {
      id: city.id,
      label: this.cityLabel(city)
    };

    const deduped = this.recent().filter((item) => item.id !== city.id);
    const next = [nextItem, ...deduped].slice(0, RECENT_LIMIT);
    this.recent.set(next);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  }

  private readRecent(): RecentSearch[] {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as RecentSearch[];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.slice(0, RECENT_LIMIT);
    } catch {
      return [];
    }
  }

  private readFavorites(): string[] {
    const raw = localStorage.getItem(FAVORITE_STORAGE_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
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
