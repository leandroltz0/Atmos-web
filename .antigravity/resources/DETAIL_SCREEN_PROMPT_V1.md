# Pantalla 04 — Detalle del Clima: Prompt de Implementación

**Para:** Codex / AI Agent  
**Tarea:** Crear la pantalla de Detalle del Clima desde cero — la vista más rica en datos de ATMOS  
**Ubicación:** `src/app/pages/detail/`  
**Ruta:** `/detail/:cityId` (por ahora usar `detail` sin parámetro, hardcoded a Buenos Aires)

---

## Contexto del proyecto

ATMOS es una weather app Angular 19 con estética dark-mode premium. Ya existen:

- **Dashboard** (`src/app/features/dashboard/`) — pantalla principal con glassmorphism, Meteocons SVG, orbes de fondo
- **Onboarding** y **Allow Location** — pantallas iniciales con Three.js globe
- **Design system global** en `src/styles.scss` con tokens CSS, glass-card, tipografía, orbes

Esta pantalla es la **más densa en información** de la app y la más técnicamente compleja por sus visualizaciones SVG animadas con GSAP.

---

## Stack técnico

| Categoría     | Tecnología                                                                               |
| ------------- | ---------------------------------------------------------------------------------------- |
| Framework     | Angular 19 standalone, `ChangeDetectionStrategy.OnPush`                                  |
| UI Components | Angular Material Tabs (`mat-tab-group`), Buttons, Snackbar                               |
| Animaciones   | GSAP 3.15 — SVG draw animations, stagger, timeline                                       |
| Scroll        | Angular CDK virtual scroll si es necesario                                               |
| Compartir     | Web Share API con fallback clipboard                                                     |
| Íconos UI     | SVGs inline custom (mismo patrón que el dashboard)                                       |
| Íconos clima  | `app-weather-icon` component existente (Meteocons SVG)                                   |
| Tipografía    | DM Serif Display (hero temp), Plus Jakarta Sans (body), JetBrains Mono (datos numéricos) |

### Dependencias ya instaladas (NO instalar nada nuevo)

```json
"gsap": "^3.15.0",
"@angular/material": "^19.2.19",
"@angular/cdk": "^19.2.19",
"@phosphor-icons/web": "^2.1.2",
"three": "^0.184.0"
```

---

## Paleta de colores — Design tokens existentes

```scss
// Usar EXACTAMENTE estos tokens de :root en styles.scss
--color-bg-primary: #0d1b2a; // Fondo principal navy
--color-bg-card: #1b3a5c; // Fondo card (no usar, usar glass)
--color-accent: #3a86ff; // Azul accent principal
--color-info: #48cae4; // Cyan info (lluvia, humedad)
--color-sun: #ffd166; // Amarillo (sol, UV bajo)
--color-text-primary: #ffffff; // Texto principal
--color-text-secondary: #8baec8; // Texto secundario
--color-danger: #ef4444; // Rojo (UV extremo, alertas)
--color-success: #10b981; // Verde (AQI buena, UV bajo)

// Colores UV específicos para esta pantalla:
// 0–2:  #10B981 (verde, Bajo)
// 3–5:  #FFD166 (amarillo, Moderado)
// 6–7:  #F97316 (naranja, Alto)
// 8–10: #EF4444 (rojo, Muy alto)
// 11+:  #7C3AED (violeta, Extremo)
```

---

## Tipografía

```scss
// Hero temperature
.font-display {
  font-family: "DM Serif Display", serif;
}

// Body text, labels, section titles
.font-body {
  font-family: "Plus Jakarta Sans", sans-serif;
}

// Datos numéricos, valores, horas
.font-mono {
  font-family: "JetBrains Mono", monospace;
}
```

---

## Filosofía de diseño — NO NEGOCIABLE

### Principios UX/UI que DEBEN cumplirse

