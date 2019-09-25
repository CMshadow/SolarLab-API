const FoundLine = require('./infrastructure/line/foundLine');

exports.lambdaHandler = async (event, context) => {
  console.log(event)
  const originPolyline = FoundLine.fromPolyline(event.originPolyline);
  const stbDist = event.stbDist;
  const direction = event.direction;

  let stbPolylines = [];
  if (stbDist === 0) {
    stbPolylines = [originPolyline];
  } else {
    if (direction === 'inside') {
      stbPolylines = originPolyline.makeSetbackPolylineInside(stbDist);
    } else {
      stbPolylines = originPolyline.makeSetbackPolylineOutside(stbDist);
    }
  }
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
