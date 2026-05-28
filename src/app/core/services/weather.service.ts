import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  getCurrentWeather(lat: number, lon: number): Observable<any> {
    const params = new HttpParams().set('lat', lat.toString()).set('lon', lon.toString());
    return this.http.get(`${this.apiUrl}/weather/current`, { params });
  }

  getForecast(lat: number, lon: number): Observable<any> {
    const params = new HttpParams().set('lat', lat.toString()).set('lon', lon.toString());
    return this.http.get(`${this.apiUrl}/weather/forecast`, { params });
  }

  getAirQuality(lat: number, lon: number): Observable<any> {
    const params = new HttpParams().set('lat', lat.toString()).set('lon', lon.toString());
    return this.http.get(`${this.apiUrl}/weather/air-quality`, { params });
  }
}
