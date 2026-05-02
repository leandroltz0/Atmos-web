# Prompt — Pantalla Detail (WeatherApp Angular 19)

## Rol

Sos un desarrollador senior de Angular 19 especializado en UI premium y data visualization. Tu tarea es construir desde cero la pantalla `/detail` de una app de clima llamada **Atmos**, siguiendo exactamente las especificaciones de diseño, estructura y stack detalladas en este documento.

---

## Stack y restricciones técnicas obligatorias

- **Angular 19** — Standalone Components únicamente, sin NgModules
- **Signals** para todo el estado local (`signal()`, `computed()`, `effect()`)
- **Tailwind CSS v3** para utilidades de layout y spacing
- **Angular Material** para Tabs (`MatTabsModule`)
- **TypeScript strict** — no usar `any`, tipar todos los modelos
- **SVG nativo** para todos los gráficos — no usar librerías de charting externas (no Chart.js, no D3, no Recharts)
- **Sin animaciones GSAP por ahora** — cero imports de GSAP en esta pantalla, se agregarán en una iteración posterior
- **Sin NgModules** — todo con `imports: []` en el decorador `@Component`
- **CSS Variables** del sistema de diseño — nunca hardcodear colores como strings literales en el template

---

## Sistema de diseño — Aplicar en cada elemento

### Paleta de colores (CSS Variables ya definidas globalmente)

```css
--color-bg-primary: #0D1B2A;      /* Fondo de pantalla */
--color-bg-card: #1B3A5C;         /* Fondo de cards y contenedores */
--color-accent: #3A86FF;           /* Líneas de gráficos, tab activo, highlights */
--color-info: #48CAE4;             /* Datos informativos, AQI */
--color-sun: #FFD166;              /* Temperatura alta, UV, sol */
--color-text-primary: #FFFFFF;     /* Valores numéricos principales */
--color-text-secondary: #8BAEC8;   /* Labels, subtítulos, ejes de tiempo */
--color-danger: #EF4444;           /* Alertas, UV extremo */
--color-success: #10B981;          /* UV bajo, estado OK */
```

### Tipografía (fuentes ya importadas globalmente)

| Familia | Uso | Peso |
|---------|-----|------|
| `DM Serif Display` | Temperatura hero en el header | 400 |
| `Plus Jakarta Sans` | Todo el resto: labels, botones, body, tabs | 400, 500, 600 |
| `JetBrains Mono` | Valores numéricos de datos precisos (presión, velocidad, AQI) | 400 |

### Cards — estilo base

```css
background: var(--color-bg-card);
border-radius: 16px;
border: 1px solid rgba(255, 255, 255, 0.06);
padding: 20px;
```

No usar `box-shadow` llamativo — el borde sutil es suficiente para el glassmorphism.

### Separadores de sección

Cada sección dentro de una card lleva un acento izquierdo:

```css
border-left: 3px solid var(--color-accent);
padding-left: 10px;
font-family: 'Plus Jakarta Sans';
font-weight: 600;
font-size: 0.7rem;
letter-spacing: 0.1em;
text-transform: uppercase;
color: var(--color-text-secondary);
```

---

## Estructura de archivos a crear

```
src/app/features/detail/
├── detail.component.ts
├── detail.component.html
├── detail.component.scss
└── components/
    ├── hourly-temp-chart/
    │   ├── hourly-temp-chart.component.ts
    │   └── hourly-temp-chart.component.html
    ├── rain-probability-chart/
    │   ├── rain-probability-chart.component.ts
    │   └── rain-probability-chart.component.html
    ├── uv-index-chart/
    │   ├── uv-index-chart.component.ts
    │   └── uv-index-chart.component.html
    ├── weekly-forecast/
    │   ├── weekly-forecast.component.ts
    │   └── weekly-forecast.component.html
    ├── sun-arc/
    │   ├── sun-arc.component.ts
    │   └── sun-arc.component.html
    ├── moon-phase/
    │   ├── moon-phase.component.ts
    │   └── moon-phase.component.html
    └── detail-stats/
        ├── detail-stats.component.ts
        └── detail-stats.component.html
```

Todos los componentes: `changeDetection: ChangeDetectionStrategy.OnPush`, Standalone, con `imports` explícitos.

---

## Modelos de datos (interfaces TypeScript)

