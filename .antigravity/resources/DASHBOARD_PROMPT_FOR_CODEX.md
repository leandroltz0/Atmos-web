# WeatherApp — Dashboard Implementation Prompt

**Para:** Codex (OpenAI)
**Propósito:** Implementar la pantalla 02 — Dashboard Principal de WeatherApp
**Stack:** Angular 19 + Angular Material + GSAP + Tailwind CSS v3

---

## Contexto del proyecto

Estás implementando el **Dashboard Principal (Pantalla 02)** de WeatherApp, una PWA de clima premium con estética "Cielo Nocturno". La app está construida con Angular 19 usando Signals, Standalone Components, y control flow nativo. El dashboard usa **datos mock** (sin llamadas reales a APIs). El navbar/bottom nav NO está en el scope de este ticket — se implementa por separado.

---

## Inspiración visual de referencia

El resultado final debe tener el nivel de calidad visual de estos dashboards:

- **Apple Weather app** — jerarquía de datos clara, temperatura hero enorme, scroll suave
- **Windy.com** — densidad de información sin sentirse recargado, datos meteorológicos ricos
- **Carrot Weather** — personalidad visual fuerte, cards con glassmorphism, tipografía expresiva
- **Dark Sky (legado)** — radiales y visualizaciones horárias minimalistas y elegantes
- **Linear.app** — no es clima, pero su dark mode con glassmorphism sutil y espaciado generoso es la referencia de calidad UI a apuntar

La estética es: **fondos navy profundos + glassmorphism sutil en cards + acento eléctrico azul + tipografía expresiva para la temperatura**.

---

## Stack y versiones

```
Angular:          19 (latest)
Angular Material: latest
GSAP:             latest (gsap, @gsap/react no aplica — usar gsap puro)
Tailwind CSS:     v3
TypeScript:       5.x
Fuentes:          DM Serif Display · Plus Jakarta Sans · JetBrains Mono
                  (cargar desde Google Fonts en styles.scss)
```

---

## Sistema de diseño — "Cielo Nocturno"

### Paleta de colores (CSS custom properties en styles.scss)

```scss
:root {
  --color-bg-primary: #0d1b2a; // Fondo principal
  --color-bg-card: #1b3a5c; // Fondo de cards y modales
  --color-accent: #3a86ff; // Botones, links, highlights
  --color-info: #48cae4; // Datos informativos, AQI
  --color-sun: #ffd166; // Temperatura alta, UV, sol
  --color-text-primary: #ffffff; // Texto principal
  --color-text-secondary: #8baec8; // Labels, subtítulos
  --color-danger: #ef4444; // Alertas críticas
  --color-success: #10b981; // Estado OK
}
```

### Tipografía

```scss
// Importar en styles.scss desde Google Fonts:
// DM Serif Display (400) — temperaturas hero, títulos grandes
// Plus Jakarta Sans (400, 500, 600) — UI general, labels, body
// JetBrains Mono (400) — datos numéricos: velocidad, presión, AQI

.font-display {
  font-family: "DM Serif Display", serif;
}
.font-body {
  font-family: "Plus Jakarta Sans", sans-serif;
}
.font-mono {
  font-family: "JetBrains Mono", monospace;
}
```

### Glassmorphism — receta CSS

```scss
.glass-card {
  background: rgba(27, 58, 92, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}
```

> ⚠️ El glassmorphism **solo funciona visualmente** si hay un fondo con profundidad detrás. El fondo del dashboard debe tener orbes/blobs de color borrosos (`filter: blur(80–120px)`) que le dan vida al efecto glass.

---

## Archivo: `dashboard.component.ts`

Crear como **Standalone Component** en `src/app/features/dashboard/`.

### Estructura de archivos a crear

```
src/app/features/dashboard/
├── dashboard.component.ts
├── dashboard.component.html
├── dashboard.component.scss
└── mock-weather.data.ts          ← datos mock centralizados aquí
```

---

## Datos Mock

Crear `mock-weather.data.ts` con esta estructura completa. Codex debe generar datos realistas para Buenos Aires, Argentina:

