const FlatRoofPV = require('./infrastructure/pv/flatRoofPV');
const FoundLine = require('./infrastructure/line/foundLine');

exports.lambdaHandler = async (event, context) => {
  console.log(event.length);
  const requestData = event.map(elem => {
    const allKeepoutFoundLine = elem[1].map(kpt => FoundLine.fromPolyline(kpt));
    return [FoundLine.fromPolyline(elem[0]), allKeepoutFoundLine];
  });

  const panelLayout = [0, []];
  requestData.forEach(partialRoof => {
    const output = FlatRoofPV.calculateFlatRoofPanel(
      partialRoof[0], partialRoof[1], 'center', 360, 2, 1, 5, 0.1, 0, 30, 0
    );
    panelLayout[0] += output[0];
    panelLayout[1] = panelLayout[1].concat(output[1]);
  });

  let response;
  try {
    response = {
      statusCode: 200,
      body: JSON.stringify({
        panelLayout: panelLayout
      })
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
