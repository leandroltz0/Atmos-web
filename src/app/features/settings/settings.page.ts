import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { APP_ROUTE_PATHS } from '../../core/routing/app-route-paths';

type TempUnit = 'celsius' | 'fahrenheit';
type WindUnit = 'kmh' | 'mph' | 'ms';
type ThemeMode = 'dark' | 'light';
type Language = 'es' | 'en';
type TimeFormat = '12h' | '24h';
type UpdateInterval = 10 | 30 | 60;

type SettingsGroup = {
  id: string;
  label: string;
  icon: string;
  items: SettingsItem[];
};

type SettingsItem = {
  id: string;
  label: string;
  description: string;
} & (
  | { type: 'toggle'; value: boolean }
  | { type: 'select'; value: string; options: { value: string; label: string }[] }
  | { type: 'action'; actionLabel: string }
);

const STORAGE_KEY = 'atmos.settings';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSlideToggleModule],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPage implements OnInit {
  protected readonly tempUnit = signal<TempUnit>('celsius');
  protected readonly windUnit = signal<WindUnit>('kmh');
  protected readonly themeMode = signal<ThemeMode>('dark');
  protected readonly language = signal<Language>('es');
  protected readonly timeFormat = signal<TimeFormat>('24h');
  protected readonly updateInterval = signal<UpdateInterval>(10);

  protected readonly pushNotifications = signal(true);
  protected readonly autoUpdate = signal(true);
  protected readonly offlineMode = signal(false);

  protected readonly cachedCities = signal(5);
  protected readonly lastSyncLabel = signal('Hace 3 minutos');
  protected readonly appVersion = signal('1.0.0-beta');

  protected readonly groups = signal<SettingsGroup[]>([]);

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.restoreSettings();
    this.buildGroups();
  }

  protected onGoBack(): void {
    void this.router.navigate([`/${APP_ROUTE_PATHS.favorites}`]);
  }

  protected onToggleChanged(groupId: string, itemId: string, checked: boolean): void {
    switch (itemId) {
      case 'push-notifications':
        this.pushNotifications.set(checked);
        break;
      case 'auto-update':
        this.autoUpdate.set(checked);
        break;
      case 'offline-mode':
        this.offlineMode.set(checked);
        break;
    }
    this.persistSettings();
    this.buildGroups();
  }

  protected onSelectChanged(groupId: string, itemId: string, value: string): void {
    switch (itemId) {
      case 'temp-unit':
        this.tempUnit.set(value as TempUnit);
        break;
      case 'wind-unit':
        this.windUnit.set(value as WindUnit);
        break;
      case 'theme':
        this.themeMode.set(value as ThemeMode);
        break;
      case 'language':
        this.language.set(value as Language);
        break;
      case 'time-format':
        this.timeFormat.set(value as TimeFormat);
        break;
      case 'update-interval':
        this.updateInterval.set(Number(value) as UpdateInterval);
        break;
    }
    this.persistSettings();
    this.buildGroups();
  }

  protected onActionTriggered(groupId: string, itemId: string): void {
    switch (itemId) {
      case 'force-sync':
        // Mock: just update the label
        this.lastSyncLabel.set('Ahora mismo');
        this.buildGroups();
        break;
      case 'clear-cache':
        this.cachedCities.set(0);
        this.buildGroups();
        break;
    }
  }

  protected trackByGroup(_index: number, group: SettingsGroup): string {
    return group.id;
  }

  protected trackByItem(_index: number, item: SettingsItem): string {
    return item.id;
  }

  protected isToggle(item: SettingsItem): item is SettingsItem & { type: 'toggle'; value: boolean } {
    return item.type === 'toggle';
  }

  protected isSelect(item: SettingsItem): item is SettingsItem & { type: 'select'; value: string; options: { value: string; label: string }[] } {
    return item.type === 'select';
  }

  protected isAction(item: SettingsItem): item is SettingsItem & { type: 'action'; actionLabel: string } {
    return item.type === 'action';
  }

  private buildGroups(): void {
    this.groups.set([
      {
        id: 'units',
        label: 'Unidades',
        icon: 'ruler',
        items: [
          {
            id: 'temp-unit',
            type: 'select',
            label: 'Temperatura',
            description: 'Unidad de medida para temperatura',
            value: this.tempUnit(),
            options: [
              { value: 'celsius', label: 'Celsius (°C)' },
              { value: 'fahrenheit', label: 'Fahrenheit (°F)' }
            ]
          },
          {
            id: 'wind-unit',
            type: 'select',
            label: 'Velocidad del viento',
            description: 'Unidad de medida para el viento',
            value: this.windUnit(),
            options: [
              { value: 'kmh', label: 'km/h' },
              { value: 'mph', label: 'mph' },
              { value: 'ms', label: 'm/s' }
            ]
          },
          {
            id: 'time-format',
            type: 'select',
            label: 'Formato de hora',
            description: 'Formato para mostrar las horas',
            value: this.timeFormat(),
            options: [
              { value: '24h', label: '24 horas' },
              { value: '12h', label: '12 horas' }
            ]
          }
        ]
      },
      {
        id: 'appearance',
        label: 'Apariencia',
        icon: 'palette',
        items: [
          {
            id: 'theme',
            type: 'select',
            label: 'Tema',
            description: 'Aspecto visual de la aplicación',
            value: this.themeMode(),
            options: [
              { value: 'dark', label: 'Oscuro' },
              { value: 'light', label: 'Claro' }
            ]
          },
          {
            id: 'language',
            type: 'select',
            label: 'Idioma',
            description: 'Idioma de la interfaz',
            value: this.language(),
            options: [
              { value: 'es', label: 'Español' },
              { value: 'en', label: 'English' }
            ]
          }
        ]
      },
      {
        id: 'notifications',
        label: 'Notificaciones',
        icon: 'bell',
        items: [
          {
            id: 'push-notifications',
            type: 'toggle',
            label: 'Notificaciones push',
            description: 'Recibir alertas meteorológicas en tu dispositivo',
            value: this.pushNotifications()
          },
          {
            id: 'auto-update',
            type: 'toggle',
            label: 'Actualización automática',
            description: 'Refrescar datos del clima periódicamente',
            value: this.autoUpdate()
          },
          {
            id: 'update-interval',
            type: 'select',
            label: 'Frecuencia de actualización',
            description: 'Intervalo entre cada actualización automática',
            value: String(this.updateInterval()),
            options: [
              { value: '10', label: 'Cada 10 minutos' },
              { value: '30', label: 'Cada 30 minutos' },
              { value: '60', label: 'Cada 1 hora' }
            ]
          }
        ]
      },
      {
        id: 'data',
        label: 'Datos y sincronización',
        icon: 'cloud',
        items: [
          {
            id: 'offline-mode',
            type: 'toggle',
            label: 'Modo offline',
            description: `${this.cachedCities()} ciudades en caché local`,
            value: this.offlineMode()
          },
          {
            id: 'force-sync',
            type: 'action',
            label: 'Forzar sincronización',
            description: `Última sincronización: ${this.lastSyncLabel()}`,
            actionLabel: 'Sincronizar'
          },
          {
            id: 'clear-cache',
            type: 'action',
            label: 'Limpiar caché',
            description: 'Eliminar todos los datos almacenados localmente',
            actionLabel: 'Limpiar'
          }
        ]
      }
    ]);
  }

  private persistSettings(): void {
    if (typeof window === 'undefined') return;

    const data = {
      tempUnit: this.tempUnit(),
      windUnit: this.windUnit(),
      themeMode: this.themeMode(),
      language: this.language(),
      timeFormat: this.timeFormat(),
      updateInterval: this.updateInterval(),
      pushNotifications: this.pushNotifications(),
      autoUpdate: this.autoUpdate(),
      offlineMode: this.offlineMode()
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private restoreSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const data = JSON.parse(raw);
      if (data.tempUnit) this.tempUnit.set(data.tempUnit);
      if (data.windUnit) this.windUnit.set(data.windUnit);
      if (data.themeMode) this.themeMode.set(data.themeMode);
      if (data.language) this.language.set(data.language);
      if (data.timeFormat) this.timeFormat.set(data.timeFormat);
      if (data.updateInterval) this.updateInterval.set(data.updateInterval);
      if (data.pushNotifications !== undefined) this.pushNotifications.set(data.pushNotifications);
      if (data.autoUpdate !== undefined) this.autoUpdate.set(data.autoUpdate);
      if (data.offlineMode !== undefined) this.offlineMode.set(data.offlineMode);
    } catch {
      // Ignore malformed storage
    }
  }
}
