import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeatureCollection } from 'geojson';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  /**
   * TODO: Get Earthquakes from Backend
   */
  public getEarthquakes(): Observable<FeatureCollection> {
    const url = "http://localhost:5000/get_earthquakes";
    return this.http.post(url,null,httpOptions);
  }

  /**
   * TODO: Get Polygons from Backend
   */
  public getPolygons(): Observable<FeatureCollection> {

    const url = "http://localhost:5000/get_polygons";
    return this.http.post(url,null,httpOptions);
  }
}
