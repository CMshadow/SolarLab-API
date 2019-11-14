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
      initArraySequenceNum = output[0];
      panelLayout.push(output[1]);
    } catch (err) {
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
// 
// const testdata = {
//   "data": [
//     [
//       {
//         "points": [
//           {
//             "lon": -117.840000372847,
//             "lat": 33.646177611086,
//             "height": 0,
//             "heightOffset": 0,
//             "entityId": "d05a7d10-0646-11ea-9ca5-37051960dd87",
//             "name": "vertex",
//             "color": {
//               "red": 1,
//               "green": 1,
//               "blue": 1,
//               "alpha": 1
//             },
//             "pixelSize": 15,
//             "show": true,
//             "render": true
//           },
//           {
//             "lon": -117.840069422159,
//             "lat": 33.646221712615,
//             "height": 0,
//             "heightOffset": 0,
//             "entityId": "d05a7d11-0646-11ea-9ca5-37051960dd87",
//             "name": "vertex",
//             "color": {
//               "red": 1,
//               "green": 1,
//               "blue": 1,
//               "alpha": 1
//             },
//             "pixelSize": 15,
//             "show": true,
//             "render": true
//           },
//           {
//             "lon": -117.840123940553,
//             "lat": 33.646163804267,
//             "height": 0,
//             "heightOffset": 0,
//             "entityId": "d05a7d12-0646-11ea-9ca5-37051960dd87",
//             "name": "vertex",
//             "color": {
//               "red": 1,
//               "green": 1,
//               "blue": 1,
//               "alpha": 1
//             },
//             "pixelSize": 15,
//             "show": true,
//             "render": true
//           },
//           {
//             "lon": -117.840000372847,
//             "lat": 33.646177611086,
//             "height": 0,
//             "heightOffset": 0,
//             "entityId": "d05a7d10-0646-11ea-9ca5-37051960dd87",
//             "name": "vertex",
//             "color": {
//               "red": 1,
//               "green": 1,
//               "blue": 1,
//               "alpha": 1
//             },
//             "pixelSize": 15,
//             "show": true,
//             "render": true
//           }
//         ],
//         "entityId": "d05a7d13-0646-11ea-9ca5-37051960dd87",
//         "name": "polyline",
//         "color": {
//           "red": 1,
//           "green": 1,
//           "blue": 1,
//           "alpha": 1
//         },
//         "show": true,
//         "width": 4
//       },
//       []
//     ]
//   ],
//   "azimuth": 180,
//   "tilt": 10,
//   "panelWidth": 1.602,
//   "panelLength": 1.061,
//   "rowSpace": 0.5,
//   "colSpace": 0,
//   "align": "center",
//   "height": 5,
//   "initArraySequenceNum": 1,
//   "rowPerArray": 1,
//   "panelsPerRow": 1,
//   "pitchedRoofPolygon": {
//     "entityId": "c94bd912-0646-11ea-9ca5-37051960dd87",
//     "name": "roofPlane",
//     "height": 0,
//     "hierarchy": [
//       -117.839973176427,
//       33.646171575967,
//       4.995,
//       -117.840071329328,
//       33.646234265852,
//       6.995,
//       -117.840148826625,
//       33.646151949754,
//       4.995
//     ],
//     "perPositionHeight": true,
//     "extrudedHeight": 0,
//     "material": {
//       "red": 1,
//       "green": 0.6470588235294118,
//       "blue": 0,
//       "alpha": 1
//     },
//     "outlineColor": {
//       "red": 0,
//       "green": 0,
//       "blue": 0,
//       "alpha": 1
//     },
//     "outlineWidth": 2,
//     "shadow": 1,
//     "show": true,
//     "brng": 172.35550719925175,
//     "obliquity": 13.84096043280212,
//     "highestNode": [
//       -117.840071329328,
//       33.646234265852,
//       7
//     ],
//     "lowestNode": [
//       -117.839973176427,
//       33.646171575967,
//       5
//     ],
//     "edgesCollection": [
//       {
//         "startNode": 2,
//         "endNode": 4,
//         "clockWise": 1,
//         "counterWise": 1,
//         "type": "Hip",
//         "startNodePara": {
//           "id": "c3f608a2-0646-11ea-9ca5-37051960dd87",
//           "lon": -117.839973176427,
//           "lat": 33.646171575967,
//           "height": 5,
//           "bound": 0,
//           "children": [
//             1,
//             3,
//             4
//           ]
//         },
//         "endNodePara": {
//           "id": "c3f656c0-0646-11ea-9ca5-37051960dd87",
//           "lon": -117.840071329328,
//           "lat": 33.646234265852,
//           "height": 7,
//           "bound": 1,
//           "children": [
//             0,
//             1,
//             2,
//             3
//           ]
//         }
//       },
//       {
//         "startNode": 1,
//         "endNode": 4,
//         "clockWise": 1,
//         "counterWise": 1,
//         "type": "Hip",
//         "startNodePara": {
//           "id": "c3f608a1-0646-11ea-9ca5-37051960dd87",
//           "lon": -117.840148826625,
//           "lat": 33.646151949754,
//           "height": 5,
//           "bound": 0,
//           "children": [
//             0,
//             2,
//             4
//           ]
//         },
//         "endNodePara": {
//           "id": "c3f656c0-0646-11ea-9ca5-37051960dd87",
//           "lon": -117.840071329328,
//           "lat": 33.646234265852,
//           "height": 7,
//           "bound": 1,
//           "children": [
//             0,
//             1,
//             2,
//             3
//           ]
//         }
//       },
//       {
//         "startNode": 1,
//         "endNode": 2,
//         "clockWise": 0,
//         "counterWise": 0,
//         "type": "OuterEdge",
//         "startNodePara": {
//           "id": "c3f608a1-0646-11ea-9ca5-37051960dd87",
//           "lon": -117.840148826625,
//           "lat": 33.646151949754,
//           "height": 5,
//           "bound": 0,
//           "children": [
//             0,
//             2,
//             4
//           ]
//         },
//         "endNodePara": {
//           "id": "c3f608a2-0646-11ea-9ca5-37051960dd87",
//           "lon": -117.839973176427,
//           "lat": 33.646171575967,
//           "height": 5,
//           "bound": 0,
//           "children": [
//             1,
//             3,
//             4
//           ]
//         }
//       }
//     ]
//   }
// }
//
// console.log(lambdaHandler(testdata))