```typescript
// models/weather.model.ts — ya existente, verificar que tenga:

export interface HourlyData {
  time: string;        // '00:00', '01:00', ... '23:00'
  temp: number;        // temperatura en °C
  feelsLike: number;   // sensación térmica en °C
  rain: number;        // probabilidad de lluvia 0–100
  uv: number;          // índice UV 0–11
  windSpeed: number;   // km/h
  windDir: string;     // 'N', 'NE', 'SE', etc.
}

export interface DailyData {
  dayLabel: string;    // 'Hoy', 'Lun', 'Mar', ...
  dateLabel: string;   // '30 Abr', '1 May', ...
  icon: string;        // 'sun' | 'cloud' | 'rain' | 'storm' | 'snow'
  rainPercent: number; // 0–100
  tempMin: number;
  tempMax: number;
  windSpeed: number;
  windDir: string;
}

export interface DetailData {
  sunrise: string;     // '07:29'
  sunset: string;      // '18:09'
  moonPhase: string;   // 'Cuarto creciente'
  moonIllumination: number; // 0–100
  pressure: number;    // hPa
  pressureTrend: string;   // '→ Estable' | '↑ Subiendo' | '↓ Bajando'
  dewPoint: number;    // °C
  dewPointDesc: string;    // 'Aire templado al anochecer'
  visibility: number;  // km (0–10+)
  aqi: number;         // 0–500
  aqiLabel: string;    // 'Bueno' | 'Moderado' | 'Dañino' etc.
}

export interface CityWeather {
  cityName: string;
  country: string;
  temp: number;
  condition: string;   // 'Parcialmente nublado'
  conditionIcon: string;
  hourly: HourlyData[];   // 24 items, uno por hora
  daily: DailyData[];     // 7 items
  detail: DetailData;
}
```

---

## Datos mock para desarrollo

En `detail.component.ts`, definir un Signal con datos mock mientras no está conectada la API:

