const PitchedRoofPV = require('./infrastructure/pv/pitchedRoofPV');
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
  const pitchedRoofPolygon = event.pitchedRoofPolygon;
  const obliquity = pitchedRoofPolygon.obliquity;

  const convertedData = data.map(elem => {
    const allKeepoutFoundLine = elem[1].map(kpt => FoundLine.fromPolyline(kpt));
    return [FoundLine.fromPolyline(elem[0]), allKeepoutFoundLine];
  });

  const panelLayout = [];
  convertedData.forEach(partialRoof => {
    try {
      const output = PitchedRoofPV.calculatePitchedRoofPanel(
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
        panelsPerRow,
        obliquity,
        pitchedRoofPolygon
      );
      if (output !== null) {
        initArraySequenceNum = output[0];
        panelLayout.push(output[1]);
      } else {
        throw new Error('Error: The space is too small');
      }
    } catch (err) {
      console.log(err);
      throw new Error(`Error: ${err.toString()}`);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      panelLayout: panelLayout
    })
  };
};
