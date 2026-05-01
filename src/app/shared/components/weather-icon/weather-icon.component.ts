import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-weather-icon',
  standalone: true,
  template: `
    <span
      class="weather-icon"
      [attr.role]="decorative() ? null : 'img'"
      [attr.aria-label]="decorative() ? null : altText()"
      [attr.aria-hidden]="decorative() ? 'true' : null"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [innerHTML]="svgMarkup()"
    ></span>
  `,
  styles: `
    .weather-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.28));
    }

    .weather-icon :is(svg) {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherIconComponent {
  readonly condition = input.required<string>();
  readonly size = input<number>(64);
  readonly decorative = input(false);

  protected readonly svgMarkup = computed(() => this.resolveSvg(this.condition()));
  protected readonly altText = computed(() => `${this.condition()} weather icon`);

  private resolveSvg(condition: string): string {
    switch (condition) {
      case 'sunny':
        return this.sunSvg();
      case 'clear-night':
        return this.moonSvg();
      case 'partly-cloudy':
        return this.partlyCloudySvg();
      case 'rainy':
        return this.rainSvg();
      case 'drizzle':
        return this.drizzleSvg();
      case 'stormy':
        return this.stormSvg();
      case 'snowy':
        return this.snowSvg();
      case 'foggy':
        return this.fogSvg();
      case 'overcast':
        return this.overcastSvg();
      case 'cloudy':
      default:
        return this.cloudSvg();
    }
  }

  private sunSvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="12" fill="#FFD166"/>
        <g stroke="#FFD166" stroke-width="4" stroke-linecap="round">
          <path d="M32 8V16"/>
          <path d="M32 48V56"/>
          <path d="M8 32H16"/>
          <path d="M48 32H56"/>
          <path d="M15.03 15.03L20.69 20.69"/>
          <path d="M43.31 43.31L48.97 48.97"/>
          <path d="M48.97 15.03L43.31 20.69"/>
          <path d="M20.69 43.31L15.03 48.97"/>
        </g>
      </svg>
    `;
  }

  private moonSvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M40.5 11.5C31.2 13.1 24 21.2 24 31C24 42 33 51 44 51C48.4 51 52.4 49.6 55.7 47.2C52.8 52.7 47 56.5 40.3 56.5C30.1 56.5 21.8 48.2 21.8 38C21.8 27.8 30.1 19.5 40.3 19.5C42.4 19.5 44.4 19.8 46.3 20.5C44.7 17.4 42.7 14.6 40.5 11.5Z"
          fill="#B8C5FF"
        />
      </svg>
    `;
  }

  private cloudSvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M21 47H46C52.0751 47 57 42.0751 57 36C57 30.6387 53.1624 26.1737 48.0804 25.2081C46.0805 18.5938 39.9454 14 32.8 14C24.4662 14 17.584 20.2442 16.5785 28.3061C11.6679 29.4294 8 33.8235 8 39C8 43.4183 11.5817 47 16 47H21Z"
          fill="#D7E5F5"
        />
      </svg>
    `;
  }

  private overcastSvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 48H46C51.5228 48 56 43.5228 56 38C56 32.9408 52.2412 28.7554 47.3619 28.0878C45.5976 21.8817 39.8882 17.5 33 17.5C24.9543 17.5 18.3149 23.4061 17.1671 31.1288C12.4207 32.1478 9 36.3538 9 41.3C9 45.5526 12.4474 49 16.7 49H20Z"
          fill="#B8C4D6"
        />
        <path
          d="M23 29.5H43"
          stroke="#8EA0B7"
          stroke-width="3.2"
          stroke-linecap="round"
        />
      </svg>
    `;
  }

  private partlyCloudySvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="10" fill="#FFD166"/>
        <g stroke="#FFD166" stroke-width="3" stroke-linecap="round">
          <path d="M24 8V12"/>
          <path d="M24 36V40"/>
          <path d="M8 24H12"/>
          <path d="M36 24H40"/>
          <path d="M13.5 13.5L16.4 16.4"/>
          <path d="M31.6 31.6L34.5 34.5"/>
          <path d="M34.5 13.5L31.6 16.4"/>
          <path d="M16.4 31.6L13.5 34.5"/>
        </g>
        <path
          d="M26 48H47C52.5228 48 57 43.5228 57 38C57 32.9408 53.2412 28.7554 48.3619 28.0878C46.5976 21.8817 40.8882 17.5 34 17.5C26.4772 17.5 20.1725 22.6632 18.4248 29.6339C14.1136 30.9987 11 34.9967 11 39.7C11 44.284 14.716 48 19.3 48H26Z"
          fill="#D7E5F5"
        />
      </svg>
    `;
  }

  private rainSvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 40H46C51.5228 40 56 35.5228 56 30C56 24.9408 52.2412 20.7554 47.3619 20.0878C45.5976 13.8817 39.8882 9.5 33 9.5C24.9543 9.5 18.3149 15.4061 17.1671 23.1288C12.4207 24.1478 9 28.3538 9 33.3C9 37.5526 12.4474 41 16.7 41H20Z"
          fill="#D7E5F5"
        />
        <g stroke="#4CC9F0" stroke-width="3.5" stroke-linecap="round">
          <path d="M22 46L19 54"/>
          <path d="M32 46L29 54"/>
          <path d="M42 46L39 54"/>
        </g>
      </svg>
    `;
  }

  private drizzleSvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 41H46C51.5228 41 56 36.5228 56 31C56 25.9408 52.2412 21.7554 47.3619 21.0878C45.5976 14.8817 39.8882 10.5 33 10.5C24.9543 10.5 18.3149 16.4061 17.1671 24.1288C12.4207 25.1478 9 29.3538 9 34.3C9 38.5526 12.4474 42 16.7 42H20Z"
          fill="#D7E5F5"
        />
        <g fill="#71D4FF">
          <circle cx="22" cy="49" r="2.2"/>
          <circle cx="32" cy="52" r="2.2"/>
          <circle cx="42" cy="49" r="2.2"/>
        </g>
      </svg>
    `;
  }

  private stormSvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 39H46C51.5228 39 56 34.5228 56 29C56 23.9408 52.2412 19.7554 47.3619 19.0878C45.5976 12.8817 39.8882 8.5 33 8.5C24.9543 8.5 18.3149 14.4061 17.1671 22.1288C12.4207 23.1478 9 27.3538 9 32.3C9 36.5526 12.4474 40 16.7 40H20Z"
          fill="#C8D4E8"
        />
        <path d="M33 42L27 53H34L31 60L42 47H35L39 42H33Z" fill="#FFD166"/>
      </svg>
    `;
  }

  private snowSvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 40H46C51.5228 40 56 35.5228 56 30C56 24.9408 52.2412 20.7554 47.3619 20.0878C45.5976 13.8817 39.8882 9.5 33 9.5C24.9543 9.5 18.3149 15.4061 17.1671 23.1288C12.4207 24.1478 9 28.3538 9 33.3C9 37.5526 12.4474 41 16.7 41H20Z"
          fill="#DDE7F5"
        />
        <g stroke="#E9F6FF" stroke-width="2.6" stroke-linecap="round">
          <path d="M22 46V54"/>
          <path d="M18 50H26"/>
          <path d="M19.3 47.3L24.7 52.7"/>
          <path d="M24.7 47.3L19.3 52.7"/>
          <path d="M42 46V54"/>
          <path d="M38 50H46"/>
          <path d="M39.3 47.3L44.7 52.7"/>
          <path d="M44.7 47.3L39.3 52.7"/>
        </g>
      </svg>
    `;
  }

  private fogSvg(): string {
    return `
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M19 33H45C50.5228 33 55 28.5228 55 23C55 17.9408 51.2412 13.7554 46.3619 13.0878C44.5976 6.88168 38.8882 2.5 32 2.5C23.9543 2.5 17.3149 8.40605 16.1671 16.1288C11.4207 17.1478 8 21.3538 8 26.3C8 30.5526 11.4474 34 15.7 34H19Z"
          fill="#DDE6F2"
        />
        <g stroke="#A8B7C8" stroke-width="3.2" stroke-linecap="round">
          <path d="M15 42H49"/>
          <path d="M10 49H43"/>
          <path d="M20 56H54"/>
        </g>
      </svg>
    `;
  }
}
