const MathLine = require('./mathLine.js');
const Point = require('../point/point.js');

class MathLineCollection {
  constructor (mathLines = null) {
    this.mathLineCollection = mathLines || [];
  }

  length () {
    return this.mathLineCollection.length;
  }

  addMathLine (mathLine) {
    this.mathLineCollection.push(mathLine);
  }

  static fromPolyline (polyline) {
    const mathLines = [];
    const segmentPolyline = polyline.getSegmentPolyline();
    const segmentBrng = polyline.getSegmentBearing();
    const segmentDistance = polyline.getSegmentDistance();
    segmentPolyline.forEach((ply, index) => {
      mathLines.push(
        new MathLine(
          ply.points[0], segmentBrng[index], segmentDistance[index],
          ply.points[1]
        )
      );
    });
    return new MathLineCollection(mathLines);
  }

  toPolylinePoints (isFoundLine = true) {
    const points = [];
    if (isFoundLine) {
      this.mathLineCollection.forEach(elem => {
        points.push(Point.fromCoordinate(elem.originCor));
      });
      return [...points, points[0]];
    } else {
      this.mathLineCollection.forEach(elem => {
        points.push(Point.fromCoordinate(elem.originCor));
      });
      points.push(
        Point.fromCoordinate(this.mathLineCollection.slice(-1)[0].dest)
      );
      return points;
    }
  }
}

module.exports = MathLineCollection;