```typescript
readonly weatherData = signal<CityWeather>({
  cityName: 'Buenos Aires',
  country: 'AR',
  temp: 18,
  condition: 'Parcialmente nublado',
  conditionIcon: 'cloud',
  hourly: [
    { time: '00:00', temp: 14, feelsLike: 13, rain: 5,  uv: 0,  windSpeed: 12, windDir: 'SE' },
    { time: '01:00', temp: 13, feelsLike: 12, rain: 5,  uv: 0,  windSpeed: 11, windDir: 'SE' },
    { time: '02:00', temp: 13, feelsLike: 12, rain: 6,  uv: 0,  windSpeed: 10, windDir: 'S'  },
    { time: '03:00', temp: 12, feelsLike: 11, rain: 8,  uv: 0,  windSpeed: 10, windDir: 'S'  },
    { time: '04:00', temp: 12, feelsLike: 11, rain: 7,  uv: 0,  windSpeed: 9,  windDir: 'S'  },
    { time: '05:00', temp: 12, feelsLike: 11, rain: 6,  uv: 0,  windSpeed: 9,  windDir: 'SE' },
    { time: '06:00', temp: 12, feelsLike: 11, rain: 5,  uv: 0,  windSpeed: 10, windDir: 'SE' },
    { time: '07:00', temp: 13, feelsLike: 12, rain: 4,  uv: 1,  windSpeed: 11, windDir: 'SE' },
    { time: '08:00', temp: 14, feelsLike: 13, rain: 4,  uv: 2,  windSpeed: 12, windDir: 'SE' },
    { time: '09:00', temp: 15, feelsLike: 14, rain: 5,  uv: 3,  windSpeed: 14, windDir: 'SE' },
    { time: '10:00', temp: 16, feelsLike: 15, rain: 6,  uv: 4,  windSpeed: 15, windDir: 'E'  },
    { time: '11:00', temp: 17, feelsLike: 16, rain: 7,  uv: 5,  windSpeed: 16, windDir: 'E'  },
    { time: '12:00', temp: 17, feelsLike: 16, rain: 8,  uv: 6,  windSpeed: 16, windDir: 'SE' },
    { time: '13:00', temp: 18, feelsLike: 17, rain: 7,  uv: 7,  windSpeed: 17, windDir: 'SE' },
    { time: '14:00', temp: 18, feelsLike: 17, rain: 7,  uv: 6,  windSpeed: 16, windDir: 'SE' },
    { time: '15:00', temp: 18, feelsLike: 17, rain: 8,  uv: 5,  windSpeed: 15, windDir: 'SE' },
    { time: '16:00', temp: 17, feelsLike: 16, rain: 9,  uv: 3,  windSpeed: 15, windDir: 'SE' },
    { time: '17:00', temp: 17, feelsLike: 16, rain: 9,  uv: 2,  windSpeed: 14, windDir: 'SE' },
    { time: '18:00', temp: 16, feelsLike: 15, rain: 10, uv: 1,  windSpeed: 14, windDir: 'SE' },
    { time: '19:00', temp: 15, feelsLike: 14, rain: 10, uv: 0,  windSpeed: 13, windDir: 'SE' },
    { time: '20:00', temp: 15, feelsLike: 14, rain: 11, uv: 0,  windSpeed: 13, windDir: 'SE' },
    { time: '21:00', temp: 14, feelsLike: 13, rain: 12, uv: 0,  windSpeed: 12, windDir: 'SE' },
    { time: '22:00', temp: 14, feelsLike: 13, rain: 12, uv: 0,  windSpeed: 12, windDir: 'SE' },
    { time: '23:00', temp: 14, feelsLike: 13, rain: 10, uv: 0,  windSpeed: 11, windDir: 'SE' },
  ],
  daily: [
    { dayLabel: 'Hoy',  dateLabel: '30 Abr', icon: 'cloud', rainPercent: 18, tempMin: 12, tempMax: 19, windSpeed: 16, windDir: 'SE' },
    { dayLabel: 'Jue',  dateLabel: '1 May',  icon: 'sun',   rainPercent: 6,  tempMin: 13, tempMax: 21, windSpeed: 12, windDir: 'E'  },
    { dayLabel: 'Vie',  dateLabel: '2 May',  icon: 'cloud', rainPercent: 14, tempMin: 14, tempMax: 20, windSpeed: 18, windDir: 'SE' },
    { dayLabel: 'Sáb',  dateLabel: '3 May',  icon: 'rain',  rainPercent: 64, tempMin: 11, tempMax: 17, windSpeed: 22, windDir: 'SE' },
    { dayLabel: 'Dom',  dateLabel: '4 May',  icon: 'storm', rainPercent: 72, tempMin: 10, tempMax: 16, windSpeed: 28, windDir: 'S'  },
    { dayLabel: 'Lun',  dateLabel: '5 May',  icon: 'cloud', rainPercent: 24, tempMin: 9,  tempMax: 18, windSpeed: 19, windDir: 'SO' },
    { dayLabel: 'Mar',  dateLabel: '6 May',  icon: 'sun',   rainPercent: 4,  tempMin: 12, tempMax: 22, windSpeed: 14, windDir: 'NE' },
  ],
  detail: {
    sunrise: '07:29',
    sunset: '18:09',
    moonPhase: 'Cuarto creciente',
    moonIllumination: 42,
    pressure: 1016,
    pressureTrend: '→ Estable',
    dewPoint: 11,
    dewPointDesc: 'Aire templado al anochecer',
    visibility: 12,
    aqi: 28,
    aqiLabel: 'Bueno',
  }
});
```

---

## Header de la pantalla (sticky)

```
┌─────────────────────────────────────────────────┐
│  ←                Buenos Aires, AR          [↑] │
│            18°  ☁  Parcialmente nublado          │
└─────────────────────────────────────────────────┘
```

- `position: sticky; top: 0; z-index: 10`
- `background: var(--color-bg-primary)`
- Flecha atrás: `MatIconButton` o botón con ícono SVG, navega a `/dashboard`
- Ciudad: `font-family: Plus Jakarta Sans; font-weight: 600; font-size: 1rem; color: var(--color-text-primary)`
- Temperatura: `font-family: DM Serif Display; font-size: 2rem; color: var(--color-text-primary)`
- Condición: chip/badge con `background: rgba(255,255,255,0.1); border-radius: 20px; padding: 2px 10px; font-size: 0.75rem; color: var(--color-text-secondary)`
- Ícono de compartir: alineado a la derecha, activa `navigator.share()` con Web Share API
- Separador inferior: `border-bottom: 1px solid rgba(255,255,255,0.06)`

---

## Tabs de navegación

Usar `MatTabGroup` con:

```html
<mat-tab-group>
  <mat-tab label="HOY"> ... </mat-tab>
  <mat-tab label="ESTA SEMANA"> ... </mat-tab>
  <mat-tab label="DETALLE"> ... </mat-tab>
</mat-tab-group>
```

Estilos del tab group (en `detail.component.scss` con `::ng-deep` o en `styles.scss`):

