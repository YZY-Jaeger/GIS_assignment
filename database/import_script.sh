#!/bin/bash

# we are now inside the linux environment of our PostGIS container
echo "Hi from the import script"

# move into importdata directory
cd /importdata

# TODO download polygon OSM data
wget https://download.geofabrik.de/europe/iceland-latest.osm.pbf
# TODO import data into database (check the osm2pgsql package for OSM imports and the ogr2ogr package for importing geojson to postgis)
osm2pgsql --database ${POSTGRES_DB} --host localhost --port 5432 --username ${POSTGRES_USER} --create --slim --drop --latlong /importdata/iceland-latest.osm.pbf

# we use curl to download earthquake json data (this can be copied from the API. -o specifies the file to store the data)
curl -X 'POST' 'https://api.vedur.is/skjalftalisa/v1/quakefilter'   -H 'accept: application/json'   -H 'Content-Type: application/json'   -d '{
  "area": [
    [
      64.1,
      -21.5
    ],
    [
      63.8,
      -21.5
    ],
    [
      63.8,
      -22.8
    ],
    [
      64.1,
      -22.8
    ]
  ],
  "depth_max": 25,
  "depth_min": 0,
  "end_time": "2023-11-24 15:00:00",
  "event_type": [
    "qu"
  ],
  "magnitude_preference": [
    "Mlw"
  ],
  "originating_system": [
    "SIL picks"
  ],
  "size_max": 6,
  "size_min": 1,
  "start_time": "2023-10-24 23:59:59"
}' -o "eq_data.json"

# we need to convert the result we got to a proper geojson featureCollection
# jq '{"type": "FeatureCollection", "features": .}' eq_data.json > eq_data.geojson
echo '{"type":"FeatureCollection","features":' $(cat eq_data.json) '}' > eq_data.geojson

# now we can import the data
ogr2ogr -f "PostgreSQL" -lco GEOMETRY_NAME=way PG:"dbname=${POSTGRES_DB} user=${POSTGRES_USER} password=${POSTGRES_PASS} host=localhost port=5432" /importdata/eq_data.geojson -nln eq_data -overwrite

echo "Import script execution completed"