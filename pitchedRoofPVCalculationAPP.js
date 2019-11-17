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

// const testdata = {
//   "data": [
//     [
//       {
//         "points": [
//           {
//             "lon": -117.841111544839,
//             "lat": 33.646883309727,
//             "height": 0,
//             "heightOffset": 0,
//             "entityId": "8bf147c5-08e5-11ea-a899-25a0c1dbcead",
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
//             "lon": -117.841128771796,
//             "lat": 33.646988197568,
//             "height": 0,
//             "heightOffset": 0,
//             "entityId": "8bf147c6-08e5-11ea-a899-25a0c1dbcead",
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
//             "lon": -117.841244553402,
//             "lat": 33.647060149884,
//             "height": 0,
//             "heightOffset": 0,
//             "entityId": "8bf147c7-08e5-11ea-a899-25a0c1dbcead",
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
//             "lon": -117.841370181174,
//             "lat": 33.647044039235,
//             "height": 0,
//             "heightOffset": 0,
//             "entityId": "8bf147c8-08e5-11ea-a899-25a0c1dbcead",
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
//             "lon": -117.841111544839,
//             "lat": 33.646883309727,
//             "height": 0,
//             "heightOffset": 0,
//             "entityId": "8bf147c5-08e5-11ea-a899-25a0c1dbcead",
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
//         "entityId": "8bf147c9-08e5-11ea-a899-25a0c1dbcead",
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
//   "azimuth": 90,
//   "tilt": 10,
//   "panelWidth": 1.602,
//   "panelLength": 1.061,
//   "rowSpace": 2.1,
//   "colSpace": 1,
//   "align": "center",
//   "height": 5,
//   "initArraySequenceNum": 1,
//   "rowPerArray": 2,
//   "panelsPerRow": 3,
//   "pitchedRoofPolygon": {
//     "entityId": "3759bb02-08e2-11ea-a899-25a0c1dbcead",
//     "name": "roofPlane",
//     "height": 0,
//     "hierarchy": [
//       -117.841097349062,
//       33.646863264877,
//       4.995,
//       -117.84111868157,
//       33.646993149747,
//       6.995,
//       -117.841241720996,
//       33.647069612413,
//       6.995,
//       -117.841397288443,
//       33.647049662249,
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
//     "brng": 216.74200617140025,
//     "obliquity": 10.89363137036721,
//     "highestNode": [
//       -117.84111868157,
//       33.646993149747,
//       7
//     ],
//     "lowestNode": [
//       -117.841097349062,
//       33.646863264877,
//       5
//     ],
//     "edgesCollection": [
//       {
//         "startNode": 2,
//         "endNode": 5,
//         "clockWise": 1,
//         "counterWise": 1,
//         "type": "Hip",
//         "startNodePara": {
//           "id": "34dcad12-08e2-11ea-a899-25a0c1dbcead",
//           "lon": -117.841097349062,
//           "lat": 33.646863264877,
//           "height": 5,
//           "bound": 0,
//           "children": [
//             1,
//             3,
//             5
//           ]
//         },
//         "endNodePara": {
//           "id": "34dcad15-08e2-11ea-a899-25a0c1dbcead",
//           "lon": -117.84111868157,
//           "lat": 33.646993149747,
//           "height": 7,
//           "bound": 1,
//           "children": [
//             2,
//             3,
//             4
//           ]
//         }
//       },
//       {
//         "startNode": 4,
//         "endNode": 5,
//         "clockWise": 1,
//         "counterWise": 1,
//         "type": "Ridge",
//         "startNodePara": {
//           "id": "34dcad14-08e2-11ea-a899-25a0c1dbcead",
//           "lon": -117.841241720996,
//           "lat": 33.647069612413,
//           "height": 7,
//           "bound": 1,
//           "children": [
//             0,
//             1,
//             5
//           ]
//         },
//         "endNodePara": {
//           "id": "34dcad15-08e2-11ea-a899-25a0c1dbcead",
//           "lon": -117.84111868157,
//           "lat": 33.646993149747,
//           "height": 7,
//           "bound": 1,
//           "children": [
//             2,
//             3,
//             4
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
//           "id": "34dcad11-08e2-11ea-a899-25a0c1dbcead",
//           "lon": -117.841397288443,
//           "lat": 33.647049662249,
//           "height": 5,
//           "bound": 0,
//           "children": [
//             0,
//             2,
//             4
//           ]
//         },
//         "endNodePara": {
//           "id": "34dcad14-08e2-11ea-a899-25a0c1dbcead",
//           "lon": -117.841241720996,
//           "lat": 33.647069612413,
//           "height": 7,
//           "bound": 1,
//           "children": [
//             0,
//             1,
//             5
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
//           "id": "34dcad11-08e2-11ea-a899-25a0c1dbcead",
//           "lon": -117.841397288443,
//           "lat": 33.647049662249,
//           "height": 5,
//           "bound": 0,
//           "children": [
//             0,
//             2,
//             4
//           ]
//         },
//         "endNodePara": {
//           "id": "34dcad12-08e2-11ea-a899-25a0c1dbcead",
//           "lon": -117.841097349062,
//           "lat": 33.646863264877,
//           "height": 5,
//           "bound": 0,
//           "children": [
//             1,
//             3,
//             5
//           ]
//         }
//       }
//     ]
//   }
// }
// console.log(lambdaHandler(testdata))