```typescript
// mock-weather.data.ts

export interface CurrentWeather {
  cityName: string;
  country: string;
  temp: number;           // °C
  feelsLike: number;
  condition: string;      // 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy'
  conditionLabel: string; // 'Despejado', 'Nublado', etc.
  humidity: number;       // %
  windSpeed: number;      // km/h
  windDirection: string;  // 'NE', 'SO', etc.
  pressure: number;       // hPa
  aqi: number;            // 1-5
  aqiLabel: string;       // 'Buena' | 'Moderada' | 'Dañina' | ...
  sunrise: string;        // '06:42'
  sunset: string;         // '19:18'
  visibility: number;     // km
  uvIndex: number;
  lastUpdated: Date;
}

export interface HourlyForecast {
  hour: string;           // '14:00'
  temp: number;
  condition: string;
  precipChance: number;   // %
}

export interface DailyForecast {
  day: string;            // 'Lun', 'Mar', ...
  date: string;           // '12 Abr'
  tempMax: number;
  tempMin: number;
  condition: string;
  precipChance: number;
}

export const MOCK_CURRENT: CurrentWeather = { /* datos para Buenos Aires */ };
export const MOCK_HOURLY: HourlyForecast[] = /* próximas 24hs, array de 24 items */;
export const MOCK_DAILY: DailyForecast[]  = /* 7 días, empezando por hoy */;
```

---

## Implementación del componente

### `dashboard.component.ts`

```typescript
@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    // ... otros Angular Material necesarios
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Signals de estado
  readonly currentWeather = signal<CurrentWeather>(MOCK_CURRENT);
  readonly hourlyForecast = signal<HourlyForecast[]>(MOCK_HOURLY);
  readonly dailyForecast = signal<DailyForecast[]>(MOCK_DAILY);
  readonly isLoading = signal(true);
  readonly isOffline = signal(false);

  // Computed
  readonly aqiColor = computed(() => {
    const aqi = this.currentWeather().aqi;
    const colors = ["", "#10B981", "#FFD166", "#F97316", "#EF4444", "#7C3AED"];
    return colors[aqi] ?? "#10B981";
  });

  // Refs para GSAP
  private heroTempEl = viewChild<ElementRef>("heroTemp");
  private cardsEl = viewChildren<ElementRef>("weatherCard");
  private hourlyEl = viewChild<ElementRef>("hourlyScroll");
  private ctx!: gsap.Context; // GSAP context para cleanup

  ngOnInit(): void {
    // Simular carga de 800ms para mostrar skeleton → contenido
    setTimeout(() => {
      this.isLoading.set(false);
      this.initAnimations();
    }, 800);
  }

  private initAnimations(): void {
    this.ctx = gsap.context(() => {
      // 1. Counter animation en temperatura hero
      gsap.from(this.heroTempEl()?.nativeElement, {
        textContent: 0,
        duration: 1.2,
        ease: "power2.out",
        snap: { textContent: 1 },
        onUpdate() {
          this.targets()[0].textContent = Math.round(this.targets()[0].textContent) + "°";
        },
      });

      // 2. Stagger de cards — entrada con fade + Y translation
      gsap.from(
        this.cardsEl().map((r) => r.nativeElement),
        {
          opacity: 0,
          y: 32,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.1,
        },
      );

      // 3. Fade in del scroll horizontal de pronóstico horario
      gsap.from(this.hourlyEl()?.nativeElement, {
        opacity: 0,
        x: -20,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.4,
      });
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert(); // cleanup GSAP
  }

  // Respetar prefers-reduced-motion
  private prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  onRefresh(): void {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      if (!this.prefersReducedMotion()) this.initAnimations();
    }, 600);
  }
}
```

> **Importante:** Si `prefers-reduced-motion: reduce` está activo, saltar todas las animaciones GSAP.

---

## Layout del Dashboard — Estructura HTML

El template debe implementar **exactamente estas secciones**, en este orden:

### 1. Fondo animado (fuera del scroll, posición fixed/absolute)

