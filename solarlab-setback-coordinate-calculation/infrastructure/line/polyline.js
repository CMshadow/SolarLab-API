const Cesium = require('cesium');
const uuid = require('uuid/v1');
const turf = require('@turf/turf')
const simplepolygon = require('simplepolygon')

const Point = require('../point/point.js');
const Coordinate = require('../point/coordinate.js');

class Polyline {

  constructor (
    points = null, id = null, name = null, color = null, width = null,
    show = true
  ) {
    this.points = points ? points : [];
    this.entityId = id ? id : uuid();
    this.name = name ? name : 'polyline';
    this.color = color ? color : Cesium.Color.WHITE;
    this.show = show;
    this.width = width ? width : 4;
  }

  static fromPolyline (
    polyline, id = polyline.entityId, name = null, color = null, width = null,
    show = true
  ) {
    const newPoints = polyline.points.map(elem => {
      return Point.fromPoint(elem);
    });
    const newName = name ? name : polyline.name;
    const newColor = color ? color : polyline.color;
    const newShow = show ? show : polyline.show;
    const newWidth = width ? width : polyline.width;
    return new Polyline (newPoints, id, newName, newColor, newWidth, newShow);
    }

  get length () {
    return this.points.length;
  }

  polylineArea () {
    return turf.area(turf.polygon(this.makeGeoJSON().geometry.coordinates));
  }

  getPointsCoordinatesArray (flat = true) {
    let CoordinatesArray = [];
    if (flat) {
      this.points.map(point => {
        return CoordinatesArray = CoordinatesArray.concat(
          point.getCoordinate(true)
        );
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
    let brngArray = [];
    for (let i = 0; i < this.length-1; i++) {
      brngArray.push(Point.bearing(this.points[i], this.points[i+1]));
    }
    return brngArray;
  }

  getSegmentDistance () {
    let distArray = [];
    for (let i = 0; i < this.length-1; i++) {
      distArray.push(Point.surfaceDistance(this.points[i], this.points[i+1]));
    }
    return distArray;
  }

  getSegmentPolyline () {
    let polylineArray = [];
    for (let i = 0; i < this.length-1; i++) {
      polylineArray.push(new Polyline([this.points[i], this.points[i+1]]));
    }
    return polylineArray;
  }

  getHelpLineBearings () {
    let brngSet = new Set();
    for (let i = 0; i < this.length-1; i++) {
      const brng = Point.bearing(this.points[i], this.points[i+1]);
      const brng1 = (brng-180)%360 > 0 ? (brng-180)%360 : (brng-180)%360+360;
      const brng2 = (brng+90)%360 > 0 ? (brng+90)%360 : (brng+90)%360+360;
      const brng3 = (brng-90)%360 > 0 ? (brng-90)%360 : (brng-90)%360+360;
      const brng4 = (brng-45)%360 > 0 ? (brng-45)%360 : (brng-45)%360+360;
      const brng5 = (brng+45)%360 > 0 ? (brng+45)%360 : (brng+45)%360+360;
      const brng6 = (brng-135)%360 > 0 ? (brng-135)%360 : (brng-135)%360+360;
      const brng7 = (brng+135)%360 > 0 ? (brng+135)%360 : (brng+135)%360+360;
      brngSet.add(parseFloat(brng.toFixed(5)));
      brngSet.add(parseFloat(brng1.toFixed(5)));
      brngSet.add(parseFloat(brng2.toFixed(5)));
      brngSet.add(parseFloat(brng3.toFixed(5)));
      brngSet.add(parseFloat(brng4.toFixed(5)));
      brngSet.add(parseFloat(brng5.toFixed(5)));
      brngSet.add(parseFloat(brng6.toFixed(5)));
      brngSet.add(parseFloat(brng7.toFixed(5)));
    }
    return brngSet;
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
    }
    return geoJSON;
  };

  isSelfIntersection () {
    const geoJson = this.makeGeoJSON();
    const selfIntersectionDetect = simplepolygon(geoJson);
    return selfIntersectionDetect.features.length >= 2;
  };
}

module.exports = Polyline;
