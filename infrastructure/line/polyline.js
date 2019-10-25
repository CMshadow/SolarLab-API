const Cesium = require('cesium');
const uuid = require('uuid/v1');
const turf = require('@turf/turf');
const simplepolygon = require('simplepolygon');

const Coordinate = require('../point/coordinate');
const Point = require('../point/point.js');
const MathLineCollection = require('../math/mathLineCollection.js');
const MathLine = require('../math/mathLine.js');

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

  makeSetbackPolylineOutside (stbDist) {
    const originPolyline = this.makeSetbackPolyline(stbDist);
    if (originPolyline.polyline.isSelfIntersection()) {
      return originPolyline.polyline.removeOutsideSetbackSelfIntersection();
    } else {
      return [originPolyline.polyline];
    }
  }

  makeSetbackPolyline (stbDist) {
    const originPolyline = Polyline.fromPolyline(this);
    const mathLineCollection = MathLineCollection.fromPolyline(originPolyline);

    let stbPolylinePoints = [];
    for (const direction of [90, -90]) {
      const stbMathLineCollection = new MathLineCollection();
      mathLineCollection.mathLineCollection.forEach(mathLine => {
        const anchor = Coordinate.destination(
          mathLine.originCor, mathLine.brng + direction, stbDist
        );
        const end = Coordinate.destination(
          mathLine.dest, mathLine.brng + direction, stbDist
        );
        stbMathLineCollection.addMathLine(
          new MathLine(anchor, mathLine.brng, null, end)
        );
      });

      stbMathLineCollection.mathLineCollection.slice(0, -1).forEach(
        (mathLine, index) => {
          let nextMathLine = null;
          nextMathLine = stbMathLineCollection.mathLineCollection[index + 1];
          const intersectCandidate1 = Coordinate.intersection(
            mathLine.originCor,
            mathLine.brng,
            nextMathLine.originCor,
            nextMathLine.brng - 180
          );
          const intersectCandidate2 = Coordinate.intersection(
            mathLine.originCor,
            mathLine.brng,
            nextMathLine.originCor,
            nextMathLine.brng
          );
          const intersectCandidate3 = Coordinate.intersection(
            mathLine.originCor,
            mathLine.brng - 180,
            nextMathLine.originCor,
            nextMathLine.brng - 180
          );
          const intersectCandidate4 = Coordinate.intersection(
            mathLine.originCor,
            mathLine.brng - 180,
            nextMathLine.originCor,
            nextMathLine.brng
          );
          const intersectCandidateCompare = [
            {
              candidate: intersectCandidate1,
              dist:
                Coordinate.surfaceDistance(mathLine.originCor, intersectCandidate1)
            },
            {
              candidate: intersectCandidate2,
              dist:
                Coordinate.surfaceDistance(mathLine.originCor, intersectCandidate2)
            },
            {
              candidate: intersectCandidate3,
              dist:
                Coordinate.surfaceDistance(mathLine.originCor, intersectCandidate3)
            },
            {
              candidate: intersectCandidate4,
              dist:
                Coordinate.surfaceDistance(mathLine.originCor, intersectCandidate4)
            }
          ];
          intersectCandidateCompare.sort((a, b) => (a.dist < b.dist) ? -1 : 1);
          const intersection = intersectCandidateCompare[0].candidate;

          mathLine.dist = Coordinate.surfaceDistance(
            mathLine.originCor, intersection
          );
          nextMathLine.originCor = intersection;
        }
      );
      if (direction === 90) {
        stbPolylinePoints = stbPolylinePoints.concat(
          stbMathLineCollection.toPolylinePoints(false)
        );
      } else {
        stbPolylinePoints = stbPolylinePoints.concat(
          stbMathLineCollection.toPolylinePoints(false).reverse()
        );
      }
    }
    const stbPolyline = new Polyline(stbPolylinePoints);
    return {
      polyline: stbPolyline,
      direction: 90
    };
  }

  removeOutsideSetbackSelfIntersection (direction) {
    const splitGeoJSON = simplepolygon(this.makeGeoJSON());
    const splitPolylines = [];
    splitGeoJSON.features.forEach(elem => {
      if (elem.properties.parent < 0) {
        const points = elem.geometry.coordinates[0].slice(0, -1).map(cor =>
          new Point(cor[0], cor[1], cor[2] ? cor[2] : this.points[0].height)
        );
        splitPolylines.push(new Polyline([...points, points[0]]));
      }
    });
    return splitPolylines;
  }
}

module.exports = Polyline;
