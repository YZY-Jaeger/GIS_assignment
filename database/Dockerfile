# specify base image that we want to extend
FROM kartoza/postgis:14-3.3

# set environment variables that we want to change
ENV POSTGRES_DB="gis_db"
ENV POSTGRES_USER="gis_user"
ENV POSTGRES_PASS="gis_pass"

RUN apt-get update
RUN apt-get install -y osm2pgsql gdal-bin wget

RUN mkdir -p /importdata

COPY import_script.sh /docker-entrypoint-initdb.d/import_script.sh