```scss
.mat-mdc-tab-header {
  background: var(--color-bg-primary);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.mat-mdc-tab .mdc-tab__text-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}
.mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
  color: var(--color-text-primary);
}
.mdc-tab-indicator__content--underline {
  border-color: var(--color-accent) !important;
}
.mat-mdc-tab-body-wrapper {
  background: var(--color-bg-primary);
}
```

El contenedor de cada tab body debe tener:
```css
padding: 16px;
padding-bottom: 80px; /* compensar bottom nav */
overflow-y: auto;
display: flex;
flex-direction: column;
gap: 16px;
```

---

## TAB 1 — "HOY"

### Sección A: Temperatura 24 horas (`hourly-temp-chart`)

**Input:** `@Input() hourlyData: HourlyData[]`

El componente recibe el array de 24 horas y renderiza un SVG responsivo.

**Reglas de implementación SVG:**

```typescript
// En el componente, usar AfterViewInit + ResizeObserver
// NUNCA hardcodear width en el SVG

@ViewChild('chartContainer') chartContainer!: ElementRef;
private resizeObserver!: ResizeObserver;
readonly chartWidth = signal(300);
readonly chartHeight = signal(120);

ngAfterViewInit() {
  this.resizeObserver = new ResizeObserver(entries => {
    const width = entries[0].contentRect.width;
    this.chartWidth.set(width);
  });
  this.resizeObserver.observe(this.chartContainer.nativeElement);
}

ngOnDestroy() {
  this.resizeObserver.disconnect();
}
```

**Cálculo de la curva:**

```typescript
readonly svgPath = computed(() => {
  const data = this.hourlyData();
  const w = this.chartWidth();
  const h = this.chartHeight();
  const paddingX = 16;
  const paddingTop = 20;
  const paddingBottom = 30; // espacio para labels de hora
  const drawH = h - paddingTop - paddingBottom;

  const temps = data.map(d => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp || 1;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (w - paddingX * 2);
    const y = paddingTop + (1 - (d.temp - minTemp) / range) * drawH;
    return { x, y, ...d };
  });

  // Path suavizado con cubic bezier
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return acc + ` C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  // Area fill (cierra el path por abajo)
  const areaPath = linePath
    + ` L ${points[points.length-1].x} ${h - paddingBottom}`
    + ` L ${points[0].x} ${h - paddingBottom} Z`;

  return { linePath, areaPath, points };
});
```

**Template SVG:**

```html
<div #chartContainer class="w-full">
  <svg
    [attr.width]="chartWidth()"
    [attr.height]="chartHeight()"
    [attr.viewBox]="'0 0 ' + chartWidth() + ' ' + chartHeight()"
    class="overflow-visible"
  >
    <defs>
      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3A86FF" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#3A86FF" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Area fill -->
    <path
      [attr.d]="svgPath().areaPath"
      fill="url(#tempGradient)"
    />

    <!-- Línea principal -->
    <path
      [attr.d]="svgPath().linePath"
      fill="none"
      stroke="#3A86FF"
      stroke-width="2"
      stroke-linecap="round"
    />

    <!-- Puntos de datos (solo mostrar cada 3 horas: 00, 03, 06...) -->
    @for (p of svgPath().points; track p.time) {
      @if (isLabelHour(p.time)) {
        <circle [attr.cx]="p.x" [attr.cy]="p.y" r="3" fill="white" stroke="#3A86FF" stroke-width="1.5"/>
      }
    }

    <!-- Labels de hora en eje X (00, 03, 06, 09, 12, 15, 18, 21) -->
    @for (p of svgPath().points; track p.time) {
      @if (isLabelHour(p.time)) {
        <text
          [attr.x]="p.x"
          [attr.y]="chartHeight() - 4"
          text-anchor="middle"
          fill="#8BAEC8"
          font-size="10"
          font-family="Plus Jakarta Sans"
        >{{ p.time.slice(0,2) }}</text>
      }
    }
  </svg>
