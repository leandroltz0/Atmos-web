import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface HourlyChartDatum {
  hour: string;
  temp: number;
}

@Component({
  selector: 'app-hourly-chart',
  standalone: true,
  templateUrl: './hourly-chart.component.html',
  styleUrl: './hourly-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HourlyChartComponent {
  private minTemp = 0;
  private maxTemp = 0;
  protected chartData: HourlyChartDatum[] = [];
  protected hasData = false;

  @Input()
  set hourlyData(value: HourlyChartDatum[]) {
    this.chartData = value.slice(0, 24);
    this.hasData = this.chartData.length > 0;

    if (!this.hasData) {
      this.minTemp = 0;
      this.maxTemp = 0;
      return;
    }

    const temps = this.chartData.map((item) => item.temp);
    this.maxTemp = Math.max(...temps);
    this.minTemp = Math.min(...temps);
  }

  protected getBarHeight(temp: number): number {
    if (!this.hasData) {
      return 0;
    }

    if (this.maxTemp === this.minTemp) {
      return 58;
    }

    const normalizedHeight = (temp - this.minTemp) / (this.maxTemp - this.minTemp);
    return Math.round(28 + normalizedHeight * 72);
  }
}
