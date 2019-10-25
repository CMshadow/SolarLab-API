const Cesium = require('cesium');
const uuid = require('uuid/v1');
const turf = require('@turf/turf');
const simplepolygon = require('simplepolygon');

const Point = require('../point/point.js');

class Polyline {
  constructor (
    points = null, id = null, name = null, color = null, width = null,
    show = true
  ) {
    this.points = points || [];
    this.entityId = id || uuid();
    this.name = name || 'polyline';
    this.color = color || Cesium.Color.WHITE;
    this.show = show;
    this.width = width || 4;
  }

  static fromPolyline (
    polyline, id = polyline.entityId, name = null, color = null, width = null,
    show = true
  ) {
    const newPoints = polyline.points.map(elem => {
      return Point.fromPoint(elem);
    });
    const newName = name || polyline.name;
    const newColor = color || polyline.color;
    const newShow = show || polyline.show;
    const newWidth = width || polyline.width;
    return new Polyline(newPoints, id, newName, newColor, newWidth, newShow);
  }

  length () {
    return this.points.length;
  }

  polylineArea () {
    return turf.area(turf.polygon(this.makeGeoJSON().geometry.coordinates));
  }

  getPointsCoordinatesArray (flat = true) {
    let CoordinatesArray = [];
    if (flat) {
      this.points.map(point => {
        CoordinatesArray = CoordinatesArray.concat(
          point.getCoordinate(true)
        );
        return CoordinatesArray;
      });
      return CoordinatesArray;
    } else {
      this.points.map(point => {
        return CoordinatesArray.push(point.getCoordinate(true));
      });
      return CoordinatesArray;
    }
  }

  getSegmentBearing () {
    const brngArray = [];
    for (let i = 0; i < this.length() - 1; i++) {
      brngArray.push(Point.bearing(this.points[i], this.points[i + 1]));
    }
    return brngArray;
  }

  getSegmentDistance () {
    const distArray = [];
    for (let i = 0; i < this.length() - 1; i++) {
      distArray.push(Point.surfaceDistance(this.points[i], this.points[i + 1]));
    }
    return distArray;
  }

  getSegmentPolyline () {
    const polylineArray = [];
    for (let i = 0; i < this.length() - 1; i++) {
      polylineArray.push(new Polyline([this.points[i], this.points[i + 1]]));
    }
    return polylineArray;
  }

  makeGeoJSON () {
    const coordinates = this.getPointsCoordinatesArray(false);
    const geoJSON = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          coordinates
        ]
      }
    };
    return geoJSON;
  }

  isSelfIntersection () {
    const geoJson = this.makeGeoJSON();
    const selfIntersectionDetect = simplepolygon(geoJson);
    return selfIntersectionDetect.features.length >= 2;
  }
}

module.exports = Polyline;
