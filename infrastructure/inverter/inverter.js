
class Inverter {
  constructor (
    model = null, modelInfo = null, serialNum = null, panelsPerString = null,
    StringPerInverter = null, wiring = null, bridging = null,
    inverterPolygon = null, inverterPolygonCenter = null
  ) {
    this.model = model || '';
    this.model_full_info = modelInfo || {};
    this.inverter_serial_number = serialNum || 0;
    this.panels_per_string = panelsPerString || 0;
    this.string_per_inverter = StringPerInverter || 0;
    this.wiring = wiring || [];
    this.bridging = bridging || [];
    this.inverter_polygon_id = inverterPolygon;
    this.inverter_polygon_center = inverterPolygonCenter;
  }
}

module.exports = Inverter;
