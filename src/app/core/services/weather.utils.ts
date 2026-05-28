import { WeatherCondition } from '../../features/dashboard/mock-weather.data';

export function weatherCodeToCondition(code: number, isDay: number = 1): WeatherCondition {
  if (code === 0) return isDay ? 'sunny' : 'clear-night';
  if (code >= 1 && code <= 3) return 'partly-cloudy';
  if (code >= 45 && code <= 48) return 'foggy';
  if (code >= 51 && code <= 57) return 'drizzle';
  if (code >= 61 && code <= 65) return 'rainy';
  if (code >= 71 && code <= 77) return 'snowy';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 95 && code <= 99) return 'stormy';
  return 'cloudy';
}

export function weatherCodeToLabel(code: number): string {
  if (code === 0) return 'Despejado';
  if (code === 1) return 'Mayormente despejado';
  if (code === 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if (code >= 45 && code <= 48) return 'Niebla';
  if (code === 51 || code === 53) return 'Llovizna ligera';
  if (code === 55) return 'Llovizna';
  if (code === 56 || code === 57) return 'Llovizna helada';
  if (code === 61) return 'Lluvia ligera';
  if (code === 63) return 'Lluvia';
  if (code === 65) return 'Lluvia fuerte';
  if (code === 66 || code === 67) return 'Lluvia helada';
  if (code === 71) return 'Nieve ligera';
  if (code === 73) return 'Nieve';
  if (code === 75) return 'Nieve fuerte';
  if (code === 77) return 'Granizo';
  if (code === 80) return 'Lluvia ligera';
  if (code === 81) return 'Lluvia moderada';
  if (code === 82) return 'Lluvia violenta';
  if (code === 85 || code === 86) return 'Nieve';
  if (code === 95) return 'Tormenta';
  if (code >= 96 && code <= 99) return 'Tormenta severa';
  return 'Nublado';
}

export function degreesToCardinal(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

export function extractHour(isoString: string): string {
  return isoString.slice(11, 16);
}

export function formatDayName(isoString: string, index: number): string {
  const date = new Date(isoString);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isToday) return 'Hoy';

  return new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(date);
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(date);
}

export function formatHour(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
}