1. **Ley de proximidad (Gestalt):** Agrupar datos relacionados. Temperatura + lluvia + UV van juntos en Tab 1. AQI + rosa de vientos + luna van en Tab 3.
2. **Ley de jerarquía visual:** La temperatura actual es el dato más grande de la pantalla (DM Serif Display, 72-96px). Todo lo demás es secundario.
3. **Principio de glanceability:** El usuario debe entender el clima actual en < 2 segundos al abrir la pantalla. Los detalles profundos requieren scroll o cambio de tab.
4. **Ley de Fitts:** Los botones (back, share) deben tener área de toque mínima de 44×44px.
5. **Principio de revelación progresiva:** Tab 1 (Hoy) muestra lo esencial. Tab 2 y 3 revelan datos avanzados para usuarios curiosos.
6. **Microdetalles que gritan "esto lo diseñó un humano":** Separadores con gradiente fade-out, badges con borde sutil, hover states que respiran, bordes superiores con reflejo de luz (inset shadow).

### Anti-patrones a EVITAR

- ❌ Cards con background sólido — usar SIEMPRE `glass-card`
- ❌ Íconos genéricos de Material Design — usar SVGs inline custom
- ❌ Texto plano sin jerarquía — usar labels uppercase + valores grandes + sublabels
- ❌ Gráficas con ejes gruesos y labels grandes — usar ejes sutiles, líneas finas, tooltips on-demand
- ❌ Secciones sin separación visual — usar section-title con acento azul vertical
- ❌ Animaciones sin cleanup — SIEMPRE `gsap.context().revert()` en `ngOnDestroy`

---

## Fondo — Reusar orbes del Dashboard

La pantalla debe tener el MISMO fondo con orbes de profundidad que el dashboard para que el glassmorphism funcione:

```html
<div class="dashboard-bg" aria-hidden="true">
  <div class="dashboard-bg__orb dashboard-bg__orb--1"></div>
  <div class="dashboard-bg__orb dashboard-bg__orb--2"></div>
  <div class="dashboard-bg__orb dashboard-bg__orb--3"></div>
</div>
```

Los estilos ya están en `styles.scss` (líneas 233–277). NO duplicarlos.

---

## Estructura de la pantalla

### Layout general

```
┌──────────────────────────────────────────────┐
│  ← Back     Buenos Aires, AR     🔗 Share    │  ← HEADER FIJO
│             18° ☁ Parcialmente nublado       │
├──────────────────────────────────────────────┤
│  [ Hoy ]  [ Esta semana ]  [ Detalle ]       │  ← TABS sticky
├──────────────────────────────────────────────┤
│                                              │
│  ┌─ Tab 1: Hoy ─────────────────────────┐   │
│  │  📈 Gráfica temperatura 24hs (SVG)   │   │
│  │  🌧️ Probabilidad lluvia por hora     │   │
│  │  ☀️ Índice UV por hora               │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌─ Tab 2: Esta semana ─────────────────┐   │
│  │  📅 Pronóstico 7 días expandido      │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌─ Tab 3: Detalle ─────────────────────┐   │
│  │  🌬️ Rosa de los vientos              │   │
│  │  💨 AQI detallado + contaminantes    │   │
│  │  🌅 Arco solar amanecer/ocaso        │   │
│  │  🌙 Fase lunar                       │   │
│  │  📊 Presión, punto de rocío, visib.  │   │
│  └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

---

## HEADER — Especificación completa

```html
<header class="detail-header">
  <button class="detail-header__back" (click)="onGoBack()" aria-label="Volver al dashboard">
    <!-- SVG chevron izquierdo inline -->
  </button>

  <div class="detail-header__center">
    <h1 class="detail-header__city font-body">{{ weather.cityName }}, {{ weather.country }}</h1>
    <div class="detail-header__summary">
      <span class="detail-header__temp font-display">{{ weather.temp }}°</span>
      <app-weather-icon [condition]="weather.condition" [size]="28" [decorative]="true" />
      <span class="condition-pill">{{ weather.conditionLabel }}</span>
    </div>
  </div>

  <button class="detail-header__share" (click)="onShare()" aria-label="Compartir clima">
    <!-- SVG share icon inline -->
  </button>
