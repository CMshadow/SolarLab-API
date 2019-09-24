const Cesium = require('cesium');

const MyMath = require('../math/math.js');

class Coordinate {

  constructor (lon, lat, height) {
    this.lon = parseFloat(lon.toFixed(12));
    this.lat = parseFloat(lat.toFixed(12));
    this.height = parseFloat(height.toFixed(3));
  };

  getCoordinate (toArray=false) {
    if (toArray) {
      return [this.lon, this.lat, this.height];
    } else {
      return {
        lon: this.lon,
        lat: this.lat,
        height: this.height
      };
    }
  };

  setCoordinate (lon=null, lat=null, height=null) {
    if (lon) this.lon = parseFloat(lon.toFixed(12));
    if (lat) this.lat = parseFloat(lat.toFixed(12));
    if (height) this.height = parseFloat(height.toFixed(3));
  }

  setCartesian3Coordinate (cartesian3=null, absoluteHeight=null) {
    if (cartesian3) {
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
      const lon =
        parseFloat(Cesium.Math.toDegrees(cartographic.longitude).toFixed(12));
      const lat =
        parseFloat(Cesium.Math.toDegrees(cartographic.latitude).toFixed(12));
      let height = null;
      if (absoluteHeight) {
        height = absoluteHeight;
      } else {
        height = parseFloat(cartographic.height.toFixed(3));
      }
      this.setCoordinate(lon, lat, height);
    }
  }

  static surfaceDistance (cor1, cor2) {
    const R = 6371e3; // metres
    const φ1 = Cesium.Math.toRadians(cor1.lat);
    const φ2 = Cesium.Math.toRadians(cor2.lat);
    const Δφ = Cesium.Math.toRadians(cor2.lat - cor1.lat);
    const Δλ = Cesium.Math.toRadians(cor2.lon - cor1.lon);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  static linearDistance (cor1, cor2) {
    return Cesium.Cartesian3.distance(
      Cesium.Cartesian3.fromDegreesArrayHeights(cor1.getCoordinate(true)),
      Cesium.Cartesian3.fromDegreesArrayHeights(cor2.getCoordinate(true))
    );
  }

  static bearing (cor1, cor2) {
    const cor1Lon = Cesium.Math.toRadians(cor1.lon);
    const cor1Lat = Cesium.Math.toRadians(cor1.lat);
    const cor2Lon = Cesium.Math.toRadians(cor2.lon);
    const cor2Lat = Cesium.Math.toRadians(cor2.lat);

    const y = Math.sin(cor2Lon-cor1Lon) * Math.cos(cor2Lat);
    const x = Math.cos(cor1Lat) * Math.sin(cor2Lat) -
              Math.sin(cor1Lat) * Math.cos(cor2Lat) * Math.cos(cor2Lon-cor1Lon);
    const brng = Cesium.Math.toDegrees(Math.atan2(y, x));
    return (brng+360)%360;
  };

  static destination (cor, brng, dist) {
    const earth_radius = 6371;
    const angularDist = dist/1000/earth_radius;
    const cor1Lon = Cesium.Math.toRadians(cor.lon);
    const cor1Lat = Cesium.Math.toRadians(cor.lat);
    const angularBrng = Cesium.Math.toRadians(brng);

    const destLat = Math.asin(
      Math.sin(cor1Lat) * Math.cos(angularDist) + Math.cos(cor1Lat)
      * Math.sin(angularDist) * Math.cos(angularBrng)
    );
    const destLon = cor1Lon + Math.atan2(
      Math.sin(angularBrng) * Math.sin(angularDist) * Math.cos(cor1Lat),
      Math.cos(angularDist) - Math.sin(cor1Lat) * Math.sin(destLat)
    );

    return new Coordinate(
      Cesium.Math.toDegrees(destLon),
      Cesium.Math.toDegrees(destLat),
      cor.height
    )
  };

  static intersection (cor1, brng1, cor2, brng2) {
    const avgHeight = (cor1.height + cor2.height) / 2;

    const p1 = MyMath.coordinateToVector(cor1);
    const p2 = MyMath.coordinateToVector(cor2);

    const c1 = MyMath.greatCircle(cor1, brng1);
    const c2 = MyMath.greatCircle(cor2, brng2);

    let i1 = MyMath.cross(c1,c2);
    let i2 = MyMath.cross(c2,c1);

    let intersection=null;
    const dir1 = Math.sign(MyMath.dot(MyMath.cross(c1,p1), i1));
    const dir2 = Math.sign(MyMath.dot(MyMath.cross(c2,p2), i1));

    switch (dir1+dir2) {
      case  2:
        intersection = i1;
        break;
      case -2:
        intersection = i2;
        break;
      case  0:
        intersection = MyMath.dot(MyMath.plus(p1,p2), i1) > 0 ? i2 : i1;
        break;
      default:
        break;
    }

    if (intersection){
      return MyMath.vectorToCoordinate(intersection, avgHeight);
    }
    return undefined;
  }

}

module.exports = Coordinate;
