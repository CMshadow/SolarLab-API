const FoundLine = require('./infrastructure/line/foundLine');

exports.lambdaHandler = async (event, context) => {
  const originPolylines = event.roofFoundLines.map(elem =>
    (FoundLine.fromPolyline(elem))
  );
  const stbDists = event.roofStbs;

  const stbPolylines = [];
  originPolylines.forEach((originPolyline, index) => {
    if (stbDists[index].filter(e => e === 0).length === stbDists[index].length) {
      stbPolylines.push([originPolyline]);
    } else {
      stbPolylines.push(
        originPolyline.makeSetbackPolylineInside(stbDists[index])
      );
    }
  });
  console.log(stbPolylines[0][0].points);

  let response;
  try {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        stbPolylines: stbPolylines
      })
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