</header>
```

**Estilos del header:**

- Fondo: `background: rgba(13, 27, 42, 0.85); backdrop-filter: blur(16px);`
- Position sticky, top: 0, z-index: 20
- Padding: `1rem var(--spacing-container)`
- Ciudad: 16px, font-weight 600, color primary
- Temp en el header: 20px, DM Serif Display, al lado del ícono pequeño
- Pill de condición: mismo estilo que dashboard `.condition-pill`
- Botones back/share: 44×44px mínimo, border-radius 12px, glass background on hover

---

## TAB 1 — HOY

### 1. Gráfica de temperatura horaria (24hs) — SVG con GSAP draw animation

Esta es la pieza central de la pantalla. Debe verse como las gráficas de apps premium tipo Apple Weather o Weathergraph.

**Especificación visual:**

- SVG inline, viewBox adaptativo al contenedor
- Línea: `stroke: var(--color-accent)`, stroke-width: 2.5, stroke-linecap: round, stroke-linejoin: round
- Curva suave usando `<path>` con curvas Bézier cúbicas (calcular control points para smooth interpolation)
- Área bajo la curva: `<path>` con fill gradiente de `rgba(58, 134, 255, 0.25)` arriba a `rgba(58, 134, 255, 0)` abajo usando `<linearGradient>`
- Puntos en cada hora: circles de r=3, fill accent, con hover/tap que muestra tooltip
- Hora actual: circle r=5 con `stroke: white`, `stroke-width: 2` + línea vertical punteada `stroke-dasharray: 4,4`
- Eje X: horas cada 3hs (00, 03, 06, ... 21), font-size 10px, color text-secondary
- Eje Y: implícito (no mostrar eje, usar líneas guía horizontales sutiles `rgba(255,255,255,0.04)`)
- Padding interno del SVG: 40px left, 20px right, 30px top, 24px bottom

**Animación GSAP — Draw effect:**

```typescript
private animateTemperatureLine(): void {
  const path = this.tempLinePath?.nativeElement as SVGPathElement;
  if (!path) return;

  const length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  gsap.to(path, {
    strokeDashoffset: 0,
    duration: 1.4,
    ease: 'power2.inOut',
    delay: 0.2,
  });

  // Fade in del área bajo la curva
  const area = this.tempAreaPath?.nativeElement;
  if (area) {
    gsap.from(area, { opacity: 0, duration: 0.8, delay: 0.6, ease: 'power2.out' });
  }

  // Stagger de los puntos
  gsap.from('.temp-dot', {
    scale: 0, opacity: 0, duration: 0.3, ease: 'back.out(2)', stagger: 0.03, delay: 0.8
  });
}
```

**Tooltip al hover/tap en un punto:**

- Glass card pequeña flotante
- Muestra: hora, temperatura, sensación térmica, condición
- Posicionada encima del punto, centrada horizontalmente

### 2. Probabilidad de lluvia por hora

Debajo de la gráfica de temperatura (en el mismo tab, con scroll):

- Barras verticales para cada hora
- Color: `var(--color-info)` (#48CAE4)
- Altura proporcional al % (0–100%)
- Solo mostrar barras si `precipChance > 0`
- Horas en eje X alineadas con la gráfica de temperatura
- Contenedor glass-card con section-title "Probabilidad de lluvia"
- Animación: barras crecen desde abajo con stagger

### 3. Índice UV por hora

- Barras horizontales o verticales con color según nivel (usar los 5 colores del PRD)
- Cada barra tiene label de hora + valor numérico
- Contenedor glass-card con section-title "Índice UV"

---

## TAB 2 — ESTA SEMANA

### Pronóstico 7 días expandido

Versión más detallada que la del dashboard. Cada fila incluye:

```
┌────────────────────────────────────────────────────┐
│  Lun   1 May   ☁   64%💧   Min 11°  ████  Max 17° │
│                     💨 22 km/h SE                   │
└────────────────────────────────────────────────────┘
```

- Día + fecha
- Ícono Meteocons (32px)
- Probabilidad de lluvia
- Barra de temperatura min/max (misma que dashboard pero más ancha)
- Fila secundaria: viento promedio + dirección
- Cada fila es una glass-card individual con hover effect
- Animación: stagger entrada de filas

---

## TAB 3 — DETALLE

### 1. Rosa de los vientos — SVG circular

**Especificación:**

- SVG circular, 200×200px
- 8 direcciones principales (N, NE, E, SE, S, SW, W, NW)
- Labels de dirección en font-body, 10px, color text-secondary
- La dirección activa del viento resaltada con `var(--color-accent)` y un triángulo/wedge más brillante
- Centro: velocidad del viento en font-mono, 20px
- Círculos concéntricos sutiles como guía (opacity 0.06)
- Contenedor glass-card con section-title "Viento"

### 2. AQI detallado — Contaminantes individuales

```
┌──────────────────────────────────────┐
│  AQI General: 2 — Buena 🟢          │
│                                      │
│  PM2.5    12 µg/m³   ████████░░░░░  │
│  PM10     28 µg/m³   █████████░░░░  │
│  O₃       45 µg/m³   ██████░░░░░░░  │
│  NO₂      18 µg/m³   ████░░░░░░░░░  │
└──────────────────────────────────────┘
```

- AQI general grande con color semafórico y label
- 4 contaminantes en mini-cards o rows
- Cada uno: nombre, valor numérico + unidad, barra de progreso proporcional a su límite seguro
- Barras con color que varía según qué tan cerca están del límite (verde → amarillo → rojo)
- Contenedor glass-card con section-title "Calidad del aire"

### 3. Arco solar — Amanecer/Ocaso con posición del sol

**Especificación SVG:**

- Arco semicircular SVG
- Degradado de `var(--color-sun)` (#FFD166) a naranja (#F97316)
- Punto del sol posicionado en el arco según la hora actual (calcular proporción entre sunrise y sunset)
- Si es de noche: el punto está en los extremos, arco en color muted
- Labels: hora amanecer (izquierda), hora atardecer (derecha)
- Línea de horizonte horizontal debajo del arco
- Animación GSAP: el arco se dibuja de izquierda a derecha al entrar al tab
- Contenedor glass-card con section-title "Sol"

### 4. Fase lunar

- SVG del disco lunar, 80×80px
- Porción iluminada calculada según `moonPhase` (0–1)
- Sombra con gradiente para simular la curvatura
- Label: nombre de la fase (ej: "Cuarto creciente")
- Porcentaje de iluminación debajo
- Colores: disco `#e2e8f0`, sombra `rgba(13, 27, 42, 0.95)`
- Contenedor glass-card con section-title "Luna"

