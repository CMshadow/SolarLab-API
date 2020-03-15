const turf = require('@turf/turf');
const simplepolygon = require('simplepolygon');

const Point = require('../point/point.js');
const Coordinate = require('../point/coordinate.js');
const Polyline = require('./polyline.js');
const MathLineCollection = require('../math/mathLineCollection.js');
const MathLine = require('../math/mathLine.js');

/**
 * A closed polyline
 * @extends Polyline
 */
class FoundLine extends Polyline {
  /**
   * constructor
   * @param {[type]}  [points=null] [description]
   * @param {[type]}  [id=null]     [description]
   * @param {[type]}  [name=null]   [description]
   * @param {[type]}  [color=null]  [description]
   * @param {[type]}  [width=null]  [description]
   * @param {Boolean} [show=true]   [description]
   */
  constructor(
    points = null, id = null, name = null, color = null, width = null,
    show = true,
  ) {
    super(points, id, name, color, width, show);
  }

  /**
   * copy constructor
   * @param  {[type]}  polyline               [description]
   * @param  {[type]}  [id=polyline.entityId] [description]
   * @param  {[type]}  [name=null]            [description]
   * @param  {[type]}  [color=null]           [description]
   * @param  {[type]}  [width=null]           [description]
   * @param  {Boolean} [show=true]            [description]
   * @return {[type]}                         [description]
   */
  static fromPolyline(
    polyline, id = polyline.entityId, name = null, color = null, width = null,
    show = true,
  ) {
    const priorPoints = polyline.points.slice(0, polyline.points.length - 1)
      .map((elem) => {
        return Point.fromPoint(elem);
      });
    const newPoints = [...priorPoints, priorPoints[0]];
    const newName = name || polyline.name;
    const newColor = color || polyline.color;
    const newShow = show || polyline.show;
    const newWidth = width || polyline.width;
    return new FoundLine(newPoints, id, newName, newColor, newWidth, newShow);
  }

  makeSetbackPolylineOutside(stbDist) {
    const originPolyline = this.makeSetbackPolyline(stbDist, 'outside');
    if (originPolyline.polyline.isSelfIntersection()) {
      return originPolyline.polyline.removeOutsideSetbackSelfIntersection(
        originPolyline.direction,
      );
    } else {
      return [originPolyline.polyline];
    }
  }

  makeSetbackPolylineInside(stbDist) {
    const originPolyline = this.makeSetbackPolyline(stbDist, 'inside');
    if (
      turf.lineIntersect(
        this.makeGeoJSON(), originPolyline.polyline.makeGeoJSON(),
      ).features.length !== 0
    ) {
      return [null];
    }
    if (originPolyline.polyline.isSelfIntersection()) {
      return originPolyline.polyline.splitInsideSetbackSelfIntersection(
        originPolyline.direction,
      );
    } else {
      return [originPolyline.polyline];
    }
  }

  makeSetbackPolyline(stbDist, type) {
    const originPolyline = FoundLine.fromPolyline(this);
    const mathLineCollection = MathLineCollection.fromPolyline(originPolyline);
    const result = [];
    for (const direction of [90, -90]) {
      const stbMathLineCollection = new MathLineCollection();
      mathLineCollection.mathLineCollection.forEach((mathLine, index) => {
        const anchor = Coordinate.destination(
          mathLine.originCor, mathLine.brng + direction,
          stbDist instanceof Array ? stbDist[index] : stbDist,
        );
        stbMathLineCollection.addMathLine(new MathLine(anchor, mathLine.brng));
      });
      stbMathLineCollection.mathLineCollection.forEach((mathLine, index) => {
        let nextMathLine = null;
        if (index < stbMathLineCollection.length() - 1) {
          nextMathLine = stbMathLineCollection.mathLineCollection[index + 1];
        } else {
          nextMathLine = stbMathLineCollection.mathLineCollection[0];
        }
        const intersectCandidate1 = Coordinate.intersection(
          mathLine.originCor,
          mathLine.brng,
          nextMathLine.originCor,
          nextMathLine.brng - 180,
        );
        const intersectCandidate2 = Coordinate.intersection(
          mathLine.originCor,
          mathLine.brng,
          nextMathLine.originCor,
          nextMathLine.brng,
        );
        const intersectCandidate3 = Coordinate.intersection(
          mathLine.originCor,
          mathLine.brng - 180,
          nextMathLine.originCor,
          nextMathLine.brng - 180,
        );
        const intersectCandidate4 = Coordinate.intersection(
          mathLine.originCor,
          mathLine.brng - 180,
          nextMathLine.originCor,
          nextMathLine.brng,
        );
        const intersectCandidateCompare = [
          {
            candidate: intersectCandidate1,
            dist:
              Coordinate.surfaceDistance(mathLine.originCor, intersectCandidate1),
          },
          {
            candidate: intersectCandidate2,
            dist:
              Coordinate.surfaceDistance(mathLine.originCor, intersectCandidate2),
          },
          {
            candidate: intersectCandidate3,
            dist:
              Coordinate.surfaceDistance(mathLine.originCor, intersectCandidate3),
          },
          {
            candidate: intersectCandidate4,
            dist:
              Coordinate.surfaceDistance(mathLine.originCor, intersectCandidate4),
          },
        ];
        intersectCandidateCompare.sort((a, b) => (a.dist < b.dist) ? -1 : 1);
        const intersection = intersectCandidateCompare[0].candidate;

        mathLine.dist = Coordinate.surfaceDistance(
          mathLine.originCor, intersection,
        );
        nextMathLine.originCor = intersection;
      });
      const stbPolylinePoints = stbMathLineCollection.toPolylinePoints();
      const stbPolyline = new FoundLine(stbPolylinePoints);
      result.push({
        polyline: stbPolyline,
        direction: direction,
        polylineArea: stbPolyline.polylineArea(),
      });
    }
    if (type === 'inside') {
      return result.reduce((acc, val) => (
        acc.polylineArea > val.polylineArea ? val : acc
      ), result[0]);
    } else {
      return result.reduce((acc, val) => (
        acc.polylineArea < val.polylineArea ? val : acc
      ), result[0]);
    }
  }

