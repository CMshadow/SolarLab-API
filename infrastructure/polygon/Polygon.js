const uuid = require('uuid/v1');
const Cesium = require('cesium');

const Point = require('../point/point');
const FoundLine = require('../line/foundLine');

class Polygon {
  constructor (
    id = null,
    name = null,
    height = null,
    hierarchy = null,
    perPositionHeight = null,
    extrudedHeight = null,
    material = null,
    outlineColor = null,
    outlineWidth = null,
    shadow = null,
    show = null
  ) {
    this.entityId = id || uuid();
    this.name = name || 'Polygon';
    this.height = height || 0.0;
    this.hierarchy = hierarchy ? [...hierarchy] : [];
    this.perPositionHeight = perPositionHeight || true;
    this.extrudedHeight = extrudedHeight || 0.0;
    this.material = material || Cesium.Color.WHITE;
    this.outlineColor = outlineColor || Cesium.Color.BLACK;
    this.outlineWidth = outlineWidth || 4;
    this.shadow = shadow ? Cesium.ShadowMode.ENABLED : Cesium.ShadowMode.DISABLED;
    this.show = show || true;
  }

  static makeHierarchyFromPolyline (
    polyline, overwriteHeight = null, heightOffset = 0
  ) {
    let polylineHierarchy = null;

    if (polyline instanceof FoundLine) {
      polylineHierarchy = polyline.points.slice(0, -1).flatMap(p =>
        p.getCoordinate(true)
      );
    } else {
      polylineHierarchy = polyline.getPointsCoordinatesArray();
    }
    if (overwriteHeight) {
      for (let i = 0; i < polylineHierarchy.length; i += 3) {
        polylineHierarchy[i + 2] = overwriteHeight + heightOffset;
      }
    }
    return polylineHierarchy;
  }

  static makeHierarchyFromGeoJSON (GeoJSON, height, heightOffset = 0) {
    let polylineHierarchy = [];
    GeoJSON.geometry.coordinates[0].forEach(cor => {
      polylineHierarchy = polylineHierarchy.concat(
        [cor[0], cor[1], height + heightOffset]
      );
    });
    return polylineHierarchy;
  }

  getFoundationCoordinatesArray () { return this.hierarchy; }

  setHeight (newHeight) {
    this.height = newHeight;
  }

  setHierarchy (newHierarchy) {
    this.hierarchy = newHierarchy;
  }

  setColor (newColor) {
    this.material = newColor;
  }

  toFoundLine () {
    const firstAndLastPoint = new Point(
      this.hierarchy[0], this.hierarchy[1], this.hierarchy[2]
    );
    const points = [firstAndLastPoint];
    for (let i = 3; i < this.hierarchy.length; i += 3) {
      points.push(
        new Point(this.hierarchy[i], this.hierarchy[i + 1], this.hierarchy[i + 2])
      );
    }
    points.push(firstAndLastPoint);
    return new FoundLine(points);
  }
}
module.exports = Polygon;
