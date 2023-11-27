from flask import Flask, jsonify,request
from flask_cors import CORS
import json

import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)


@app.route('/get_polygons', methods=["GET", "POST"])
def get_polygons():
    query = """SELECT 
  osm_id,
  name,
  ST_AsGeoJSON(ST_Union(way)) AS geometry
FROM 
  planet_osm_polygon
WHERE 
  admin_level = '6'
GROUP BY 
  osm_id, name;
    """
    
    # TODO: connect to the database
    #       fetch the adminitistrave reagions of Iceland as polygons from the database (see database/import_script.sh)
    #       transform the database result into a list

    with psycopg2.connect(host="database", port=5432, dbname="gis_db", user="gis_user", password="gis_pass") as conn:
        with conn.cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()

    polygons ={};
    features = [
        {
            "type": "Feature",
            "properties": {
                "osm_id": row[0],  # Index 0 corresponds to osm_id
                "name": row[1],    # Index 1 corresponds to name
            },
            "geometry": json.loads(row[2]),  # Index 2 corresponds to geometry
        }
        for row in results
    ]

    return jsonify({
        "type": "FeatureCollection", "features": features
    }), 200


@app.route('/get_earthquakes', methods=["GET", "POST"])
def get_earthquakes():
    query = """SELECT 
                ogc_fid ,
                  ST_AsGeoJSON(way) AS geometry
                FROM 
                  eq_data


                    """
    # TODO: connect to the database
    #       fetch the earthquakes that you imported into the database (see database/import_script.sh)
    #       transform the database result into a list
    with psycopg2.connect(host="database", port=5432, dbname="gis_db", user="gis_user", password="gis_pass") as conn:
        with conn.cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
    # sample earthquake

    earthquakes = [{
        {
            "type": "Feature",
            "properties": {
                "ogc_fid": row[0],  # Index 0 corresponds 
                "magnitude": row[1],    # Index 1 corresponds 
            },
            "geometry": json.loads(row[2]),  # Index 2 corresponds to geometry
        }
        for row in results
    }] 
    return jsonify({
        "type": "FeatureCollection", "features": earthquakes
    }), 200


