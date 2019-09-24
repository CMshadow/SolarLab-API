const FoundLine = require('./infrastructure/line/foundLine.js');

exports.lambdaHandler = async (event, context) => {
  const originPolyline = FoundLine.fromPolyline(event.originPolyline);
  const stbDist = event.stbDist;
  const direction = event.direction;
  console.log(originPolyline)

  let stbPolylines = [];
  if (direction === 'inside') {
    stbPolylines = originPolyline.makeSetbackPolylineInside(stbDist);
  } else {
    stbPolylines = originPolyline.makeSetbackPolylineOutside(stbDist);
  }
  console.log(stbPolylines)

  const response = {
    'statusCode': 200,
    'body': JSON.stringify({
      stbPolylines: stbPolylines,
    })
  }
  return response;
};