</div>
```

Método helper:
```typescript
isLabelHour(time: string): boolean {
  return ['00:00','03:00','06:00','09:00','12:00','15:00','18:00','21:00'].includes(time);
}
```

**Tooltip al hover/touch:**
- Estado local: `readonly hoveredPoint = signal<HourlyData | null>(null)`
- En el SVG, agregar un rect transparente de overlay que capture `mousemove` y calcule el punto más cercano
- El tooltip es un `<div>` posicionado absolutamente con `position: absolute` dentro del wrapper relativo:

```html
@if (hoveredPoint()) {
  <div class="tooltip-card" [style.left.px]="tooltipX()">
    <span class="time">{{ hoveredPoint()!.time }}</span>
    <span class="temp">{{ hoveredPoint()!.temp }}°</span>
    <span class="feels">ST {{ hoveredPoint()!.feelsLike }}°</span>
    <span class="rain">💧 {{ hoveredPoint()!.rain }}%</span>
  </div>
}
```

Tooltip card styles:
```css
.tooltip-card {
  background: var(--color-bg-card);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 8px 12px;
  font-family: 'Plus Jakarta Sans';
  font-size: 0.75rem;
  color: var(--color-text-primary);
  pointer-events: none;
  white-space: nowrap;
}
```

---

### Sección B: Probabilidad de lluvia (`rain-probability-chart`)

**Input:** `@Input() hourlyData: HourlyData[]`

**Reglas críticas:**
- Gráfico de **barras verticales**, no de línea
- Eje Y: **siempre fijo de 0 a 100** — nunca autoscale
- Altura de cada barra: `Math.max((value / 100) * drawHeight, 2)` — mínimo 2px visual siempre
- Color de barra: `var(--color-accent)` con `opacity: 0.75`
- Border-radius solo en la parte superior: `rx="3" ry="3"` en el `<rect>` SVG
- Baseline: línea horizontal en Y=100% del área de dibujo con `stroke: rgba(255,255,255,0.08)`

```typescript
readonly bars = computed(() => {
  const data = this.hourlyData();
  const w = this.chartWidth();
  const h = 100; // altura fija de la zona de barras
  const paddingX = 16;
  const paddingBottom = 24;
  const drawH = h - paddingBottom;
  const totalBars = data.length; // 24
  const barWidth = Math.max(((w - paddingX * 2) / totalBars) - 2, 2);

  return data.map((d, i) => {
    const barH = Math.max((d.rain / 100) * drawH, 2);
    const x = paddingX + i * ((w - paddingX * 2) / totalBars);
    const y = drawH - barH;
    return { x, y, width: barWidth, height: barH, ...d };
  });
});
```

Template:
```html
<svg [attr.width]="chartWidth()" height="100" [attr.viewBox]="'0 0 ' + chartWidth() + ' 100'">
  <!-- Baseline -->
  <line [attr.x1]="16" [attr.x2]="chartWidth()-16" y1="76" y2="76"
        stroke="rgba(255,255,255,0.08)" stroke-width="1"/>

  @for (bar of bars(); track bar.time) {
    <rect
      [attr.x]="bar.x"
      [attr.y]="bar.y"
      [attr.width]="bar.width"
      [attr.height]="bar.height"
      fill="#3A86FF"
      fill-opacity="0.75"
      rx="2" ry="2"
    />
  }

  <!-- Labels eje X -->
  @for (bar of bars(); track bar.time) {
    @if (isLabelHour(bar.time)) {
      <text [attr.x]="bar.x + bar.width/2" y="96"
            text-anchor="middle" fill="#8BAEC8" font-size="9" font-family="Plus Jakarta Sans">
        {{ bar.time.slice(0,2) }}
      </text>
    }
  }
</svg>
```

---

### Sección C: Índice UV (`uv-index-chart`)

**Input:** `@Input() hourlyData: HourlyData[]`

**Igual que el de lluvia pero con colores por nivel:**

```typescript
getUvColor(uv: number): string {
  if (uv <= 2) return '#10B981';  // verde — BAJO
  if (uv <= 5) return '#FFD166';  // amarillo — MODERADO
  if (uv <= 7) return '#F97316';  // naranja — ALTO
  if (uv <= 10) return '#EF4444'; // rojo — MUY ALTO
  return '#8B5CF6';               // violeta — EXTREMO
}
```

Leyenda en la parte superior de la card:

```html
<div class="flex gap-3 flex-wrap">
  <span class="legend-item"><span class="dot" style="background:#10B981"></span> BAJO</span>
  <span class="legend-item"><span class="dot" style="background:#FFD166"></span> MOD</span>
  <span class="legend-item"><span class="dot" style="background:#F97316"></span> ALTO</span>
  <span class="legend-item"><span class="dot" style="background:#EF4444"></span> MUY ALTO</span>
  <span class="legend-item"><span class="dot" style="background:#8B5CF6"></span> EXT</span>
