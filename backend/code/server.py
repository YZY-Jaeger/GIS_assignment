from flask import Flask, jsonify,request
from flask_cors import CORS
import json

import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)
@app.route('/add')
def add():
    print("adding")
    # do something here to retrieve both numbers from the url
    # check above on how to get default values with get()
    number1 = request.args.get("n1", 0,type = int)
    number2 = request.args.get("n2", 0,type = int)
    return f"{number1 + number2}"

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

    # TODO: connect to the database
    #       fetch the earthquakes that you imported into the database (see database/import_script.sh)
    #       transform the database result into a list

    # sample earthquake
    earthquakes = [{
      "type": "Feature",
      "properties": {
        "id": "8015866",
        "lat": "63.858",
        "lon": "-22.396",
        "mag": "4.2",
        "time": "1700121962"  
      },
      "geometry": {
        "type": "Point",
        "coordinates": [63.858, -22.396]
      }
    }]
    return jsonify({
        "type": "FeatureCollection", "features": earthquakes
    }), 200


