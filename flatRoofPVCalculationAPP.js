const FlatRoofPV = require('./infrastructure/pv/flatRoofPV');
const FoundLine = require('./infrastructure/line/foundLine');

exports.lambdaHandler = async (event, context) => {
  const data = event.data;
  const azimuth = event.azimuth;
  const tilt = event.tilt;
  const panelWidth = event.panelWidth;
  const panelLength = event.panelLength;
  const rowSpace = event.rowSpace;
  const colSpace = event.colSpace;
  const align = event.align;
  const height = event.height;
  let initArraySequenceNum = event.initArraySequenceNum;
  const rowPerArray = event.rowPerArray;
  const panelsPerRow = event.panelsPerRow;

  const convertedData = data.map(elem => {
    const allKeepoutFoundLine = elem[1].map(kpt => FoundLine.fromPolyline(kpt));
    return [FoundLine.fromPolyline(elem[0]), allKeepoutFoundLine];
  });

  const panelLayout = [];
  convertedData.forEach(partialRoof => {
    const output = FlatRoofPV.calculateFlatRoofPanel(
      partialRoof[0],
      partialRoof[1],
      align,
      azimuth,
      panelWidth,
      panelLength,
      height,
      rowSpace,
      colSpace,
      tilt,
      initArraySequenceNum,
      rowPerArray,
      panelsPerRow
    );
    initArraySequenceNum = output[0];
    panelLayout.push(output[1]);
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
