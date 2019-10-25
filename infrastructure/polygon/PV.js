const Cesium = require('cesium');
const Polygon = require('./Polygon');

class PV extends Polygon {
  constructor (
    id = null,
    name = null,
    hierarchy = null,
    material = null,
    outlineColor = null
  ) {
    super(
      id,
      name || 'PV',
      null,
      hierarchy,
      null,
      null,
      material || Cesium.Color.ROYALBLUE,
      outlineColor || Cesium.Color.BLACK
    );
  }
}

module.exports = PV;