</div>
```

Estilos de leyenda:
```css
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Plus Jakarta Sans';
  font-size: 0.65rem;
  color: var(--color-text-secondary);
}
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
```

Las horas nocturnas (donde UV = 0) muestran una barra mínima de 2px con el color verde y `opacity: 0.2`.

---

## TAB 2 — "ESTA SEMANA" (`weekly-forecast`)

**Input:** `@Input() dailyData: DailyData[]`

Layout de lista vertical, una fila por día:

```
┌─────────────────────────────────────────────────────────┐
│  Hoy        ☁  💧 18%   Min 12° ████████████ Max 19°   │
│  30 Abr        16 km/h SE                               │
├─────────────────────────────────────────────────────────┤
│  Jue        ☀  💧  6%   Min 13° ████████████████ Max 21°│
│  1 May         12 km/h E                                │
└─────────────────────────────────────────────────────────┘
```

**Estructura de cada fila:**

```html
<div class="day-row" @for (day of dailyData(); track day.dateLabel)>
  <!-- Col 1: día -->
  <div class="day-label">
    <span class="day-name">{{ day.dayLabel }}</span>
    <span class="day-date">{{ day.dateLabel }}</span>
    <span class="day-wind">≈ {{ day.windSpeed }} km/h {{ day.windDir }}</span>
  </div>

  <!-- Col 2: ícono -->
  <app-weather-icon [icon]="day.icon" size="28" />

  <!-- Col 3: lluvia % -->
  <span class="rain-pct">💧 {{ day.rainPercent }}%</span>

  <!-- Col 4: barra de rango temperatura -->
  <div class="temp-range">
    <span class="temp-min">Min {{ day.tempMin }}°</span>
    <div class="range-bar-container">
      <div class="range-bar" [style.width.%]="getRangeWidth(day)"></div>
    </div>
    <span class="temp-max">Max {{ day.tempMax }}°</span>
  </div>
</div>
```

**Barra de rango de temperatura:**
- Calcular el mínimo y máximo absoluto de todos los días para normalizar la barra
- La barra ocupa `((tempMax - tempMin) / globalRange) * 100%` del contenedor
- El offset izquierdo: `((tempMin - globalMin) / globalRange) * 100%`
- Color: gradiente horizontal de `var(--color-accent)` a `var(--color-info)`

```typescript
readonly globalMin = computed(() => Math.min(...this.dailyData().map(d => d.tempMin)));
readonly globalMax = computed(() => Math.max(...this.dailyData().map(d => d.tempMax)));

getRangeWidth(day: DailyData): number {
  const range = this.globalMax() - this.globalMin() || 1;
  return ((day.tempMax - day.tempMin) / range) * 100;
}

getRangeOffset(day: DailyData): number {
  const range = this.globalMax() - this.globalMin() || 1;
  return ((day.tempMin - this.globalMin()) / range) * 100;
}
```

CSS de la barra:
```css
.range-bar-container {
  flex: 1;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  position: relative;
  min-width: 80px;
}
.range-bar {
  position: absolute;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(to right, #3A86FF, #48CAE4);
}
```

**Estilos de la fila:**
```css
.day-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.day-row:last-child { border-bottom: none; }
.day-name { font-family: 'Plus Jakarta Sans'; font-weight: 600; font-size: 0.9rem; color: var(--color-text-primary); }
.day-date { font-size: 0.75rem; color: var(--color-text-secondary); }
.day-wind { font-size: 0.7rem; color: var(--color-text-secondary); margin-top: 2px; }
.rain-pct { font-family: 'Plus Jakarta Sans'; font-size: 0.8rem; color: var(--color-accent); min-width: 44px; }
.temp-min, .temp-max { font-family: 'JetBrains Mono'; font-size: 0.8rem; color: var(--color-text-secondary); white-space: nowrap; }
```

---

## TAB 3 — "DETALLE" (`detail-stats`)

### Sección A: SOL (`sun-arc`)

**Input:** `@Input() sunrise: string`, `@Input() sunset: string`

Card de ancho completo con arco SVG animado (sin animación por ahora, posición estática calculada).

**Cálculo de posición del sol:**
```typescript
readonly sunPosition = computed(() => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [riseH, riseM] = this.sunrise().split(':').map(Number);
  const [setH, setM] = this.sunset().split(':').map(Number);
  const riseMinutes = riseH * 60 + riseM;
  const setMinutes = setH * 60 + setM;

  const progress = Math.max(0, Math.min(1,
    (currentMinutes - riseMinutes) / (setMinutes - riseMinutes)
  ));
  return progress; // 0 = amanecer, 1 = atardecer
});
```

**SVG del arco:**
```html
<svg viewBox="0 0 200 110" class="w-full" style="max-width: 260px; margin: 0 auto; display: block;">
  <!-- Arco de fondo (gris translúcido) -->
  <path d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        stroke-width="4"
        stroke-linecap="round"/>

  <!-- Arco recorrido (amarillo) -->
  <path [attr.d]="sunArcProgress()"
        fill="none"
        stroke="#FFD166"
        stroke-width="4"
        stroke-linecap="round"/>

  <!-- Punto del sol -->
  <circle [attr.cx]="sunX()" [attr.cy]="sunY()" r="8"
          fill="#FFD166" filter="url(#sunGlow)"/>

  <defs>
    <filter id="sunGlow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