### 5. Datos adicionales — grid de mini-cards

En desktop (≥1200px) este tab usa 2 columnas. Las mini-cards son:

- **Presión:** valor en hPa + tendencia (↑↓→)
- **Punto de rocío:** valor en °C
- **Visibilidad:** valor en km + indicador visual (reusar del dashboard)

---

## MODELOS DE DATOS MOCK — `mock-detail.data.ts`

Crear en `src/app/pages/detail/mock-detail.data.ts`:

```typescript
export interface HourlyDetail {
  hour: string; // '00:00' a '23:00'
  temp: number;
  feelsLike: number;
  precipChance: number; // 0-100
  precipMm: number;
  windSpeed: number;
  windDeg: number; // 0-360
  uvIndex: number;
  humidity: number;
  condition: string;
}

export interface AirQualityDetail {
  aqi: number; // 1-5
  aqiLabel: string;
  pm25: number; // µg/m³
  pm10: number;
  o3: number;
  no2: number;
}

export interface SunMoon {
  sunrise: string; // '07:29'
  sunset: string; // '18:09'
  moonPhase: number; // 0-1 (0=nueva, 0.5=llena)
  moonPhaseName: string;
  moonIllumination: number; // 0-100
}

export interface DetailWeather {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionLabel: string;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  dewPoint: number;
  hourly: HourlyDetail[]; // 24 items
  daily: DailyForecast[]; // 7 items — importar tipo del dashboard
  airQuality: AirQualityDetail;
  sunMoon: SunMoon;
}
```

