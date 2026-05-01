# WeatherApp Dashboard — Redesign Prompt v2

**Para:** Codex  
**Tarea:** Rediseño completo del Dashboard (Pantalla 02) — refinar el resultado actual para que se vea premium, humano y profesional  
**Base:** El componente ya existe en `src/app/features/dashboard/`. Este prompt es una iteración de mejora visual profunda, NO una reescritura desde cero de la lógica.

---

## El problema con el resultado actual

El dashboard funciona pero se ve "generado por IA". Los problemas específicos a resolver:

1. **Íconos climáticos** — los actuales parecen clip art. Son planos, sin profundidad, sin cohesión con el resto del diseño dark.
2. **Glassmorphism inexistente** — las cards se ven como rectángulos planos de color sólido. El efecto glass no existe porque falta el fondo con profundidad (orbes/blobs).
3. **Temperatura hero sin personalidad** — el número flota solo sin contexto visual ni atmósfera.
4. **Cards secundarias genéricas** — AQI, UV, Amanecer, Visibilidad tienen espaciado y jerarquía tipográfica de template, no de producto diseñado.
5. **Sin microdetalles** — no hay nada que diga "esto lo pensó un diseñador": ni badges, ni pills, ni separadores sutiles, ni estados de hover que se sientan vivos.
6. **Layout de la hero card** — el ícono arriba centrado y la temperatura abajo centrada se ve básico. Las referencias que el cliente envía muestran el ícono grande al lado de la temperatura, creando una composición más dinámica y moderna.

---

## Inspiración visual de referencia

Las dos imágenes de referencia que el cliente proporcionó muestran:

- **Íconos 3D estilo iOS** con profundidad, sombra suave y sensación de volumen — sol con brillo, nubes con gradiente, lluvia con gotas dimensionales. Son el elemento más memorable visualmente.
- **Temperatura hero junto al ícono** — no apilados verticalmente, sino lado a lado. El ícono ocupa tanto espacio como la temperatura. Esto crea peso visual equilibrado y se siente como una app real de clima premium.
- **Cards de datos** con layout interno más respirado — ícono arriba a la izquierda como acento de color, número grande en el centro, label chico abajo. Asimétrico e intencional.
- **Pronóstico horario** con íconos pequeños de la misma familia 3D, consistentes con el hero.
- **Fondo** con gradiente suave de azul claro a blanco en las refs de día — en nuestro caso mantener el navy oscuro pero con orbes de profundidad que activen el glassmorphism.

> **Importante:** Mantener la paleta de colores navy del PRD (`#0D1B2A`, `#1B3A5C`, `#3A86FF`, etc.), la tipografía definida (DM Serif Display + Plus Jakarta Sans + JetBrains Mono) y la estructura UI existente. Este es un refinamiento visual, no un cambio de identidad.

---

## Nueva librería de íconos — Instalación requerida

### Instalar `@phosphor-icons/web` + íconos SVG climáticos custom

```bash
npm install @phosphor-icons/web
```

