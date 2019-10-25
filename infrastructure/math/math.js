const Cesium = require('cesium');

const coordinateToVector = (coordinate) => {
  const latRadians = Cesium.Math.toRadians(coordinate.lat);
  const lonRadians = Cesium.Math.toRadians(coordinate.lon);

  const x = Math.cos(latRadians) * Math.cos(lonRadians);
  const y = Math.cos(latRadians) * Math.sin(lonRadians);
  const z = Math.sin(latRadians);

  return [x, y, z];
};

const vectorToCoordinate = (v, height) => {
  const latRadians = Math.atan2(v[2], Math.sqrt(v[0] * v[0] + v[1] * v[1]));
  const lonRadians = Math.atan2(v[1], v[0]);

  return [
    Cesium.Math.toDegrees(lonRadians),
    Cesium.Math.toDegrees(latRadians),
    height
  ];
};

const greatCircle = (coordinate, bearing) => {
  const latRadians = Cesium.Math.toRadians(coordinate.lat);
  const lonRadians = Cesium.Math.toRadians(coordinate.lon);
  const brngRadians = Cesium.Math.toRadians(bearing);

  const x = Math.sin(lonRadians) * Math.cos(brngRadians) -
    Math.sin(latRadians) * Math.cos(lonRadians) * Math.sin(brngRadians);
  const y = -Math.cos(lonRadians) * Math.cos(brngRadians) -
    Math.sin(latRadians) * Math.sin(lonRadians) * Math.sin(brngRadians);
  const z = Math.cos(latRadians) * Math.sin(brngRadians);

  return [x, y, z];
};

const cross = (v1, v2) => {
  const x = v1[1] * v2[2] - v1[2] * v2[1];
  const y = v1[2] * v2[0] - v1[0] * v2[2];
  const z = v1[0] * v2[1] - v1[1] * v2[0];

  return [x, y, z];
};

const dot = (v1, v2) => {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

const plus = (v1, v2) => {
  return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
};

module.exports = {
  coordinateToVector,
  vectorToCoordinate,
  greatCircle,
  cross,
  dot,
  plus
};