**Generar datos mock realistas para Buenos Aires** con 24 horas completas, 7 días, contaminantes verosímiles (PM2.5 ~15, PM10 ~28, O3 ~45, NO2 ~18), fase lunar cuarto creciente, amanecer 07:29, atardecer 18:09.

---

## ANIMACIONES GSAP — Especificación completa

### Al entrar a la pantalla

```typescript
// Stagger de todas las secciones
gsap.from(".detail-section", {
  opacity: 0,
  y: 20,
  duration: 0.5,
  ease: "power3.out",
  stagger: 0.08,
});
```

### Al cambiar de tab — RE-TRIGGER obligatorio

Cada vez que el usuario cambia de tab (`mat-tab-group` `selectedTabChange` event), re-ejecutar las animaciones de las secciones visibles en ese tab. Esto incluye:

- Draw de líneas SVG (temperatura, viento)
- Crecimiento de barras (lluvia, UV, AQI contaminantes)
- Dibujo del arco solar
- Stagger de cards/rows

### Guard de reduced motion — OBLIGATORIO

```typescript
private readonly prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Wrap TODAS las animaciones:
if (!this.prefersReducedMotion) {
  this.animateTemperatureLine();
}
```

### Cleanup — OBLIGATORIO

```typescript
private ctx!: gsap.Context;

ngOnDestroy(): void {
  this.ctx?.revert();
}
```

---

## Web Share API — Botón compartir

```typescript
async onShare(): Promise<void> {
  const w = this.weather;
  if (navigator.share) {
    await navigator.share({
      title: `Clima en ${w.cityName}`,
      text: `${w.temp}°C, ${w.conditionLabel}. Sensación: ${w.feelsLike}°C`,
      url: window.location.href,
    });
  } else {
    await navigator.clipboard.writeText(window.location.href);
    this.snackBar.open('Enlace copiado al portapapeles', '', { duration: 2500 });
  }
}
```

---

## ACCESIBILIDAD — WCAG AA

- `role="main"` en contenedor principal
- SVGs de gráficas: `role="img"` con `aria-label` descriptivo
- Tabs: Angular Material ya maneja roles ARIA
- Back: `aria-label="Volver al dashboard"`
- Share: `aria-label="Compartir clima de {{ cityName }}"`
- Contraste mínimo 4.5:1 contra fondo de card
- Todas las animaciones GSAP en guard `prefers-reduced-motion`
- Focus visible: `outline: 2px solid var(--color-accent)` (ya global)

---

## RESPONSIVE — 3 breakpoints

### Mobile (< 640px)

- Stack vertical completo
- Gráficas a ancho completo
- Tabs sticky debajo del header
- Header compacto: temp más pequeña
- Mini-cards de Tab 3: 1 columna
- Rosa de vientos: centrada, 180px

### Tablet (640px – 1199px)

- Gráficas más anchas con más breathing room
- Tab 3: algunas secciones en 2 columnas (AQI + Rosa de vientos lado a lado)
- Header más espacioso

### Desktop (≥ 1200px)

- `max-width: 800px` centrado (igual que dashboard)
- Tab 3: layout de 2 columnas
- Rosa de vientos 220px
- Hover states en todas las cards y rows

---

## PATRÓN ANGULAR 19 A SEGUIR