</svg>
```

**Cálculo de posición X, Y del sol en el arco:**
```typescript
// El arco va de (20,100) a (180,100) con radio 80, centro en (100,100)
readonly sunX = computed(() => {
  const angle = Math.PI - this.sunPosition() * Math.PI; // de 180° a 0°
  return 100 + 80 * Math.cos(angle);
});
readonly sunY = computed(() => {
  const angle = Math.PI - this.sunPosition() * Math.PI;
  return 100 - 80 * Math.sin(angle);
});
```

Debajo del arco, mostrar:
```html
<div class="flex justify-between text-xs" style="color: var(--color-text-secondary); font-family: 'Plus Jakarta Sans';">
  <span>{{ sunrise() }}</span>
  <span>{{ sunset() }}</span>
</div>
<div class="mt-3 flex justify-between items-center">
  <span style="color: var(--color-text-secondary); font-size: 0.75rem;">Luz útil estimada</span>
  <span style="font-family: 'JetBrains Mono'; color: var(--color-text-primary); font-size: 0.9rem;">
    {{ daylightHours() }}h {{ daylightMins() }}m
  </span>
</div>
```

---

### Sección B: LUNA (`moon-phase`)

**Input:** `@Input() phase: string`, `@Input() illumination: number`

Card lado a lado con SOL en desktop, debajo en mobile.

Visual de la luna: círculo SVG que representa la fase.

```html
<div class="flex items-center gap-4">
  <svg viewBox="0 0 60 60" width="56" height="56">
    <!-- Fondo oscuro (luna oscura) -->
    <circle cx="30" cy="30" r="26" fill="#1B3A5C"/>
    <!-- Porción iluminada usando clip-path -->
    <circle cx="30" cy="30" r="26" fill="#C8D6E5" [attr.clip-path]="moonClipPath()"/>
  </svg>
  <div>
    <p style="font-family: 'Plus Jakarta Sans'; font-weight: 600; font-size: 0.9rem; color: var(--color-text-primary)">
      {{ phase() }}
    </p>
    <p style="font-family: 'Plus Jakarta Sans'; font-size: 0.75rem; color: var(--color-text-secondary)">
      {{ illumination() }}% iluminada
    </p>
  </div>
</div>
```

Grid para SOL + LUNA en el tab DETALLE:
```html
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div class="detail-card">
    <span class="section-label">SOL</span>
    <app-sun-arc [sunrise]="detail().sunrise" [sunset]="detail().sunset"/>
  </div>
  <div class="detail-card">
    <span class="section-label">LUNA</span>
    <app-moon-phase [phase]="detail().moonPhase" [illumination]="detail().moonIllumination"/>
  </div>
</div>
```

---

### Sección C: Stats inferiores (Presión, Punto de rocío, Visibilidad, AQI)

Grid responsive de cards:
```html
<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">

  <!-- PRESIÓN -->
  <div class="detail-card">
    <span class="section-label">PRESIÓN</span>
    <p class="stat-value" style="font-family: 'JetBrains Mono'">
      {{ detail().pressure }} <span class="stat-unit">hPa</span>
    </p>
    <p class="stat-desc">{{ detail().pressureTrend }}</p>
  </div>

  <!-- PUNTO DE ROCÍO -->
  <div class="detail-card">
    <span class="section-label">PUNTO DE ROCÍO</span>
    <p class="stat-value" style="font-family: 'JetBrains Mono'">
      {{ detail().dewPoint }}<span class="stat-unit">°C</span>
    </p>
    <p class="stat-desc">{{ detail().dewPointDesc }}</p>
  </div>

  <!-- VISIBILIDAD -->
  <div class="detail-card">
    <span class="section-label">VISIBILIDAD</span>
    <p class="stat-value" style="font-family: 'JetBrains Mono'">
      {{ detail().visibility }} <span class="stat-unit">km</span>
    </p>
    <!-- Barra de visibilidad -->
    <div class="visibility-bar-container">
      <div class="visibility-bar" [style.width.%]="visibilityPercent()"></div>
    </div>
    <p class="stat-desc">{{ visibilityLabel() }}</p>
  </div>

