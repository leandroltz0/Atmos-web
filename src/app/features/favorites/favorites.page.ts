import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';

type SyncState = 'local' | 'synced' | 'pending';

type FavoriteCity = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  temp: number;
  feelsLike: number;
  min: number;
  max: number;
  condition: string;
  conditionLabel: string;
  icon: string;
  precipChance: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  updatedMinutesAgo: number;
  syncState: SyncState;
  accent: string;
};

type FavoriteMetric = {
  label: string;
  value: string;
  helper: string;
  tone: 'accent' | 'info' | 'sun' | 'success';
};

type ComparisonMetric = {
  label: string;
  value: string;
  helper: string;
  tone: 'accent' | 'info' | 'sun' | 'success';
};

type ComparisonResult = {
  city: FavoriteCity;
  differenceLabel: string;
  headline: string;
  summary: string[];
  metrics: ComparisonMetric[];
};

type ComparisonOverview = {
  reference: FavoriteCity;
  heroHeadline: string;
  heroBadge: string;
};

const INITIAL_FAVORITES: FavoriteCity[] = [
  {
    id: 'bue-ar',
    name: 'Buenos Aires',
    country: 'Argentina',
    countryCode: 'AR',
    region: 'Buenos Aires',
    temp: 27,
    feelsLike: 29,
    min: 18,
    max: 29,
    condition: 'partly-cloudy-day',
    conditionLabel: 'Mayormente soleado',
    icon: '/assets/icons/weather/partly-cloudy-day.svg',
    precipChance: 18,
    humidity: 64,
    windSpeed: 18,
    windDirection: 'SE',
    updatedMinutesAgo: 7,
    syncState: 'synced',
    accent: 'rgba(58, 134, 255, 0.18)'
  },
  {
    id: 'mdz-ar',
    name: 'Mendoza',
    country: 'Argentina',
    countryCode: 'AR',
    region: 'Mendoza',
    temp: 31,
    feelsLike: 33,
    min: 20,
    max: 33,
    condition: 'sun',
    conditionLabel: 'Cielo despejado',
    icon: '/assets/icons/weather/sun.svg',
    precipChance: 4,
    humidity: 28,
    windSpeed: 12,
    windDirection: 'N',
    updatedMinutesAgo: 22,
    syncState: 'local',
    accent: 'rgba(255, 209, 102, 0.16)'
  },
  {
    id: 'mad-es',
    name: 'Madrid',
    country: 'Spain',
    countryCode: 'ES',
    region: 'Comunidad de Madrid',
    temp: 24,
    feelsLike: 23,
    min: 16,
    max: 26,
    condition: 'cloudy',
    conditionLabel: 'Nuboso',
    icon: '/assets/icons/weather/cloudy.svg',
    precipChance: 22,
    humidity: 45,
    windSpeed: 15,
    windDirection: 'SW',
    updatedMinutesAgo: 12,
    syncState: 'pending',
    accent: 'rgba(72, 202, 228, 0.16)'
  },
  {
    id: 'scl-cl',
    name: 'Santiago',
    country: 'Chile',
    countryCode: 'CL',
    region: 'Metropolitana',
    temp: 18,
    feelsLike: 17,
    min: 11,
    max: 19,
    condition: 'rain',
    conditionLabel: 'Lluvia ligera',
    icon: '/assets/icons/weather/rain.svg',
    precipChance: 74,
    humidity: 78,
    windSpeed: 9,
    windDirection: 'W',
    updatedMinutesAgo: 4,
    syncState: 'synced',
    accent: 'rgba(58, 134, 255, 0.14)'
  },
  {
    id: 'lon-uk',
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    region: 'England',
    temp: 14,
    feelsLike: 12,
    min: 9,
    max: 15,
    condition: 'fog',
    conditionLabel: 'Niebla',
    icon: '/assets/icons/weather/fog.svg',
    precipChance: 16,
    humidity: 87,
    windSpeed: 21,
    windDirection: 'NW',
    updatedMinutesAgo: 38,
    syncState: 'local',
    accent: 'rgba(27, 58, 92, 0.9)'
  }
];

