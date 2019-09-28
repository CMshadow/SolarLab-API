const Cesium = require('cesium');

const coordinateToVector = (coordinate) => {
  var latRadians = Cesium.Math.toRadians(coordinate.lat);
  var lonRadians = Cesium.Math.toRadians(coordinate.lon);

  var x = Math.cos(latRadians) * Math.cos(lonRadians);
  var y = Math.cos(latRadians) * Math.sin(lonRadians);
  var z = Math.sin(latRadians);

  return [x, y, z];
};

const vectorToCoordinate = (v, height) => {
    var latRadians = Math.atan2(v[2], Math.sqrt(v[0]*v[0] + v[1]*v[1]));
    var lonRadians = Math.atan2(v[1], v[0]);

    return [
      Cesium.Math.toDegrees(lonRadians),
      Cesium.Math.toDegrees(latRadians),
      height
    ];
};

const greatCircle = (coordinate, bearing) => {
    var latRadians = Cesium.Math.toRadians(coordinate.lat);
    var lonRadians = Cesium.Math.toRadians(coordinate.lon);
    var brngRadians = Cesium.Math.toRadians(bearing);

    var x = Math.sin(lonRadians) * Math.cos(brngRadians) - Math.sin(latRadians)
      * Math.cos(lonRadians) * Math.sin(brngRadians);
    var y = -Math.cos(lonRadians) * Math.cos(brngRadians) - Math.sin(latRadians)
      * Math.sin(lonRadians) * Math.sin(brngRadians);
    var z = Math.cos(latRadians) * Math.sin(brngRadians);

    return [x, y, z];
};

const cross = (v1,v2) => {

    var x = v1[1] * v2[2] - v1[2] * v2[1];
    var y = v1[2] * v2[0] - v1[0] * v2[2];
    var z = v1[0] * v2[1] - v1[1] * v2[0];

    return [x, y, z];
};

const dot = (v1,v2) => {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

const plus = (v1,v2) => {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
};

module.exports = {
  coordinateToVector,
  vectorToCoordinate,
  greatCircle,
  cross,
  dot,
  plus
}
