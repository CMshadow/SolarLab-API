let Polyline = require('./infrastructure/line/polyline');

exports.lambdaHandler = async (event, context) => {
  console.log(event)
  const originPolylines = event.originPolylines.map(ply =>
    Polyline.fromPolyline(ply)
  );
  const stbDists = event.stbDists;

  let stbPolylines = [];
  originPolylines.forEach((originPolyline, index) => {
    stbPolylines.push(
      originPolyline.makeSetbackPolylineOutside(stbDists[index])
    );
  });
  console.log(stbPolylines)

  let response;
  try {
    response = {
      'statusCode': 200,
      'body': JSON.stringify({
        stbPolylines: stbPolylines,
      })
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response
};