const FAVORITE_STORAGE_KEY = 'atmos.favorites.compare';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './favorites.page.html',
  styleUrl: './favorites.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FavoritesPage implements OnInit, OnDestroy {
  @ViewChild('comparePanel', { static: false })
  private readonly comparePanel?: ElementRef<HTMLElement>;

  protected readonly favoriteCities = signal<FavoriteCity[]>([...INITIAL_FAVORITES]);
  protected readonly selectedCityId = signal(INITIAL_FAVORITES[0]?.id ?? '');
  protected readonly compareSelection = signal<string[]>(INITIAL_FAVORITES.slice(0, 2).map((city) => city.id));
  protected readonly isOffline = signal(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  protected readonly selectedCity = computed(() => {
    const cities = this.favoriteCities();
    return cities.find((city) => city.id === this.selectedCityId()) ?? cities[0] ?? null;
  });

  protected readonly compareCities = computed(() => {
    const cities = this.favoriteCities();
    return this.compareSelection()
      .map((id) => cities.find((city) => city.id === id))
      .filter((city): city is FavoriteCity => city !== undefined);
  });

  protected readonly compareReference = computed(() => this.compareCities()[0] ?? null);

  protected readonly compareOverview = computed<ComparisonOverview | null>(() => {
    const cities = this.compareCities();

    if (cities.length < 2) {
      return null;
    }

    const warmest = cities.reduce((current, city) => (city.temp > current.temp ? city : current));
    const coldest = cities.reduce((current, city) => (city.temp < current.temp ? city : current));
    const tempDelta = warmest.temp - coldest.temp;

    return {
      reference: cities[0],
      heroHeadline: tempDelta === 0
        ? `${cities[0].name} y ${cities[1].name} tienen la misma temperatura`
        : `${warmest.name} está ${tempDelta}° más cálida que ${coldest.name}`,
      heroBadge: tempDelta === 0
        ? 'Igual'
        : `+${tempDelta}° vs ${coldest.name}`
    };
  });

  protected readonly comparisonResults = computed<ComparisonResult[]>(() => {
    const [reference, ...cities] = this.compareCities();

    if (!reference || cities.length === 0) {
      return [];
    }

    return cities.map((city) => buildComparisonResult(reference, city));
  });

  protected readonly metrics = computed<FavoriteMetric[]>(() => {
    const cities = this.favoriteCities();
    const compareCount = this.compareCities().length;

    return [
      {
        label: 'Guardadas',
        value: `${cities.length}`,
        helper: 'Ciudades en tu lista',
        tone: 'accent'
      },
      {
        label: 'Actualizadas',
        value: `${cities.filter((city) => city.updatedMinutesAgo <= 15).length}`,
        helper: 'Datos frescos',
        tone: 'info'
      },
      {
        label: 'Sincronizadas',
        value: `${cities.filter((city) => city.syncState === 'synced').length}`,
        helper: this.isOffline() ? 'Trabajo local' : 'Casi en tiempo real',
        tone: 'success'
      },
      {
        label: 'Comparando',
        value: `${compareCount}`,
        helper: 'Selección activa',
        tone: 'sun'
      }
    ];
  });

  private readonly handleOnline = () => this.isOffline.set(false);
  private readonly handleOffline = () => this.isOffline.set(true);

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.bindNetworkEvents();
    this.restoreCompareSelection();
    this.persistCompareSelection();
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  @HostListener('window:resize')
  protected onResize(): void {
    // Layout is CSS-driven; listener keeps the component aligned with the rest of the app shell.
  }

  protected trackByCity(_index: number, city: FavoriteCity): string {
    return city.id;
  }

  protected trackByMetric(_index: number, metric: FavoriteMetric): string {
    return metric.label;
  }

  protected trackByComparison(_index: number, comparison: ComparisonResult): string {
    return comparison.city.id;
  }

  protected onAddCity(): void {
    void this.router.navigate([`/${APP_ROUTE_PATHS.search}`]);
  }

  protected onRestoreDemo(): void {
    this.favoriteCities.set([...INITIAL_FAVORITES]);
    this.selectedCityId.set(INITIAL_FAVORITES[0]?.id ?? '');
    this.compareSelection.set(INITIAL_FAVORITES.slice(0, 2).map((city) => city.id));
    this.persistCompareSelection();
  }

  protected onOpenSelectedDetail(): void {
    void this.router.navigate([`/${APP_ROUTE_PATHS.detail}`]);
  }

  protected onSelectCity(city: FavoriteCity): void {
    this.selectedCityId.set(city.id);
  }

  protected onToggleCompare(city: FavoriteCity, event: MouseEvent): void {
    event.stopPropagation();

    const current = [...this.compareSelection()];
    const index = current.indexOf(city.id);

    if (index >= 0) {
      current.splice(index, 1);
      this.compareSelection.set(current);
      this.persistCompareSelection();
      return;
    }

    if (current.length >= 3) {
      current.shift();
    }

    current.push(city.id);
    this.compareSelection.set(current);
    this.persistCompareSelection();
  }

  protected onMoveCity(city: FavoriteCity, direction: -1 | 1, event: MouseEvent): void {
    event.stopPropagation();

    const items = [...this.favoriteCities()];
    const index = items.findIndex((item) => item.id === city.id);

    if (index === -1) {
      return;
    }

    const nextIndex = clamp(index + direction, 0, items.length - 1);

    if (nextIndex === index) {
      return;
    }

    const [movedItem] = items.splice(index, 1);
    items.splice(nextIndex, 0, movedItem);
    this.favoriteCities.set(items);
  }

  protected onRemoveCity(city: FavoriteCity, event: MouseEvent): void {
    event.stopPropagation();

    const nextCities = this.favoriteCities().filter((item) => item.id !== city.id);
    this.favoriteCities.set(nextCities);

    const nextCompare = this.compareSelection().filter((id) => id !== city.id);
    this.compareSelection.set(nextCompare);
    this.persistCompareSelection();

    if (this.selectedCityId() === city.id) {
      this.selectedCityId.set(nextCities[0]?.id ?? '');
    }
  }

  protected isSelected(city: FavoriteCity): boolean {
    return this.selectedCityId() === city.id;
  }

  protected isCompared(city: FavoriteCity): boolean {
    return this.compareSelection().includes(city.id);
  }

  protected scrollToComparePanel(): void {
    const panel = this.comparePanel?.nativeElement;

    if (!panel) {
      return;
    }

    panel.scrollIntoView({
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start'
    });
  }

  protected getSyncLabel(state: SyncState): string {
    switch (state) {
      case 'synced':
        return 'Sincronizada';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Local';
    }
  }

  protected getDifferenceLabel(city: FavoriteCity): string {
    const reference = this.compareReference();

    if (!reference) {
      return 'Seleccioná otra ciudad para comparar';
    }

    if (reference.id === city.id) {
      return 'Ciudad base';
    }

    const delta = city.temp - reference.temp;

    if (delta === 0) {
      return 'Misma temperatura';
    }

    return `${delta > 0 ? '+' : ''}${delta}° vs ${reference.name}`;
  }

  private bindNetworkEvents(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private persistCompareSelection(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(this.compareSelection()));
  }

  private restoreCompareSelection(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(FAVORITE_STORAGE_KEY);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as string[];
      const availableIds = new Set(this.favoriteCities().map((city) => city.id));
      const nextSelection = parsed.filter((id) => availableIds.has(id)).slice(0, 3);

      if (nextSelection.length > 0) {
        this.compareSelection.set(nextSelection);
      }
    } catch {
      // Ignore malformed local storage payloads and fall back to mock defaults.
    }
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildComparisonResult(reference: FavoriteCity, city: FavoriteCity): ComparisonResult {
  const tempDelta = city.temp - reference.temp;
  const feelsDelta = city.feelsLike - reference.feelsLike;
  const rainDelta = city.precipChance - reference.precipChance;
  const windDelta = city.windSpeed - reference.windSpeed;
  const humidityDelta = city.humidity - reference.humidity;

  return {
    city,
    differenceLabel: formatTemperatureDelta(tempDelta, reference.name),
    headline:
      tempDelta === 0
        ? `${city.name} tiene la misma temperatura que ${reference.name}`
        : `${city.name} está ${Math.abs(tempDelta)}° ${tempDelta > 0 ? 'más cálida' : 'más fría'} que ${reference.name}`,
    summary: [
      buildRainSummary(reference, city, rainDelta),
      buildWindSummary(reference, city, windDelta),
      buildComfortSummary(reference, city, feelsDelta, humidityDelta)
    ],
    metrics: [
      {
        label: 'Ahora',
        value: `${city.temp}°`,
        helper:
          tempDelta === 0
            ? `Misma lectura que ${reference.name}`
            : `${Math.abs(tempDelta)}° ${tempDelta > 0 ? 'por encima' : 'por debajo'} de ${reference.name}`,
        tone: tempDelta > 0 ? 'sun' : tempDelta < 0 ? 'info' : 'accent'
      },
      {
        label: 'Lluvia',
        value: `${city.precipChance}%`,
        helper:
          rainDelta === 0
            ? `Mismo riesgo que ${reference.name}`
            : `${Math.abs(rainDelta)} pts ${rainDelta > 0 ? 'más' : 'menos'} que ${reference.name}`,
        tone: hasRainRisk(city) ? 'info' : 'success'
      },
      {
        label: 'Viento',
        value: `${city.windSpeed} km/h`,
        helper:
          windDelta === 0
            ? `Misma intensidad que ${reference.name}`
            : `${Math.abs(windDelta)} km/h ${windDelta > 0 ? 'más fuerte' : 'más calmo'}`,
        tone: windDelta > 0 ? 'info' : 'accent'
      },
      {
        label: 'Sensación',
        value: `${city.feelsLike}°`,
        helper:
          feelsDelta === 0
            ? `Se siente igual que ${reference.name}`
            : `${Math.abs(feelsDelta)}° ${feelsDelta > 0 ? 'más alta' : 'más baja'} que ${reference.name}`,
        tone: feelsDelta > 0 ? 'sun' : 'accent'
      }
    ]
  };
}

function formatTemperatureDelta(delta: number, referenceName: string): string {
  if (delta === 0) {
    return `Igual que ${referenceName}`;
  }

  return `${delta > 0 ? '+' : ''}${delta}° vs ${referenceName}`;
}

function buildRainSummary(reference: FavoriteCity, city: FavoriteCity, rainDelta: number): string {
  const referenceHasRain = hasRainRisk(reference);
  const cityHasRain = hasRainRisk(city);

  if (cityHasRain && !referenceHasRain) {
    return `${city.name} sí tiene lluvia probable, ${city.precipChance}%, y ${reference.name} no.`;
  }

  if (!cityHasRain && referenceHasRain) {
    return `${reference.name} mantiene lluvia probable, ${reference.precipChance}%, mientras ${city.name} no.`;
  }

  if (cityHasRain && referenceHasRain) {
    if (rainDelta === 0) {
      return `Las dos muestran lluvia probable con el mismo nivel de riesgo.`;
    }

    return `${city.name} tiene ${Math.abs(rainDelta)} puntos ${rainDelta > 0 ? 'más' : 'menos'} de probabilidad de lluvia que ${reference.name}.`;
  }

  return 'Ninguna de las dos muestra lluvia probable por ahora.';
}

function buildWindSummary(reference: FavoriteCity, city: FavoriteCity, windDelta: number): string {
  if (windDelta === 0) {
    return `El viento se mantiene parejo entre ${reference.name} y ${city.name}.`;
  }

  return `En ${city.name} el viento sopla ${Math.abs(windDelta)} km/h ${windDelta > 0 ? 'más fuerte' : 'más calmo'} que en ${reference.name}.`;
}

function buildComfortSummary(
  reference: FavoriteCity,
  city: FavoriteCity,
  feelsDelta: number,
  humidityDelta: number
): string {
  if (Math.abs(feelsDelta) <= 1 && Math.abs(humidityDelta) <= 6) {
    return `La sensación general se mantiene muy parecida entre ambas ciudades.`;
  }

  if (feelsDelta > 0) {
    return `${city.name} se siente más cálida, con ${Math.abs(feelsDelta)}° extra de sensación y ${describeHumidityShift(humidityDelta)}.`;
  }

  if (feelsDelta < 0) {
    return `${city.name} se siente más fría, con ${Math.abs(feelsDelta)}° menos de sensación y ${describeHumidityShift(humidityDelta)}.`;
  }

  return `${city.name} conserva una sensación térmica similar a ${reference.name}, pero ${describeHumidityShift(humidityDelta)}.`;
}

function describeHumidityShift(delta: number): string {
  if (Math.abs(delta) <= 6) {
    return 'humedad similar';
  }

  return delta > 0 ? `${delta}% más de humedad` : `${Math.abs(delta)}% menos de humedad`;
}

function hasRainRisk(city: FavoriteCity): boolean {
  return city.precipChance >= 35 || city.condition.includes('rain');
}