```html
<!-- Orbes de profundidad para el efecto glassmorphism -->
<div class="bg-orbs" aria-hidden="true">
  <div class="orb orb--blue"></div>
  <div class="orb orb--teal"></div>
  <div class="orb orb--accent"></div>
</div>
```

CSS de los orbes:

```scss
.bg-orbs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.35;
  &--blue {
    width: 600px;
    height: 600px;
    background: #1b3a5c;
    top: -100px;
    right: -150px;
  }
  &--teal {
    width: 400px;
    height: 400px;
    background: #0e4d6e;
    bottom: 20%;
    left: -80px;
  }
  &--accent {
    width: 300px;
    height: 300px;
    background: #1a3d7c;
    top: 40%;
    right: 10%;
    opacity: 0.2;
  }
}
```

---

### 2. Header del dashboard

```html
<header class="dashboard-header">
  <!-- Izquierda: ciudad + fecha -->
  <div>
    <h1 class="city-name">{{ currentWeather().cityName }}, {{ currentWeather().country }}</h1>
    <p class="current-date"><!-- fecha actual con DatePipe --></p>
  </div>
  <!-- Derecha: botón refresh + último update -->
  <div class="header-actions">
    <span class="last-updated font-mono">Actualizado hace X min</span>
    <button mat-icon-button (click)="onRefresh()" matTooltip="Actualizar" aria-label="Actualizar clima">
      <mat-icon>refresh</mat-icon>
    </button>
  </div>
</header>
```

---

### 3. Banner Offline (condicional)

```html
@if (isOffline()) {
<div class="offline-banner" role="alert">
  <mat-icon>wifi_off</mat-icon>
  Sin conexión — mostrando datos cacheados de hace {{ minutesAgo() }} min
</div>
}
```

---

### 4. Hero Card — Temperatura principal

Esta es la card más importante. Debe ser visualmente impactante:

```html
<div class="hero-card glass-card" #weatherCard>
  <div class="hero-left">
    <!-- Icono animado de condición climática (SVG inline o mat-icon grande) -->
    <div class="condition-icon condition-icon--{{ currentWeather().condition }}" aria-hidden="true"></div>
    <p class="condition-label">{{ currentWeather().conditionLabel }}</p>
  </div>

  <div class="hero-center">
    <!-- Temperatura hero — DM Serif Display, enorme -->
    <div class="hero-temp-wrapper">
      <span #heroTemp class="hero-temp font-display">{{ currentWeather().temp }}°</span>
    </div>
    <p class="feels-like font-body">Sensación: <span class="font-mono">{{ currentWeather().feelsLike }}°C</span></p>
  </div>

  <div class="hero-right">
    <!-- Datos rápidos en columna -->
    <div class="quick-stat">
      <mat-icon class="stat-icon">water_drop</mat-icon>
      <span class="stat-value font-mono">{{ currentWeather().humidity }}%</span>
      <span class="stat-label">Humedad</span>
    </div>
    <div class="quick-stat">
      <mat-icon class="stat-icon">air</mat-icon>
      <span class="stat-value font-mono">{{ currentWeather().windSpeed }} km/h</span>
      <span class="stat-label">{{ currentWeather().windDirection }}</span>
    </div>
    <div class="quick-stat">
      <mat-icon class="stat-icon">compress</mat-icon>
      <span class="stat-value font-mono">{{ currentWeather().pressure }} hPa</span>
      <span class="stat-label">Presión</span>
    </div>
  </div>
</div>
```

**Tamaño de la temperatura hero:**

```scss
.hero-temp {
  font-size: clamp(80px, 12vw, 120px);
  line-height: 1;
  color: var(--color-text-primary);
  letter-spacing: -2px;
}
```

---

### 5. Row de datos secundarios (4 cards pequeñas)

