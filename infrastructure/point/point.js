const Cesium = require('cesium');
const uuid = require('uuid/v1');

const Coordinate = require('./coordinate.js');

class Point extends Coordinate {
  constructor (
    lon, lat, height, hOffset = null, id = null, name = null, color = null,
    size = null, show = true, render = true
  ) {
    super(lon, lat, height);
    this.heightOffset = hOffset || 0;
    this.entityId = id || uuid();
    this.name = name || 'vertex';
    this.color = color || Cesium.Color.WHITE;
    this.pixelSize = size || 15;
    this.show = show;
    this.render = render;
  }

  static fromPoint (
    point, lon = null, lat = null, height = null, offset = null, id = null,
    name = null, color = null, show = null, pixelSize = null, render = null
  ) {
    const newLon = lon || point.lon;
    const newLat = lat || point.lat;
    const newHeight = height || point.height;
    const newHOffset = offset || point.heightOffset;
    const newId = id || point.entityId;
    const newName = name || point.name;
    const newColor = color || point.color;
    const newShow = render !== null ? show : point.show;
    const newPixelSize = pixelSize || point.pixelSize;
    const newRender = render !== null ? render : point.render;
    return new Point(newLon, newLat, newHeight, newHOffset, newId, newName,
      newColor, newPixelSize, newShow, newRender);
  }

  static fromCoordinate (
    coordinate, hOffset = null, id = null, name = null, color = null,
    size = null, show = true, render = true
  ) {
    return new Point(
      coordinate.lon, coordinate.lat, coordinate.height, hOffset, id, name,
      color, size, show, render);
  }

  getCoordinate (toArray = false) {
    if (toArray) {
      return [this.lon, this.lat, this.height + this.heightOffset];
    } else {
      return {
        lon: this.lon,
        lat: this.lat,
        height: this.height + this.heightOffset
      };
    }
  }
}

module.exports = Point;
