import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import gsap from 'gsap';

import { SectionCardComponent } from '../section-card';

type TemperatureDatum = {
  hour: string;
  temp: number;
};

type TemperaturePoint = TemperatureDatum & {
  x: number;
  y: number;
};

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const SVG_HEIGHT = 160;
const PAD_X = 24;
const PAD_Y = 28;

const TEMPERATURE_DATA: readonly TemperatureDatum[] = [
  { hour: '6am', temp: 18 },
  { hour: '7am', temp: 19 },
  { hour: '8am', temp: 21 },
  { hour: '9am', temp: 23 },
  { hour: '10am', temp: 25 },
  { hour: '11am', temp: 26 },
  { hour: '12pm', temp: 27 },
  { hour: '1pm', temp: 27 },
  { hour: '2pm', temp: 26 },
  { hour: '3pm', temp: 25 },
  { hour: '4pm', temp: 24 },
  { hour: '5pm', temp: 22 },
  { hour: '6pm', temp: 20 },
  { hour: '7pm', temp: 19 },
  { hour: '8pm', temp: 18 }
];

@Component({
  selector: 'app-temperature-chart',
  standalone: true,
  imports: [SectionCardComponent],
  templateUrl: './temperature-chart.component.html',
  styleUrl: './temperature-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemperatureChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true })
  private readonly container!: ElementRef<HTMLDivElement>;

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    this.renderChart();
    this.bindResizeObserver();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    gsap.killTweensOf(this.container.nativeElement.querySelectorAll('*'));
  }

  private bindResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => this.renderChart());
    this.resizeObserver.observe(this.container.nativeElement);
  }

  private renderChart(): void {
    const container = this.container.nativeElement;
    const W = container.offsetWidth;
    const H = SVG_HEIGHT;
    const padX = PAD_X;
    const padY = PAD_Y;

    if (W <= 0) {
      return;
    }

    const temps = TEMPERATURE_DATA.map((datum) => datum.temp);
    const minT = Math.min(...temps) - 2;
    const maxT = Math.max(...temps) + 2;

    const points: TemperaturePoint[] = TEMPERATURE_DATA.map((datum, index) => ({
      ...datum,
      x: padX + (index / (TEMPERATURE_DATA.length - 1)) * (W - padX * 2),
      y: padY + (1 - (datum.temp - minT) / (maxT - minT)) * (H - padY * 2)
    }));

    const svg = this.createSvgElement('svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '160');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const defs = this.createSvgElement('defs');
    const gradient = this.createSvgElement('linearGradient');
    gradient.setAttribute('id', 'tg');
    gradient.setAttribute('x1', '0');
    gradient.setAttribute('y1', '0');
    gradient.setAttribute('x2', '0');
    gradient.setAttribute('y2', '1');

    const topStop = this.createSvgElement('stop');
    topStop.setAttribute('offset', '0%');
    topStop.setAttribute('stop-color', '#38BDF8');
    topStop.setAttribute('stop-opacity', '0.3');

    const bottomStop = this.createSvgElement('stop');
    bottomStop.setAttribute('offset', '100%');
    bottomStop.setAttribute('stop-color', '#38BDF8');
    bottomStop.setAttribute('stop-opacity', '0');

    gradient.appendChild(topStop);
    gradient.appendChild(bottomStop);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    const linePath = points.map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    }).join(' ');

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    const area = this.createSvgElement('path');
    area.setAttribute('d', `${linePath} L ${lastPoint.x} ${H} L ${firstPoint.x} ${H} Z`);
    area.setAttribute('fill', 'url(#tg)');
    svg.appendChild(area);

    const line = this.createSvgElement('path');
    line.setAttribute('d', linePath);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#38BDF8');
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(line);

    for (const point of points) {
      const circle = this.createSvgElement('circle');
      circle.setAttribute('cx', `${point.x}`);
      circle.setAttribute('cy', `${point.y}`);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#38BDF8');
      svg.appendChild(circle);
    }

    for (const point of points) {
      const tempLabel = this.createSvgElement('text');
      tempLabel.setAttribute('x', `${point.x}`);
      tempLabel.setAttribute('y', `${point.y - 10}`);
      tempLabel.setAttribute('text-anchor', 'middle');
      tempLabel.setAttribute('fill', '#F0F9FF');
      tempLabel.setAttribute('font-size', '10');
      tempLabel.setAttribute('font-family', 'JetBrains Mono');
      tempLabel.setAttribute('font-weight', '700');
      tempLabel.textContent = `${point.temp}°`;
      svg.appendChild(tempLabel);
    }

    for (const point of points) {
      const hourLabel = this.createSvgElement('text');
      hourLabel.setAttribute('x', `${point.x}`);
      hourLabel.setAttribute('y', `${H - 4}`);
      hourLabel.setAttribute('text-anchor', 'middle');
      hourLabel.setAttribute('fill', '#8BAEC8');
      hourLabel.setAttribute('font-size', '9');
      hourLabel.setAttribute('font-family', 'Plus Jakarta Sans');
      hourLabel.textContent = point.hour;
      svg.appendChild(hourLabel);
    }

    container.replaceChildren();
    container.appendChild(svg);

    const length = line.getTotalLength();
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = String(length);
    area.style.opacity = '0';

    gsap.to(line, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' });
    gsap.to(area, { opacity: 1, duration: 0.8, delay: 0.4 });
  }

  private createSvgElement<K extends keyof SVGElementTagNameMap>(
    tagName: K
  ): SVGElementTagNameMap[K] {
    return document.createElementNS(SVG_NAMESPACE, tagName) as SVGElementTagNameMap[K];
  }
}
