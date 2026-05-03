import { ChangeDetectionStrategy, Component } from '@angular/core';

interface DetailSection {
  title: string;
  description: string;
}

@Component({
  selector: 'app-detail-tab',
  standalone: true,
  templateUrl: './detail-tab.component.html',
  styleUrl: './detail-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailTabComponent {
  protected readonly sections: DetailSection[] = [
    {
      title: 'Hourly Chart',
      description: 'Placeholder ready for the hourly temperature and condition visualization.'
    },
    {
      title: 'Rain Chart',
      description: 'Space reserved for precipitation intensity and probability trends.'
    },
    {
      title: 'Wind',
      description: 'Container for wind direction, gusts and speed details.'
    },
    {
      title: 'UV Index',
      description: 'Placeholder for UV risk information and exposure guidance.'
    },
    {
      title: 'Air Quality',
      description: 'Area prepared for AQI metrics and pollutant breakdown.'
    },
    {
      title: 'Sun Timeline',
      description: 'Reserved for sunrise, sunset and daylight progression details.'
    },
    {
      title: 'Extra Info',
      description: 'Flexible section for additional weather insights and metadata.'
    }
  ];
}
