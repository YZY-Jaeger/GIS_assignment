import { Component, Input, OnInit } from '@angular/core';
import { Feature, FeatureCollection, Geometry } from 'geojson';
import * as L from 'leaflet';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map!: L.Map;
  private earthquakesLayer: L.LayerGroup<any> = L.layerGroup();
  private polygonLayer: L.LayerGroup<any> = L.layerGroup();

  //sample data containing one earthquake
  private earthquakeData: FeatureCollection = {
    features: [{
      type: "Feature",
      properties: {
        id: "8015866",
        lat: "63.858",
        lon: "-22.396",
        mag: "4.2",
        time: "1700121962"  
      },
      geometry: {
        type: "Point",  
        coordinates: [63.858, -22.396]
      }
    }
    ],
    type: "FeatureCollection"
  }
//////////////
private updatePolygonLayer(data: FeatureCollection) {
  console.log('Updating polygon layer with data:', data);
  if (!this.map || !data || !data.features) {
    return;
  }
  
  // Remove old polygon layer
  this.map.removeLayer(this.polygonLayer);

  // Create a GeoJSON layer for each polygon feature
  this.polygonLayer = L.geoJSON(data, {
    style: {
      color: '#E87CF9',
      fillColor: 'lightblue',
      weight: 2,
      opacity: 0.5,
    },
    onEachFeature: (feature, layer) => {
      
      // Add popup with properties information
      layer.bindPopup(`ID: ${feature.properties.osm_id}`);
    },
  });

  // Add the new polygon layer to the map
  this.polygonLayer.addTo(this.map);

  console.log('Polygon layer updated successfully.');
}


/////////////
  private updateEarthquakeLayer() {
    if (!this.map) {
      return;
    }

    // remove old layerGroup
    this.map.removeLayer(this.earthquakesLayer);

    // create a marker for each earthquake
    const markers = this.earthquakeData.features.map((f:any) =>
      L.circleMarker(f.geometry.coordinates, {
        radius: parseFloat(f.properties.mag),
        color: 'red'
      }).bindPopup("magnitude: "+f.properties.mag)

    );

    // create a new layer group and add it to the map
    this.earthquakesLayer = L.layerGroup(markers);
    markers.forEach((m:L.Layer) => m.addTo(this.earthquakesLayer));
    this.map.addLayer(this.earthquakesLayer);
  }


  constructor(private dataService:DataService){}
  /**
   * Often divs and other HTML element are not available in the constructor. Thus we use onInit()
   */
  ngOnInit(): void {
    // some settings for a nice shadows, etc.
    const iconRetinaUrl = './assets/marker-icon-2x.png';
    const iconUrl = './assets/marker-icon.png';
    const shadowUrl = './assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });

    L.Marker.prototype.options.icon = iconDefault;

    // basic setup, create a map in the div with the id "map"
    this.map = L.map('map').setView([64.948531, -18.140711], 6.5);

    // set a tilelayer, e.g. a world map in the background
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // TODO: fetch earthquake data store it in this.earthquakeData
    // TODO: analog to the earthquake data, display the polygons from the database as geoJSON

    this.dataService.getPolygons().subscribe(
      data => {
        console.log("Received polygon data:", data);
        this.updatePolygonLayer(data);
      },
      error => {
        console.error('Error fetching polygon data:', error);
      }
    );


    this.updateEarthquakeLayer();
  }

}