```html
<div class="data-row">
  <!-- AQI -->
  <div class="data-card glass-card" #weatherCard>
    <mat-icon class="data-card__icon" [style.color]="aqiColor()">air</mat-icon>
    <span class="data-card__value font-mono">{{ currentWeather().aqi }}</span>
    <span class="data-card__label">AQI · {{ currentWeather().aqiLabel }}</span>
    <!-- Barra de color semafórico (5 segmentos) -->
    <div class="aqi-bar">
      @for (i of [1,2,3,4,5]; track i) {
      <div class="aqi-segment" [class.active]="i <= currentWeather().aqi" [style.background]="i <= currentWeather().aqi ? aqiColor() : 'rgba(255,255,255,0.1)'"></div>
      }
    </div>
  </div>

  <!-- UV Index -->
  <div class="data-card glass-card" #weatherCard>
    <mat-icon class="data-card__icon" style="color: var(--color-sun)">wb_sunny</mat-icon>
    <span class="data-card__value font-mono" style="color: var(--color-sun)">{{ currentWeather().uvIndex }}</span>
    <span class="data-card__label">Índice UV</span>
    <span class="data-card__sublabel">{{ uvLabel() }}</span>
    <!-- computed: 'Moderado', 'Alto', etc. -->
  </div>

  <!-- Amanecer / Atardecer -->
  <div class="data-card glass-card" #weatherCard>
    <div class="sun-times">
      <div class="sun-time">
        <mat-icon style="color: var(--color-sun)">wb_twilight</mat-icon>
        <span class="font-mono">{{ currentWeather().sunrise }}</span>
        <span class="data-card__label">Amanecer</span>
      </div>
      <div class="sun-time">
        <mat-icon style="color: #F97316">nightlight_round</mat-icon>
        <span class="font-mono">{{ currentWeather().sunset }}</span>
        <span class="data-card__label">Atardecer</span>
      </div>
    </div>
  </div>

  <!-- Visibilidad -->
  <div class="data-card glass-card" #weatherCard>
    <mat-icon class="data-card__icon" style="color: var(--color-info)">visibility</mat-icon>
    <span class="data-card__value font-mono">{{ currentWeather().visibility }} km</span>
    <span class="data-card__label">Visibilidad</span>
  </div>
</div>
```

---

### 6. Pronóstico Horario — Scroll horizontal

```html
<section class="section-block" #weatherCard>
  <h2 class="section-title">Próximas 24 horas</h2>

  <!-- Angular CDK Virtual Scroll (horizontal) -->
  <cdk-virtual-scroll-viewport #hourlyScroll orientation="horizontal" itemSize="80" class="hourly-scroll" role="list">
    <div *cdkVirtualFor="let item of hourlyForecast(); trackBy: trackByHour" class="hourly-item glass-card" role="listitem">
      <span class="hourly-hour font-body">{{ item.hour }}</span>
      <!-- Icono pequeño según condición -->
      <div class="hourly-icon condition-icon--{{ item.condition }} condition-icon--sm" aria-hidden="true"></div>
      <span class="hourly-temp font-mono">{{ item.temp }}°</span>
      @if (item.precipChance > 20) {
      <span class="hourly-precip font-mono" style="color: var(--color-info)"> {{ item.precipChance }}% </span>
      }
    </div>
  </cdk-virtual-scroll-viewport>
</section>
```

---

### 7. Pronóstico 7 días

```html
<section class="section-block" #weatherCard>
  <h2 class="section-title">Próximos 7 días</h2>

  <div class="daily-list">
    @for (day of dailyForecast(); track day.date) {
    <div class="daily-row glass-card">
      <!-- Día -->
      <span class="daily-day font-body">{{ day.day }}</span>
      <span class="daily-date font-body" style="color: var(--color-text-secondary)">{{ day.date }}</span>

      <!-- Icono condición -->
      <div class="condition-icon--{{ day.condition }} condition-icon--sm" aria-hidden="true"></div>

      <!-- Precipitación (si > 10%) -->
      @if (day.precipChance > 10) {
      <span class="daily-precip font-mono" style="color: var(--color-info)"> {{ day.precipChance }}% </span>
      }

      <!-- Barra de temperatura -->
      <div class="temp-range">
        <span class="temp-min font-mono" style="color: var(--color-text-secondary)"> {{ day.tempMin }}° </span>
        <div class="temp-bar">
          <!-- Barra degradada de min a max relativa al rango de la semana -->
          <div class="temp-bar__fill" [style.width.%]="getTempBarWidth(day)"></div>
        </div>
        <span class="temp-max font-mono">{{ day.tempMax }}°</span>
      </div>
    </div>
    }
  </div>
</section>
```