```typescript
@Component({
  selector: "app-detail",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTabsModule, MatButtonModule, MatSnackBarModule, WeatherIconComponent],
  templateUrl: "./detail.page.html",
  styleUrls: ["./detail.page.scss"],
})
export class DetailPage implements OnInit, AfterViewInit, OnDestroy {
  // Signals para estado
  protected readonly weather = signal<DetailWeather>({ ...MOCK_DETAIL });
  protected readonly activeTab = signal(0);

  // GSAP context
  private ctx!: gsap.Context;

  ngOnDestroy(): void {
    this.ctx?.revert();
  }
}
```

---

## TABS DE ANGULAR MATERIAL — Estilos custom premium

Los tabs default de Material NO se ven premium. Customizar:

```scss
// Override de mat-tab-group
.detail-tabs {
  .mdc-tab {
    font-family: "Plus Jakarta Sans", sans-serif !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    letter-spacing: 0.04em !important;
    text-transform: uppercase !important;
    color: var(--color-text-secondary) !important;
    min-width: 0 !important;
    padding: 0 16px !important;
  }

  .mdc-tab--active {
    color: var(--color-text-primary) !important;
  }

  .mdc-tab-indicator__content--underline {
    border-color: var(--color-accent) !important;
    border-width: 2.5px !important;
    border-radius: 2px !important;
  }

  .mat-mdc-tab-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
}
```

---

## RUTA — Agregar al router

En `app.routes.ts` agregar:

```typescript
{
  path: 'detail',
  loadComponent: () => import('./pages/detail/detail.page').then(m => m.DetailPage)
}
```

---

## ARCHIVOS A CREAR

```
src/app/pages/detail/
├── detail.page.ts         // Component principal
├── detail.page.html       // Template
├── detail.page.scss       // Estilos (componente-specific, NO duplicar globales)
└── mock-detail.data.ts    // Interfaces + datos mock Buenos Aires
```

---

## LO QUE NO INCLUYE ESTA PANTALLA

- ❌ Sin navbar / bottom nav (se implementa por separado)
- ❌ Sin llamadas reales a API (todo datos mock)
- ❌ Sin integración con Supabase
- ❌ Sin funcionalidad de favoritos (el botón puede existir pero sin lógica)
- ❌ Sin routing con parámetro dinámico (hardcoded Buenos Aires por ahora)

---

## RESULTADO ESPERADO — Checklist de calidad

Al finalizar, la pantalla DEBE cumplir:

- [ ] Header sticky con back, ciudad, temp, share
- [ ] 3 tabs (Hoy, Esta semana, Detalle) con estilos premium
- [ ] Gráfica SVG de temperatura 24hs con draw animation GSAP
- [ ] Área bajo la curva con gradiente semitransparente
- [ ] Hora actual marcada con punto destacado + línea vertical punteada
- [ ] Tooltip al tap/hover en puntos de la gráfica
- [ ] Barras de lluvia por hora con animación
- [ ] Barras/línea UV por hora con colores semafóricos
- [ ] Pronóstico 7 días expandido con viento por día
- [ ] Rosa de los vientos SVG funcional
- [ ] AQI con barras de contaminantes individuales
- [ ] Arco solar SVG con posición del sol
- [ ] Fase lunar SVG con iluminación correcta
- [ ] Mini-cards de presión, punto de rocío, visibilidad
- [ ] Web Share API + fallback clipboard
- [ ] Glassmorphism en TODAS las cards (fondo con orbes)
- [ ] Animaciones re-triggereadas al cambiar de tab
- [ ] `prefers-reduced-motion` respetado
- [ ] GSAP cleanup con `context().revert()`
- [ ] Responsive en 3 breakpoints
- [ ] Accesibilidad WCAG AA
- [ ] Aspecto profesional, premium, como si lo hubiera diseñado un equipo UI/UX humano

---

_ATMOS PRD v1.0 — Pantalla 04: Detalle del Clima. Componente: `src/app/pages/detail/`_
