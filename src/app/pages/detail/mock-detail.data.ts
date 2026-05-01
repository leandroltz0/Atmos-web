import { DailyForecast, WeatherCondition } from '../../features/dashboard/mock-weather.data';

export interface HourlyDetail {
  hour: string;
  temp: number;
  feelsLike: number;
  precipChance: number;
  precipMm: number;
  windSpeed: number;
  windDeg: number;
  uvIndex: number;
  humidity: number;
  condition: WeatherCondition;
}

export interface AirQualityDetail {
  aqi: number;
  aqiLabel: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
}

export interface SunMoon {
  sunrise: string;
  sunset: string;
  moonPhase: number;
  moonPhaseName: string;
  moonIllumination: number;
}

export interface DailyDetailForecast extends DailyForecast {
  windSpeed: number;
  windDirection: string;
  windDeg: number;
}

export interface DetailWeather {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  condition: WeatherCondition;
  conditionLabel: string;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  dewPoint: number;
  observedAt: string;
  hourly: HourlyDetail[];
  daily: DailyDetailForecast[];
  airQuality: AirQualityDetail;
  sunMoon: SunMoon;
}

export const MOCK_DETAIL: DetailWeather = {
  cityName: 'Buenos Aires',
  country: 'AR',
  lat: -34.6037,
  lon: -58.3816,
  temp: 18,
  feelsLike: 17,
  condition: 'partly-cloudy',
  conditionLabel: 'Parcialmente nublado',
  humidity: 68,
  windSpeed: 16,
  windDeg: 135,
  windDirection: 'SE',
  pressure: 1016,
  visibility: 12,
  uvIndex: 4,
  dewPoint: 11,
  observedAt: '15:00',
  hourly: [
    { hour: '00:00', temp: 15, feelsLike: 14, precipChance: 8, precipMm: 0, windSpeed: 11, windDeg: 155, uvIndex: 0, humidity: 82, condition: 'cloudy' },
    { hour: '01:00', temp: 15, feelsLike: 14, precipChance: 8, precipMm: 0, windSpeed: 10, windDeg: 150, uvIndex: 0, humidity: 84, condition: 'cloudy' },
    { hour: '02:00', temp: 14, feelsLike: 14, precipChance: 14, precipMm: 0.2, windSpeed: 12, windDeg: 148, uvIndex: 0, humidity: 86, condition: 'cloudy' },
    { hour: '03:00', temp: 14, feelsLike: 13, precipChance: 32, precipMm: 0.8, windSpeed: 14, windDeg: 145, uvIndex: 0, humidity: 88, condition: 'rainy' },
    { hour: '04:00', temp: 13, feelsLike: 13, precipChance: 46, precipMm: 1.2, windSpeed: 15, windDeg: 145, uvIndex: 0, humidity: 90, condition: 'rainy' },
    { hour: '05:00', temp: 13, feelsLike: 12, precipChance: 52, precipMm: 1.8, windSpeed: 16, windDeg: 142, uvIndex: 0, humidity: 92, condition: 'rainy' },
    { hour: '06:00', temp: 12, feelsLike: 11, precipChance: 58, precipMm: 2.1, windSpeed: 18, windDeg: 138, uvIndex: 0, humidity: 93, condition: 'rainy' },
    { hour: '07:00', temp: 12, feelsLike: 11, precipChance: 35, precipMm: 0.7, windSpeed: 16, windDeg: 136, uvIndex: 1, humidity: 91, condition: 'cloudy' },
    { hour: '08:00', temp: 13, feelsLike: 12, precipChance: 18, precipMm: 0.2, windSpeed: 15, windDeg: 132, uvIndex: 1, humidity: 86, condition: 'partly-cloudy' },
    { hour: '09:00', temp: 14, feelsLike: 13, precipChance: 12, precipMm: 0, windSpeed: 14, windDeg: 130, uvIndex: 2, humidity: 80, condition: 'partly-cloudy' },
    { hour: '10:00', temp: 15, feelsLike: 15, precipChance: 8, precipMm: 0, windSpeed: 13, windDeg: 128, uvIndex: 3, humidity: 74, condition: 'partly-cloudy' },
    { hour: '11:00', temp: 16, feelsLike: 16, precipChance: 6, precipMm: 0, windSpeed: 14, windDeg: 126, uvIndex: 4, humidity: 69, condition: 'partly-cloudy' },
    { hour: '12:00', temp: 17, feelsLike: 17, precipChance: 4, precipMm: 0, windSpeed: 15, windDeg: 130, uvIndex: 5, humidity: 63, condition: 'sunny' },
    { hour: '13:00', temp: 18, feelsLike: 17, precipChance: 4, precipMm: 0, windSpeed: 16, windDeg: 132, uvIndex: 5, humidity: 60, condition: 'sunny' },
    { hour: '14:00', temp: 18, feelsLike: 17, precipChance: 6, precipMm: 0, windSpeed: 16, windDeg: 135, uvIndex: 4, humidity: 61, condition: 'partly-cloudy' },
    { hour: '15:00', temp: 18, feelsLike: 17, precipChance: 8, precipMm: 0, windSpeed: 16, windDeg: 135, uvIndex: 4, humidity: 68, condition: 'partly-cloudy' },
    { hour: '16:00', temp: 19, feelsLike: 18, precipChance: 10, precipMm: 0, windSpeed: 17, windDeg: 138, uvIndex: 3, humidity: 66, condition: 'partly-cloudy' },
    { hour: '17:00', temp: 18, feelsLike: 18, precipChance: 16, precipMm: 0.1, windSpeed: 18, windDeg: 140, uvIndex: 2, humidity: 71, condition: 'cloudy' },
    { hour: '18:00', temp: 17, feelsLike: 16, precipChance: 22, precipMm: 0.2, windSpeed: 17, windDeg: 142, uvIndex: 1, humidity: 74, condition: 'cloudy' },
    { hour: '19:00', temp: 16, feelsLike: 15, precipChance: 18, precipMm: 0.1, windSpeed: 16, windDeg: 145, uvIndex: 0, humidity: 78, condition: 'cloudy' },
    { hour: '20:00', temp: 16, feelsLike: 15, precipChance: 12, precipMm: 0, windSpeed: 14, windDeg: 148, uvIndex: 0, humidity: 80, condition: 'partly-cloudy' },
    { hour: '21:00', temp: 15, feelsLike: 14, precipChance: 10, precipMm: 0, windSpeed: 13, windDeg: 152, uvIndex: 0, humidity: 82, condition: 'partly-cloudy' },
    { hour: '22:00', temp: 15, feelsLike: 14, precipChance: 12, precipMm: 0, windSpeed: 12, windDeg: 155, uvIndex: 0, humidity: 84, condition: 'cloudy' },
    { hour: '23:00', temp: 15, feelsLike: 14, precipChance: 12, precipMm: 0, windSpeed: 11, windDeg: 158, uvIndex: 0, humidity: 85, condition: 'cloudy' }
  ],
  daily: [
    { day: 'Hoy', date: '30 Abr', tempMax: 19, tempMin: 12, condition: 'partly-cloudy', precipChance: 18, windSpeed: 16, windDirection: 'SE', windDeg: 135 },
    { day: 'Jue', date: '1 May', tempMax: 21, tempMin: 13, condition: 'sunny', precipChance: 6, windSpeed: 12, windDirection: 'E', windDeg: 96 },
    { day: 'Vie', date: '2 May', tempMax: 20, tempMin: 14, condition: 'cloudy', precipChance: 14, windSpeed: 18, windDirection: 'SE', windDeg: 128 },
    { day: 'Sáb', date: '3 May', tempMax: 17, tempMin: 11, condition: 'rainy', precipChance: 64, windSpeed: 22, windDirection: 'SE', windDeg: 140 },
    { day: 'Dom', date: '4 May', tempMax: 16, tempMin: 10, condition: 'stormy', precipChance: 72, windSpeed: 28, windDirection: 'S', windDeg: 176 },
    { day: 'Lun', date: '5 May', tempMax: 18, tempMin: 9, condition: 'cloudy', precipChance: 24, windSpeed: 19, windDirection: 'SO', windDeg: 224 },
    { day: 'Mar', date: '6 May', tempMax: 22, tempMin: 12, condition: 'sunny', precipChance: 4, windSpeed: 14, windDirection: 'NE', windDeg: 42 }
  ],
  airQuality: {
    aqi: 2,
    aqiLabel: 'Buena',
    pm25: 15,
    pm10: 28,
    o3: 45,
    no2: 18
  },
  sunMoon: {
    sunrise: '07:29',
    sunset: '18:09',
    moonPhase: 0.27,
    moonPhaseName: 'Cuarto creciente',
    moonIllumination: 42
  }
};
