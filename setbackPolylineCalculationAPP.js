const FoundLine = require('./infrastructure/line/foundLine');

exports.lambdaHandler = async (event, context) => {
  console.log(event);
  const originPolylines = event.originPolylines.map((elem) =>
    (FoundLine.fromPolyline(elem)),
  );
  const stbDists = event.stbDists;
  const direction = event.direction;

  const stbPolylines = [];
  originPolylines.forEach((originPolyline, index) => {
    if (stbDists[index] === 0) {
      stbPolylines.push([originPolyline]);
    } else {
      if (direction === 'inside') {
        stbPolylines.push(
          originPolyline.makeSetbackPolylineInside(stbDists[index]),
        );
      } else {
        stbPolylines.push(
          originPolyline.makeSetbackPolylineOutside(stbDists[index]),
        );
      }
    }
  });
  console.log(stbPolylines);

  let response;
  try {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        stbPolylines: stbPolylines,
      }),
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
