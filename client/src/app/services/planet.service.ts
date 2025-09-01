import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable} from 'rxjs';
import { environment } from '../../environments/environment';
import { IPlanet, PlanetBackendResponse } from '../models/planet.model';

@Injectable({
  providedIn: 'root'
})
export class PlanetService {
  private http = inject(HttpClient);

  //helper function for mapping not parsed property from backend
  private mapBackendPlanet(res: PlanetBackendResponse): IPlanet {
    let distance: any;

    if (typeof res.distInMillionsKM === 'string') {
      try {
        distance = JSON.parse(res.distInMillionsKM);
      } catch {
        distance = null;
      }
    } else {
      distance = res.distInMillionsKM;
    }

    return {
      ...res,
      distInMillionsKM: distance
    };
  }

  getPlanets(): Observable<IPlanet[]> {
    return this.http.get<PlanetBackendResponse[]>(environment.planets)
      .pipe(
        map(res => {
          if (res) {
            return res.map((data) => this.mapBackendPlanet(data));
          }
          return res;
        })
      );
  }

  getPlanetById(id: number): Observable<IPlanet> {
    return this.http.get<PlanetBackendResponse>(`${environment.planets}/${id}`)
      .pipe(
        map((data) =>{
          if (data) {
            return this.mapBackendPlanet(data);
          }
          return data;
        })
      );
  }
  
  addPlanet(planetData: any, file?: File): Observable<PlanetBackendResponse> {
    const formData = new FormData();

    // append normal fields
    Object.keys(planetData).forEach(key => {
      if (key === 'imageUrl') {
        return; // skip imageUrl on add planet
      }

      const value = planetData[key];

      if (value !== null && typeof value === 'object') {
        // stringify nested objects/ backend is not parsing distInMillionsKM
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    // append file if provided
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<PlanetBackendResponse>(environment.planets, formData);
  }

  editPlanet(id: number, planetData: any, file?: File) {
    const formData = new FormData();
    Object.keys(planetData).forEach(key => {
      if (key === 'imageUrl' && file) {
        return; // skip imageUrl if file is provided
      }
      const value = planetData[key];

      if (value !== null && typeof value === 'object') {
        // stringify nested objects/ backend is not parsing distInMillionsKM
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });
    if (file) {
      formData.append('file', file);
    }
    return this.http.put(`${environment.planets}/${id}`, formData);
  }

  deletePlanet(id: number): Observable<PlanetBackendResponse[]>{
    return this.http.delete<PlanetBackendResponse[]>(`${environment.planets}/${id}`);
  }
  
  //seting planets initial state
  reloadPlanets(): Observable<PlanetBackendResponse[]>{
    return this.http.get<PlanetBackendResponse[]>(`${environment.planets}/reload`);
  }
  
}