</div>
```

```typescript
// Helpers en detail.component.ts
readonly visibilityPercent = computed(() =>
  Math.min((this.weatherData().detail.visibility / 20) * 100, 100)
);

readonly visibilityLabel = computed(() => {
  const v = this.weatherData().detail.visibility;
  if (v >= 10) return 'Excelente';
  if (v >= 5) return 'Buena';
  if (v >= 2) return 'Moderada';
  return 'Baja';
});
```

Estilos de las stat cards:
```css
.detail-card {
  background: var(--color-bg-card);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.06);
  padding: 16px 20px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-top: 8px;
}
.stat-unit {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}
.stat-desc {
  font-family: 'Plus Jakarta Sans';
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
.visibility-bar-container {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  margin-top: 8px;
  margin-bottom: 4px;
}
.visibility-bar {
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(to right, #3A86FF, #48CAE4);
}
```

---

## Responsive — Reglas absolutas

### Mobile (`< 768px`)

- El header sticky no debe tener más de 80px de alto total
- Los tabs deben ocupar el 100% del ancho, sin scroll horizontal
- Los gráficos de barras (lluvia, UV) deben recalcular su ancho con `ResizeObserver`
- Las cards del tab DETALLE van en columna única
- `padding-bottom: 80px` en el contenedor del tab para no quedar detrás del bottom nav
- Los labels de eje X en los gráficos: font-size mínimo 9px, nunca que se superpongan — mostrar solo cada 3 horas

### Tablet (`768px – 1023px`)

- SOL y LUNA en grid de 2 columnas
- Las 3 stat cards en grid de 3 columnas
- Los gráficos de línea/barras con más padding horizontal (24px)

### Desktop (`≥ 1024px`)

- El contenido del tab se centra con `max-width: 800px; margin: 0 auto`
- Los tabs tienen más padding
- El header puede mostrar más información en una línea

---

## Componente `app-weather-icon`

Si no existe, crearlo como componente compartido:

```typescript
@Component({
  selector: 'app-weather-icon',
  standalone: true,
  template: `<span [style.font-size.px]="size()">{{ emoji() }}</span>`,
})
export class WeatherIconComponent {
  readonly icon = input.required<string>(); // 'sun' | 'cloud' | 'rain' | 'storm' | 'snow'
  readonly size = input<number>(24);

  readonly emoji = computed(() => {
    const map: Record<string, string> = {
      sun: '☀️', cloud: '⛅', rain: '🌧️', storm: '⛈️', snow: '❄️', fog: '🌫️'
    };
    return map[this.icon()] ?? '🌡️';
  });
}
```

> En una iteración posterior se reemplazarán los emojis por íconos SVG animados personalizados. Por ahora el emoji es suficiente para validar el layout.

---

## Restricciones de implementación

1. **Cero imports de GSAP** en esta pantalla — se agrega en la siguiente iteración
2. **Cero `any` en TypeScript** — tipar todo correctamente
3. **Cero NgModules** — todos los componentes son Standalone
4. **Cero dimensiones fijas en px para anchos de gráficos** — siempre con `ResizeObserver`
5. **Cero `height: 0` o elementos vacíos** — si un componente no tiene datos, mostrar un placeholder visible con el texto "Sin datos disponibles" en `var(--color-text-secondary)`
6. **Cero `overflow: hidden` en el scroll principal** — el contenido debe poder scrollear libremente
7. **El `padding-bottom` del tab body es obligatorio** — mínimo `80px` para compensar el bottom nav bar

---

## Orden de implementación recomendado

1. `detail.component.ts/html` — esqueleto con header, tabs, datos mock, layout base
2. `weekly-forecast` — tab ESTA SEMANA (más simple, solo layout)
3. `hourly-temp-chart` — gráfico de línea con SVG + tooltip
4. `rain-probability-chart` — gráfico de barras
5. `uv-index-chart` — igual que lluvia + colores por nivel
6. `sun-arc` — arco SVG con posición calculada
7. `moon-phase` — visual simple
8. `detail-stats` — grid de stat cards

Iterar en este orden para poder visualizar resultados funcionales en cada paso.

---

*Una vez que toda la pantalla esté visualmente correcta en mobile y desktop, se procederá a agregar las animaciones GSAP en una iteración separada.*
