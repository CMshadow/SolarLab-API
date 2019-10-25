const Coordinate = require('../point/coordinate');

// 给入 [[经度，纬度], [经度，纬度], ...]，返回[最左侧经度，最右侧经度，最北侧纬度，最南侧纬度]
const generateBoundingWENS = (foundLine) => {
  // pointsSequence中分类东西南北坐标
  const lons = [];
  const lats = [];
  foundLine.getPointsCoordinatesArray(false).slice(0, -1).forEach(cor => {
    lons.push(cor[0]);
    lats.push(cor[1]);
  });

  // 东南西北极值
  const west = Math.min.apply(null, lons);
  const east = Math.max.apply(null, lons);
  const north = Math.max.apply(null, lats);
  const south = Math.min.apply(null, lats);
  return [west, east, north, south];
};

const corWithinLineCollectionPolygon =
(polygonMathLineCollection, testCor) => {
  const temp = [];
  polygonMathLineCollection.mathLineCollection.forEach(mathLine => {
    const brng = Coordinate.bearing(mathLine.originCor, testCor);
    if (brng === mathLine.brng) return false;
    const intersectCor =
      Coordinate.intersection(mathLine.originCor, mathLine.brng, testCor, 0);
    if (intersectCor !== undefined) {
      const trueDist =
        Coordinate.surfaceDistance(mathLine.originCor, intersectCor);
      if (trueDist < mathLine.dist) temp.push(intersectCor);
    }
  });
  if (temp.length % 2 === 1) return true;
  else return false;
};

module.exports = {
  generateBoundingWENS,
  corWithinLineCollectionPolygon
};
