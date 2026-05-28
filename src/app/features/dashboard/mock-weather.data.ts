export type WeatherCondition =
  | 'sunny'
  | 'clear-night'
  | 'cloudy'
  | 'overcast'
  | 'drizzle'
  | 'rainy'
  | 'stormy'
  | 'snowy'
  | 'partly-cloudy'
  | 'foggy';

export interface CurrentWeather {
  cityName: string;
  country: string;
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  conditionLabel: string;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  windDegrees: number;
  pressure: number;
  aqi: number;
  aqiLabel: string;
  sunrise: string;
  sunset: string;
  visibility: number;
  uvIndex: number;
  lastUpdated: Date;
}

export interface HourlyForecast {
  hour: string;
  temp: number;
  condition: WeatherCondition;
  precipChance: number;
  isNow?: boolean;
}

export interface DailyForecast {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  condition: WeatherCondition;
  precipChance: number;
}

export const MOCK_CURRENT: CurrentWeather = {
  cityName: 'Buenos Aires',
  country: 'AR',
  temp: 18,
  feelsLike: 17,
  condition: 'partly-cloudy',
  conditionLabel: 'Parcialmente nublado',
  humidity: 68,
  windSpeed: 16,
  windDirection: 'SE',
  windDegrees: 135,
  pressure: 1016,
  aqi: 1,
  aqiLabel: 'Buena',
  sunrise: '07:29',
  sunset: '18:09',
  visibility: 12,
  uvIndex: 4,
  lastUpdated: new Date(Date.now() - 4 * 60 * 1000)
};

export const MOCK_HOURLY: HourlyForecast[] = [
  { hour: '00:00', temp: 15, condition: 'cloudy', precipChance: 10 },
  { hour: '01:00', temp: 15, condition: 'cloudy', precipChance: 10 },
  { hour: '02:00', temp: 14, condition: 'cloudy', precipChance: 14 },
  { hour: '03:00', temp: 14, condition: 'rainy', precipChance: 32 },
  { hour: '04:00', temp: 13, condition: 'rainy', precipChance: 46 },
  { hour: '05:00', temp: 13, condition: 'rainy', precipChance: 52 },
  { hour: '06:00', temp: 12, condition: 'rainy', precipChance: 58 },
  { hour: '07:00', temp: 12, condition: 'cloudy', precipChance: 35 },
  { hour: '08:00', temp: 13, condition: 'partly-cloudy', precipChance: 18 },
  { hour: '09:00', temp: 14, condition: 'partly-cloudy', precipChance: 12 },
  { hour: '10:00', temp: 15, condition: 'partly-cloudy', precipChance: 8 },
  { hour: '11:00', temp: 16, condition: 'partly-cloudy', precipChance: 6 },
  { hour: '12:00', temp: 17, condition: 'sunny', precipChance: 4 },
  { hour: '13:00', temp: 18, condition: 'sunny', precipChance: 4 },
  { hour: '14:00', temp: 18, condition: 'partly-cloudy', precipChance: 6 },
  { hour: '15:00', temp: 19, condition: 'partly-cloudy', precipChance: 8 },
  { hour: '16:00', temp: 19, condition: 'partly-cloudy', precipChance: 10 },
  { hour: '17:00', temp: 18, condition: 'cloudy', precipChance: 16 },
  { hour: '18:00', temp: 17, condition: 'cloudy', precipChance: 22 },
  { hour: '19:00', temp: 16, condition: 'cloudy', precipChance: 18 },
  { hour: '20:00', temp: 16, condition: 'partly-cloudy', precipChance: 12 },
  { hour: '21:00', temp: 15, condition: 'partly-cloudy', precipChance: 10 },
  { hour: '22:00', temp: 15, condition: 'cloudy', precipChance: 12 },
  { hour: '23:00', temp: 15, condition: 'cloudy', precipChance: 12 }
];

export const MOCK_DAILY: DailyForecast[] = [
  { day: 'Hoy', date: '30 Abr', tempMax: 19, tempMin: 12, condition: 'partly-cloudy', precipChance: 18 },
  { day: 'Jue', date: '1 May', tempMax: 21, tempMin: 13, condition: 'sunny', precipChance: 6 },
  { day: 'Vie', date: '2 May', tempMax: 20, tempMin: 14, condition: 'cloudy', precipChance: 14 },
  { day: 'Sáb', date: '3 May', tempMax: 17, tempMin: 11, condition: 'rainy', precipChance: 64 },
  { day: 'Dom', date: '4 May', tempMax: 16, tempMin: 10, condition: 'stormy', precipChance: 72 },
  { day: 'Lun', date: '5 May', tempMax: 18, tempMin: 9, condition: 'cloudy', precipChance: 24 },
  { day: 'Mar', date: '6 May', tempMax: 22, tempMin: 12, condition: 'sunny', precipChance: 4 }
];