---

### 8. Skeleton Loaders (con @defer)

```html
@defer (when !isLoading()) {
<!-- Todo el contenido real del dashboard -->
} @loading {
<!-- Skeletons que replican exactamente la forma del contenido real -->
<div class="skeleton-hero glass-card pulse"></div>
<div class="skeleton-row">
  @for (i of [1,2,3,4]; track i) {
  <div class="skeleton-card glass-card pulse"></div>
  }
</div>
<div class="skeleton-section glass-card pulse"></div>
<div class="skeleton-section glass-card pulse"></div>
}
```

CSS del skeleton:

```scss
@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
}
.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-hero {
  height: 220px;
}
.skeleton-card {
  height: 140px;
}
.skeleton-section {
  height: 200px;
}

// Respetar prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  .pulse {
    animation: none;
    opacity: 0.4;
  }
}
```

---

## Íconos de condición climática

Crear íconos SVG inline en el SCSS usando `content` o directamente en el template. Alternativamente, usar SVGs del set [Meteocons](https://bas.dev/work/meteocons) (open source). Mínimo implementar:

| Condición       | Clase CSS                        | Representación         |
| --------------- | -------------------------------- | ---------------------- |
| `sunny`         | `.condition-icon--sunny`         | Sol amarillo con rayos |
| `partly-cloudy` | `.condition-icon--partly-cloudy` | Sol + nube             |
| `cloudy`        | `.condition-icon--cloudy`        | Nube gris              |
| `rainy`         | `.condition-icon--rainy`         | Nube + gotas azules    |
| `stormy`        | `.condition-icon--stormy`        | Nube + rayo amarillo   |
| `snowy`         | `.condition-icon--snowy`         | Nube + copos blancos   |

Los íconos grandes (hero) deben ser ~96px. Los pequeños (horario/diario) ~32px.

---

## Responsive — Breakpoints

Implementar con Tailwind CSS clases + media queries propias para lo que Tailwind no cubra.

### Mobile (< 640px)

```
Layout: stack vertical, 1 columna
Hero card: temperatura centrada, datos rápidos abajo en grid 3 columnas
Data row: 2x2 grid
Section title: 14px
Scroll horizontal habilitado en pronóstico horario
```

### Tablet (640px – 1199px)

```
Layout: stack vertical, cards con más padding
Hero card: layout horizontal (izq: icono+condición / centro: temp / der: datos rápidos)
Data row: 4 columnas en una fila
Daily list: filas más compactas
```

### Desktop (≥ 1200px)

```
Max-width: 1280px, centrado con padding horizontal
Hero card: layout horizontal amplio
Data row: 4 columnas de ancho equilibrado
Pronóstico horario: más items visibles (no necesita scroll en desktop)
Daily list: rows con más espacio y hover effect
```

Implementación SCSS base:

```scss
.dashboard-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 1;

  @media (min-width: 640px) {
    padding: 2rem 1.5rem;
  }
  @media (min-width: 1200px) {
    padding: 2.5rem 2rem;
  }
}

.data-row {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, 1fr);

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.hero-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    padding: 2rem 2.5rem;
  }
}
```

---

## Animaciones GSAP — Especificaciones completas

### 1. Counter de temperatura hero

```typescript
// Animar el número de temperatura al entrar o al cambiar de ciudad
gsap.fromTo(
  heroTempEl,
  { innerText: 0 },
  {
    innerText: currentWeather().temp,
    duration: 1.2,
    ease: "power2.out",
    snap: { innerText: 1 },
    onUpdate() {
      heroTempEl.textContent = Math.round(+heroTempEl.textContent!) + "°";
    },
  },
);
```

### 2. Entrada de cards con stagger

```typescript
gsap.from(allCards, {
  opacity: 0,
  y: 32,
  scale: 0.97,
  duration: 0.55,
  ease: "power3.out",
  stagger: 0.08,
});
```

### 3. Transición de entrada de pantalla

```typescript
// En ngAfterViewInit, después de que isLoading() cambia a false
gsap.from(".dashboard-container", {
  opacity: 0,
  y: 12,
  duration: 0.4,
  ease: "power2.out",
});
```

### 4. Skeleton → contenido

Al pasar de loading a contenido, usar un crossfade:

```typescript
gsap.to(skeletonEl, { opacity: 0, duration: 0.2, onComplete: () => /* mostrar contenido */ });
gsap.from(contentEl, { opacity: 0, duration: 0.35, delay: 0.1 });
```

### Guard de motion

```typescript
// Wrapper: si prefers-reduced-motion, no ejecutar ninguna animación
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  this.initAnimations();
}
```

---

## Detalles de calidad visual que NO deben omitirse

1. **Hover en las cards:** `transform: translateY(-2px)` con `transition: 0.2s ease` — sutil pero premium.

2. **Cursor pointer** en las cards diarias/horarias (llevarán click a pantalla de detalle en el futuro).

3. **Border highlight en hover:** al hacer hover sobre una card, su borde sube de `rgba(255,255,255,0.10)` a `rgba(255,255,255,0.20)`.

4. **Scroll personalizado** en el pronóstico horario:

```scss
.hourly-scroll::-webkit-scrollbar {
  height: 4px;
}
.hourly-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.hourly-scroll::-webkit-scrollbar-thumb {
  background: rgba(58, 134, 255, 0.4);
  border-radius: 2px;
}
```

5. **Focus visible** en todos los elementos interactivos — outline de 2px accent color con offset de 2px.

6. **Punto de rocío y viento con dirección:** incluir la dirección del viento como una pequeña flecha SVG rotada según los grados.

7. **La temperatura en el hero debe ser la cosa más grande y llamativa de la pantalla.** Nada debe competir con ella visualmente en mobile.

8. **Padding bottom extra** en el dashboard container: `padding-bottom: calc(5rem + env(safe-area-inset-bottom))` para que el contenido no quede tapado cuando se agregue el bottom nav.

---

## Accesibilidad (WCAG AA)

- `role="main"` en el contenedor principal del dashboard.
- Todas las cards con `aria-label` descriptivo (e.g., `aria-label="Temperatura actual: 22 grados Celsius"`).
- El banner offline con `role="alert"` y `aria-live="assertive"`.
- El pronóstico horario como `role="list"` + `role="listitem"`.
- Contraste mínimo 4.5:1 para texto normal verificado contra el fondo de card `#1B3A5C`.
- Skeleton loaders con `aria-busy="true"` en el contenedor mientras cargan.
- `aria-hidden="true"` en todos los íconos decorativos.

---

## Resultado esperado

Al finalizar, el dashboard debe:

- ✅ Mostrar skeleton loaders por ~800ms al iniciar, luego transicionar con animación al contenido real
- ✅ Temperatura hero animada con counter de GSAP al entrar
- ✅ Cards entrando con stagger suave
- ✅ Scroll horizontal fluido en pronóstico de 24hs
- ✅ 7 días de pronóstico con barras de temperatura
- ✅ 4 data cards (AQI, UV, Amanecer/Atardecer, Visibilidad)
- ✅ Fondo navy con orbes borrosos que dan profundidad al glassmorphism
- ✅ Responsive en mobile, tablet y desktop — 3 breakpoints distintos
- ✅ Sin navbar (se implementa por separado)
- ✅ Todos los datos son mock (sin llamadas a API)
- ✅ prefers-reduced-motion respetado
- ✅ Accesibilidad WCAG AA

---

_Este prompt es parte del PRD WeatherApp v1.0 — Fase 2 (Core). El componente vive en `src/app/features/dashboard/`._