  removeOutsideSetbackSelfIntersection(direction) {
    const splitGeoJSON = simplepolygon(this.makeGeoJSON());
    const splitPolylines = [];
    splitGeoJSON.features.forEach((elem) => {
      if (elem.properties.parent < 0) {
        const points = elem.geometry.coordinates[0].slice(0, -1).map((cor) =>
          new Point(cor[0], cor[1], cor[2] ? cor[2] : this.points[0].height),
        );
        splitPolylines.push(new FoundLine([...points, points[0]]));
      }
    });
    return splitPolylines;
  }

  splitInsideSetbackSelfIntersection(direction) {
    const splitGeoJSON = simplepolygon(this.makeGeoJSON());
    const splitPolylines = [];
    const windingDirection = splitGeoJSON.features[0].properties.winding;
    splitGeoJSON.features.forEach((elem) => {
      if (
        elem.properties.winding === windingDirection &&
        elem.properties.parent < 1
      ) {
        const points = elem.geometry.coordinates[0].slice(0, -1).map((cor) =>
          new Point(cor[0], cor[1], cor[2] ? cor[2] : this.points[0].height),
        );
        splitPolylines.push(new FoundLine([...points, points[0]]));
      }
    });
    return splitPolylines;
  }
}

module.exports = FoundLine;

// const a = FoundLine.fromPolyline({
//   "points": [
//     {
//       "lon": -117.841146229003,
//       "lat": 33.647143325635,
//       "height": 0.05,
//       "heightOffset": 0,
//       "entityId": "3d472d10-de9c-11e9-ab87-e957b5fd364c",
//       "name": "vertex",
//       "color": {
//         "red": 1,
//         "green": 1,
//         "blue": 1,
//         "alpha": 1
//       },
//       "pixelSize": 15,
//       "show": true,
//       "render": true
//     },
//     {
//       "lon": -117.841146231146,
//       "lat": 33.64692575905,
//       "height": 0.05,
//       "heightOffset": 0,
//       "entityId": "3d965e80-de9c-11e9-ab87-e957b5fd364c",
//       "name": "vertex",
//       "color": {
//         "red": 1,
//         "green": 1,
//         "blue": 1,
//         "alpha": 1
//       },
//       "pixelSize": 15,
//       "show": true,
//       "render": true
//     },
//     {
//       "lon": -117.840875769478,
//       "lat": 33.646943032838,
//       "height": 0.05,
//       "heightOffset": 0,
//       "entityId": "3dd87090-de9c-11e9-ab87-e957b5fd364c",
//       "name": "vertex",
//       "color": {
//         "red": 1,
//         "green": 1,
//         "blue": 1,
//         "alpha": 1
//       },
//       "pixelSize": 15,
//       "show": true,
//       "render": true
//     },
//     {
//       "lon": -117.840881705082,
//       "lat": 33.647126586837,
//       "height": 0.05,
//       "heightOffset": 0,
//       "entityId": "3de086e0-de9c-11e9-ab87-e957b5fd364c",
//       "name": "vertex",
//       "color": {
//         "red": 1,
//         "green": 1,
//         "blue": 1,
//         "alpha": 1
//       },
//       "pixelSize": 15,
//       "show": true,
//       "render": true
//     },
//     {
//       "lon": -117.841146229003,
//       "lat": 33.647143325635,
//       "height": 0.05,
//       "heightOffset": 0,
//       "entityId": "3d472d10-de9c-11e9-ab87-e957b5fd364c",
//       "name": "vertex",
//       "color": {
//         "red": 1,
//         "green": 1,
//         "blue": 1,
//         "alpha": 1
//       },
//       "pixelSize": 15,
//       "show": true,
//       "render": true
//     }
//   ],
//   "entityId": "3e53bb10-de9c-11e9-ab87-e957b5fd364c",
//   "name": "polyline",
//   "color": {
//     "red": 1,
//     "green": 1,
//     "blue": 1,
//     "alpha": 1
//   },
//   "show": true,
//   "width": 4
// })
// const b = a.makeSetbackPolylineInside(1)
// console.log(b)