Para los **íconos de condición climática** (sol, nube, lluvia, etc.) usar el set **[Meteocons](https://bas.dev/work/meteocons)** de Bas Milius — son SVGs animados open source, diseñados específicamente para apps de clima, con estética moderna y cohesiva.

**Descarga e integración:**

```bash
# Copiar los SVGs de Meteocons a:
src/assets/icons/weather/
```

Los archivos necesarios (en formato animado SVG):

```
sun.svg                  → condición: sunny
moon.svg                 → condición: clear-night
partly-cloudy-day.svg    → condición: partly-cloudy
cloudy.svg               → condición: cloudy
overcast.svg             → condición: overcast
drizzle.svg              → condición: drizzle
rain.svg                 → condición: rainy
thunderstorms-rain.svg   → condición: stormy
snow.svg                 → condición: snowy
fog.svg                  → condición: foggy
```

**Componente wrapper para íconos climáticos:**

Crear `src/app/shared/components/weather-icon/weather-icon.component.ts`:

```typescript
@Component({
  selector: "app-weather-icon",
  standalone: true,
  template: ` <img [src]="iconPath()" [alt]="condition() + ' weather icon'" [style.width.px]="size()" [style.height.px]="size()" class="weather-icon" /> `,
  styles: [
    `
      .weather-icon {
        display: block;
        object-fit: contain;
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
      }
    `,
  ],
})
export class WeatherIconComponent {
  condition = input.required<string>();
  size = input<number>(64);

  private readonly iconMap: Record<string, string> = {
    sunny: "sun",
    "clear-night": "moon",
    "partly-cloudy": "partly-cloudy-day",
    cloudy: "cloudy",
    overcast: "overcast",
    rainy: "rain",
    drizzle: "drizzle",
    stormy: "thunderstorms-rain",
    snowy: "snow",
    foggy: "fog",
  };

  iconPath = computed(() => {
    const icon = this.iconMap[this.condition()] ?? "cloudy";
    return `/assets/icons/weather/${icon}.svg`;
  });
}
```

---

## Rediseño del fondo — Orbes de profundidad (OBLIGATORIO para glassmorphism)

Sin esto el glassmorphism es imposible. Reemplazar el fondo actual con:

```scss
// En dashboard.component.scss
.dashboard-bg {
  position: fixed;
  inset: 0;
  background: var(--color-bg-primary); // #0D1B2A
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  &__orb {
    position: absolute;
    border-radius: 50%;

    &--1 {
      width: 70vw;
      height: 70vw;
      max-width: 500px;
      max-height: 500px;
      background: radial-gradient(circle, rgba(58, 134, 255, 0.18) 0%, transparent 70%);
      top: -15%;
      right: -15%;
      filter: blur(60px);
    }

    &--2 {
      width: 60vw;
      height: 60vw;
      max-width: 420px;
      max-height: 420px;
      background: radial-gradient(circle, rgba(72, 202, 228, 0.12) 0%, transparent 70%);
      bottom: 20%;
      left: -10%;
      filter: blur(80px);
    }

    &--3 {
      width: 40vw;
      height: 40vw;
      max-width: 300px;
      max-height: 300px;
      background: radial-gradient(circle, rgba(27, 58, 92, 0.8) 0%, transparent 70%);
      top: 45%;
      right: 5%;
      filter: blur(50px);
    }
  }
}
```

```html
<!-- Primer elemento del template, fuera del scroll -->
<div class="dashboard-bg" aria-hidden="true">
  <div class="dashboard-bg__orb dashboard-bg__orb--1"></div>
  <div class="dashboard-bg__orb dashboard-bg__orb--2"></div>
  <div class="dashboard-bg__orb dashboard-bg__orb--3"></div>
</div>
```

---

## Glassmorphism correcto — Reemplazar todas las cards

Reemplazar el estilo actual de cards por:

```scss
// Eliminar cualquier background sólido en las cards. Reemplazar por:
.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.06); // highlight superior sutil

  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
}
```

> El `inset 0 1px 0 rgba(255,255,255,0.06)` es el detalle que hace que la card se vea como vidrio — simula el reflejo de luz en el borde superior. Es el truco que separa el glassmorphism real del glassmorphism de template.

---

## Rediseño de la Hero Card

### Layout objetivo

```
┌─────────────────────────────────────────────────────┐
│  [PILL: "Parcialmente nublado"]              ↻ btn  │
│                                                     │
│   [ÍCONO 3D]        19°                            │
│   (120×120px)    [DM Serif, 96px]                  │
│                  Sensación: 18°C                    │
│                                                     │
│ ─────────────────────────────────────────────────  │
│  💧 66%     💨 17 km/h ↗SE     ⊕ 1015 hPa         │
└─────────────────────────────────────────────────────┘
```

```html
<div class="hero-card glass-card">
  <!-- Top row: badge de condición + botón refresh -->
  <div class="hero-card__top">
    <span class="condition-pill">
      <app-weather-icon [condition]="currentWeather().condition" [size]="16" />
      {{ currentWeather().conditionLabel }}
    </span>
    <button mat-icon-button (click)="onRefresh()" class="refresh-btn" [class.spinning]="isLoading()" matTooltip="Actualizar" aria-label="Actualizar datos del clima">
      <mat-icon>refresh</mat-icon>
    </button>
  </div>

  <!-- Centro: ícono grande + temperatura -->
  <div class="hero-card__main">
    <app-weather-icon [condition]="currentWeather().condition" [size]="isMobile() ? 96 : 120" aria-hidden="true" />
    <div class="hero-temp-block">
      <div class="hero-temp-row">
        <span #heroTemp class="hero-temp font-display" aria-label="{{ currentWeather().temp }} grados celsius"> {{ currentWeather().temp }} </span>
        <span class="hero-temp-unit font-display">°</span>
      </div>
      <p class="feels-like">Sensación <span class="font-mono">{{ currentWeather().feelsLike }}°C</span></p>
    </div>
  </div>

  <!-- Divider -->
  <div class="hero-card__divider" aria-hidden="true"></div>

  <!-- Bottom row: datos rápidos -->
  <div class="hero-card__stats" role="list" aria-label="Datos meteorológicos actuales">
    <div class="quick-stat" role="listitem">
      <span class="quick-stat__icon" aria-hidden="true">💧</span>
      <span class="quick-stat__value font-mono">{{ currentWeather().humidity }}%</span>
      <span class="quick-stat__label">Humedad</span>
    </div>
    <div class="quick-stat__separator" aria-hidden="true"></div>
    <div class="quick-stat" role="listitem">
      <span class="quick-stat__icon" aria-hidden="true">💨</span>
      <span class="quick-stat__value font-mono">{{ currentWeather().windSpeed }} km/h</span>
      <div class="wind-direction" aria-hidden="true">
        <!-- Flecha SVG rotada según windDegrees -->
        <svg width="12" height="12" viewBox="0 0 12 12" [style.transform]="'rotate(' + currentWeather().windDegrees + 'deg)'">
          <path d="M6 1L10 9H6V11H6L2 9L6 1Z" fill="currentColor" opacity="0.8" />
        </svg>
        <span>{{ currentWeather().windDirection }}</span>
      </div>
    </div>
    <div class="quick-stat__separator" aria-hidden="true"></div>
    <div class="quick-stat" role="listitem">
      <span class="quick-stat__icon" aria-hidden="true">🌡️</span>
      <span class="quick-stat__value font-mono">{{ currentWeather().pressure }} hPa</span>
      <span class="quick-stat__label">Presión</span>
    </div>
  </div>
</div>
```

**CSS de la hero card:**

```scss
.hero-card {
  padding: 1.25rem 1.5rem 1.5rem;

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  &__main {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  &__divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08) 20%, rgba(255, 255, 255, 0.08) 80%, transparent);
    margin-bottom: 1.25rem;
  }

  &__stats {
    display: flex;
    align-items: center;
    justify-content: space-around;
  }
}

.condition-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: rgba(58, 134, 255, 0.15);
  border: 1px solid rgba(58, 134, 255, 0.25);
  border-radius: 100px;
  font-size: 12px;
  font-family: "Plus Jakarta Sans", sans-serif;
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
}

.hero-temp-row {
  display: flex;
  align-items: flex-start;
  line-height: 1;
}

.hero-temp {
  font-size: clamp(72px, 14vw, 104px);
  line-height: 1;
  letter-spacing: -3px;
  color: var(--color-text-primary);
}

.hero-temp-unit {
  font-size: clamp(36px, 6vw, 48px);
  padding-top: 6px;
  color: var(--color-text-secondary);
  letter-spacing: 0;
}

.feels-like {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;

  .font-mono {
    color: var(--color-text-primary);
  }
}

.quick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;

  &__icon {
    font-size: 18px;
    line-height: 1;
  }

  &__value {
    font-size: 15px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  &__label {
    font-size: 11px;
    color: var(--color-text-secondary);
    font-family: "Plus Jakarta Sans", sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  &__separator {
    width: 1px;
    height: 32px;
    background: rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }
}

.wind-direction {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-family: "Plus Jakarta Sans", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.refresh-btn {
  color: var(--color-text-secondary) !important;
  &.spinning mat-icon {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .refresh-btn.spinning mat-icon {
    animation: none;
  }
}
```

---

## Rediseño de las 4 data cards

Layout interno rediseñado — asimétrico e intencional:

```html
<!-- AQI Card -->
<div class="data-card glass-card" #weatherCard aria-label="Calidad del aire: AQI {{ currentWeather().aqi }}, {{ currentWeather().aqiLabel }}">
  <div class="data-card__header">
    <div class="data-card__icon-wrap" [style.background]="aqiBg()">
      <!-- Phosphor icon: wind -->
      <i class="ph-bold ph-wind" [style.color]="aqiColor()" style="font-size: 16px;"></i>
    </div>
    <span class="data-card__title">Calidad del aire</span>
  </div>
  <div class="data-card__body">
    <span class="data-card__value font-mono" [style.color]="aqiColor()">{{ currentWeather().aqi }}</span>
    <span class="data-card__sublabel">{{ currentWeather().aqiLabel }}</span>
  </div>
  <div class="aqi-bar" aria-hidden="true">
    @for (i of [1,2,3,4,5]; track i) {
    <div class="aqi-bar__segment" [class.active]="i <= currentWeather().aqi" [style.background]="i <= currentWeather().aqi ? aqiColor() : 'rgba(255,255,255,0.08)'"></div>
    }
  </div>
</div>

<!-- UV Card -->
<div class="data-card glass-card" #weatherCard aria-label="Índice UV: {{ currentWeather().uvIndex }}, {{ uvLabel() }}">
  <div class="data-card__header">
    <div class="data-card__icon-wrap" style="background: rgba(255, 209, 102, 0.12)">
      <i class="ph-bold ph-sun" style="color: var(--color-sun); font-size: 16px;"></i>
    </div>
    <span class="data-card__title">Índice UV</span>
  </div>
  <div class="data-card__body">
    <span class="data-card__value font-mono" style="color: var(--color-sun)">{{ currentWeather().uvIndex }}</span>
    <span class="data-card__sublabel" [style.color]="uvColor()">{{ uvLabel() }}</span>
  </div>
  <!-- Mini barra UV de 0 a 11+ -->
  <div class="uv-bar" aria-hidden="true">
    <div class="uv-bar__fill" [style.width.%]="(currentWeather().uvIndex / 11) * 100"></div>
  </div>
</div>

<!-- Amanecer / Atardecer Card -->
<div class="data-card glass-card data-card--sun" #weatherCard aria-label="Amanecer {{ currentWeather().sunrise }}, Atardecer {{ currentWeather().sunset }}">
  <div class="sun-times">
    <div class="sun-time">
      <div class="data-card__icon-wrap" style="background: rgba(255, 209, 102, 0.12)">
        <i class="ph-bold ph-sunrise" style="color: var(--color-sun); font-size: 16px;"></i>
      </div>
      <div>
        <span class="sun-time__value font-mono">{{ currentWeather().sunrise }}</span>
        <span class="sun-time__label">Amanecer</span>
      </div>
    </div>
    <div class="sun-divider" aria-hidden="true"></div>
    <div class="sun-time">
      <div class="data-card__icon-wrap" style="background: rgba(249, 115, 22, 0.12)">
        <i class="ph-bold ph-sunset" style="color: #F97316; font-size: 16px;"></i>
      </div>
      <div>
        <span class="sun-time__value font-mono">{{ currentWeather().sunset }}</span>
        <span class="sun-time__label">Atardecer</span>
      </div>
    </div>
  </div>
</div>

<!-- Visibilidad Card -->
<div class="data-card glass-card" #weatherCard aria-label="Visibilidad: {{ currentWeather().visibility }} kilómetros">
  <div class="data-card__header">
    <div class="data-card__icon-wrap" style="background: rgba(72, 202, 228, 0.12)">
      <i class="ph-bold ph-eye" style="color: var(--color-info); font-size: 16px;"></i>
    </div>
    <span class="data-card__title">Visibilidad</span>
  </div>
  <div class="data-card__body">
    <span class="data-card__value font-mono" style="color: var(--color-info)">{{ currentWeather().visibility }}</span>
    <span class="data-card__sublabel">kilómetros</span>
  </div>
  <!-- Indicador visual de visibilidad (arco de 3 segmentos) -->
  <div class="visibility-dots" aria-hidden="true">
    @for (i of [1,2,3]; track i) {
    <div class="visibility-dot" [class.active]="currentWeather().visibility >= (i * 4)" [style.opacity]="currentWeather().visibility >= (i * 4) ? 1 : 0.15"></div>
    }
  </div>
</div>
```

**CSS de las data cards:**

```scss
.data-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.data-card {
  padding: 1.1rem 1.1rem 1rem;
  cursor: default;

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 0.75rem;
  }

  &__icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__title {
    font-size: 11px;
    font-family: "Plus Jakarta Sans", sans-serif;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 500;
  }

  &__body {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 0.6rem;
  }

  &__value {
    font-size: 28px;
    font-weight: 500;
    line-height: 1;
  }

  &__sublabel {
    font-size: 12px;
    font-family: "Plus Jakarta Sans", sans-serif;
    color: var(--color-text-secondary);
  }
}

// AQI bar
.aqi-bar {
  display: flex;
  gap: 3px;
  margin-top: auto;

  &__segment {
    flex: 1;
    height: 3px;
    border-radius: 2px;
    transition: background 0.3s ease;
  }
}

// UV bar
.uv-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
  margin-top: auto;

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, var(--color-sun), #ef4444);
    border-radius: 2px;
    transition: width 0.6s ease;
  }
}

// Amanecer/Atardecer
.data-card--sun {
  padding: 1rem 1.1rem;
}

.sun-times {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.sun-time {
  display: flex;
  align-items: center;
  gap: 10px;

  &__value {
    display: block;
    font-size: 17px;
    font-weight: 500;
    color: var(--color-text-primary);
    line-height: 1.2;
  }

  &__label {
    display: block;
    font-size: 10px;
    color: var(--color-text-secondary);
    font-family: "Plus Jakarta Sans", sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
}

.sun-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

// Visibilidad dots
.visibility-dots {
  display: flex;
  gap: 4px;
  margin-top: auto;
}

.visibility-dot {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: var(--color-info);
  transition: opacity 0.3s ease;
}
```

---

## Rediseño del pronóstico horario

```scss
.hourly-scroll {
  // Ocultar scrollbar en todos los navegadores pero mantener funcionalidad
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.hourly-item {
  width: 72px;
  flex-shrink: 0;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &.active {
    background: rgba(58, 134, 255, 0.18) !important;
    border-color: rgba(58, 134, 255, 0.35) !important;
  }

  .hourly-hour {
    font-size: 11px;
    color: var(--color-text-secondary);
    font-family: "Plus Jakarta Sans", sans-serif;
    font-weight: 500;
  }

  .hourly-temp {
    font-size: 16px;
    color: var(--color-text-primary);
    font-family: "JetBrains Mono", monospace;
    font-weight: 500;
  }

  .hourly-precip {
    font-size: 10px;
    color: var(--color-info);
    font-family: "JetBrains Mono", monospace;
  }
}
```

El item de la hora actual debe tener la clase `active`. Añadir lógica en el componente:

```typescript
isCurrentHour(hourStr: string): boolean {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0') + ':00';
  return hourStr === currentHour;
}
```

---

## Rediseño del pronóstico de 7 días

```scss
.daily-row {
  display: flex;
  align-items: center;
  padding: 0.875rem 1.25rem;
  gap: 12px;
  cursor: pointer;
  border-radius: 14px;

  &:not(:last-child) {
    margin-bottom: 4px;
  }

  .daily-day {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
    font-family: "Plus Jakarta Sans", sans-serif;
    width: 36px;
    flex-shrink: 0;
  }

  .daily-date {
    font-size: 12px;
    color: var(--color-text-secondary);
    font-family: "Plus Jakarta Sans", sans-serif;
    width: 44px;
    flex-shrink: 0;
  }

  // Ícono en el centro
  app-weather-icon {
    flex-shrink: 0;
  }

  .daily-precip {
    font-size: 11px;
    color: var(--color-info);
    font-family: "JetBrains Mono", monospace;
    min-width: 32px;
    text-align: right;
  }

  // Barra de temperatura — toma el espacio restante
  .temp-range {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    margin-left: auto;

    .temp-min {
      font-size: 13px;
      color: var(--color-text-secondary);
    }
    .temp-max {
      font-size: 13px;
      color: var(--color-text-primary);
      font-weight: 500;
    }
  }

  .temp-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;

    &__fill {
      height: 100%;
      border-radius: 2px;
      background: linear-gradient(90deg, #48cae4, #3a86ff);
      transition: width 0.6s ease;
    }
  }
}
```

---

## Detalles finales de calidad — Los que marcan la diferencia

### 1. Live dot en "Actualizado hace X min"

```html
<div class="update-status">
  <span class="live-dot" aria-hidden="true"></span>
  <span class="font-mono update-text">Actualizado hace {{ minutesAgo() }} min</span>
</div>
```

```scss
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  display: inline-block;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.update-text {
  font-size: 11px;
  color: var(--color-text-secondary);
}

@media (prefers-reduced-motion: reduce) {
  .live-dot {
    animation: none;
  }
}
```

### 2. Section titles con acento de color

```html
<h2 class="section-title">
  <span class="section-title__accent" aria-hidden="true"></span>
  Próximas 24 horas
</h2>
```

```scss
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;

  &__accent {
    width: 3px;
    height: 14px;
    background: var(--color-accent);
    border-radius: 2px;
  }
}
```

### 3. Nombre de la ciudad con ícono de pin

```html
<h1 class="city-name">
  <i class="ph-bold ph-map-pin" style="font-size: 16px; color: var(--color-accent);"></i>
  {{ currentWeather().cityName }}, {{ currentWeather().country }}
</h1>
```

```scss
.city-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}
```

### 4. Padding bottom para el futuro bottom nav

```scss
.dashboard-scroll-container {
  padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
}
```

### 5. Focus visible para accesibilidad (no usar outline default del browser)

```scss
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
  border-radius: 6px;
}
```

---

## Responsive final — Breakpoints

### Mobile (< 640px) — prioridad máxima

```scss
.hero-card__main {
  // Ícono 96px + temperatura juntos, centrados
  justify-content: center;
}

.hero-temp {
  font-size: clamp(72px, 18vw, 96px);
}

.data-row {
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
```

### Tablet (640px – 1199px)

```scss
@media (min-width: 640px) {
  .hero-card__main {
    justify-content: flex-start;
  }
  .data-row {
    grid-template-columns: repeat(4, 1fr);
  }
  .hero-temp {
    font-size: clamp(80px, 12vw, 104px);
  }
}
```

### Desktop (≥ 1200px)

```scss
@media (min-width: 1200px) {
  .dashboard-container {
    max-width: 800px;
  } // App de clima — no necesita ancho full
  .hero-card {
    padding: 2rem 2.5rem 1.75rem;
  }
  .data-card {
    padding: 1.25rem 1.25rem 1.1rem;
  }
}
```

---

## GSAP — Animaciones a mantener y mejorar

Las animaciones del prompt anterior son correctas. Asegurarse de que:

1. El **counter de temperatura** funcione con el nuevo markup (el número y el `°` están en elementos separados — animar solo el número).
2. El stagger de cards incluya también las `.data-card` y `.daily-row`.
3. Limpiar con `gsap.context().revert()` en `ngOnDestroy`.

```typescript
private initAnimations(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  this.ctx = gsap.context(() => {
    // Counter temperatura
    const tempEl = this.heroTempEl()?.nativeElement;
    if (tempEl) {
      const target = this.currentWeather().temp;
      gsap.fromTo({ val: 0 }, { val: target },
        {
          duration: 1.1,
          ease: 'power2.out',
          onUpdate() { tempEl.textContent = Math.round(this.targets()[0].val).toString(); }
        }
      );
    }

    // Stagger de todas las cards
    gsap.from('.glass-card', {
      opacity: 0,
      y: 24,
      scale: 0.98,
      duration: 0.5,
      ease: 'power3.out',
      stagger: 0.07,
      delay: 0.05,
    });
  });
}
```

---

## Resultado esperado

Al terminar este rediseño, el dashboard debe:

- ✅ Íconos climáticos con profundidad y estética moderna (Meteocons SVG)
- ✅ Glassmorphism real — cards translúcidas con fondo navy profundo con orbes
- ✅ Hero card con ícono y temperatura lado a lado, condition pill arriba, stats con separadores abajo
- ✅ 4 data cards con layout interno intencional: icon-wrap coloreado, valor grande, barra indicadora
- ✅ Flecha SVG animada para dirección del viento
- ✅ Live dot pulsante en "Actualizado hace X min"
- ✅ Section titles con acento azul vertical
- ✅ Hora actual highlighted en el scroll horario
- ✅ Scrollbar oculta en el scroll horizontal (pero funcional)
- ✅ Phosphor Icons para los íconos de UI (viento, sol, ojo, amanecer, atardecer, pin)
- ✅ Focus visible personalizado con color accent
- ✅ Responsive correcto en mobile, tablet y desktop
- ✅ `prefers-reduced-motion` respetado en todas las animaciones
- ✅ GSAP cleanup con `context().revert()` en `ngOnDestroy`

---

## Dependencias nuevas a instalar

```bash
npm install @phosphor-icons/web
```

Importar en `angular.json` → `styles`:

```json
"node_modules/@phosphor-icons/web/src/bold/style.css"
```

Meteocons SVGs: descargar desde https://bas.dev/work/meteocons y copiar los archivos `.svg` animados a `src/assets/icons/weather/`.

---

_WeatherApp PRD v1.0 — Fase 2 rediseño visual. Componente: `src/app/features/dashboard/`_
