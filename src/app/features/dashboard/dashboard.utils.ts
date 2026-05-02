import { CurrentWeather, DailyForecast, HourlyForecast } from './mock-weather.data';

type DashboardSignalTone = {
  color: string;
  label: string;
};

type DashboardSignalPalette = {
  background: string;
} & DashboardSignalTone;

const AQI_PALETTE: DashboardSignalPalette[] = [
  { label: 'Buena', color: '#10B981', background: 'rgba(16, 185, 129, 0.14)' },
  { label: 'Moderada', color: '#FFD166', background: 'rgba(255, 209, 102, 0.14)' },
  { label: 'Regular', color: '#F97316', background: 'rgba(249, 115, 22, 0.14)' },
  { label: 'Mala', color: '#EF4444', background: 'rgba(239, 68, 68, 0.14)' },
  { label: 'Muy mala', color: '#7C3AED', background: 'rgba(124, 58, 237, 0.14)' }
];

const UV_PALETTE: Array<DashboardSignalTone & { max: number }> = [
  { label: 'Bajo', color: '#10B981', max: 2 },
  { label: 'Moderado', color: '#FFD166', max: 5 },
  { label: 'Alto', color: '#F59E0B', max: 7 },
  { label: 'Muy alto', color: '#F97316', max: 10 },
  { label: 'Extremo', color: '#EF4444', max: Number.POSITIVE_INFINITY }
];

export function getAqiAppearance(aqi: number): DashboardSignalPalette {
  return AQI_PALETTE[clampValue(aqi, 1, AQI_PALETTE.length) - 1] ?? AQI_PALETTE[0];
}

export function getUvAppearance(uvIndex: number): DashboardSignalTone {
  return UV_PALETTE.find(({ max }) => uvIndex <= max) ?? UV_PALETTE[UV_PALETTE.length - 1];
}

export function getTempRange(days: DailyForecast[]): { max: number; min: number } {
  const values = days.flatMap((day) => [day.tempMin, day.tempMax]);

  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

export function getRefreshedWeatherSnapshot(
  current: CurrentWeather,
  hourlyForecast: HourlyForecast[],
  now: Date
): { current: CurrentWeather; hourlyForecast: HourlyForecast[] } {
  const tempDelta = current.temp >= 20 ? -1 : 1;

  return {
    current: {
      ...current,
      temp: clampValue(current.temp + tempDelta, 7, 33),
      feelsLike: clampValue(current.feelsLike + tempDelta, 6, 35),
      humidity: clampValue(current.humidity - 2, 42, 92),
      windSpeed: clampValue(current.windSpeed + 1, 4, 40),
      pressure: clampValue(current.pressure - 1, 995, 1035),
      lastUpdated: now
    },
    hourlyForecast: hourlyForecast.map((item, index) => ({
      ...item,
      temp: index < 8 ? clampValue(item.temp + tempDelta, 6, 34) : item.temp
    }))
  };
}

export function clampValue(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
