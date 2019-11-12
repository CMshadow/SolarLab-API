const FlatRoofPV = require('./infrastructure/pv/flatRoofPV');
const FoundLine = require('./infrastructure/line/foundLine');

const lambdaHandler = (event, context) => {
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
      panelsPerRow,
      obliquity
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

const testdata = {
  "data": [
    [
      {
        "points": [
          {
            "lon": -117.840144463903,
            "lat": 33.646292312424,
            "height": 0,
            "heightOffset": 0,
            "entityId": "0a8faa60-0588-11ea-8496-fd95a9d8b573",
            "name": "vertex",
            "color": {
              "red": 1,
              "green": 1,
              "blue": 1,
              "alpha": 1
            },
            "pixelSize": 15,
            "show": true,
            "render": true
          },
          {
            "lon": -117.840073745084,
            "lat": 33.646247478566,
            "height": 0,
            "heightOffset": 0,
            "entityId": "0a8faa61-0588-11ea-8496-fd95a9d8b573",
            "name": "vertex",
            "color": {
              "red": 1,
              "green": 1,
              "blue": 1,
              "alpha": 1
            },
            "pixelSize": 15,
            "show": true,
            "render": true
          },
          {
            "lon": -117.840020718541,
            "lat": 33.646306256601,
            "height": 0,
            "heightOffset": 0,
            "entityId": "0a8faa62-0588-11ea-8496-fd95a9d8b573",
            "name": "vertex",
            "color": {
              "red": 1,
              "green": 1,
              "blue": 1,
              "alpha": 1
            },
            "pixelSize": 15,
            "show": true,
            "render": true
          },
          {
            "lon": -117.840144463903,
            "lat": 33.646292312424,
            "height": 0,
            "heightOffset": 0,
            "entityId": "0a8faa60-0588-11ea-8496-fd95a9d8b573",
            "name": "vertex",
            "color": {
              "red": 1,
              "green": 1,
              "blue": 1,
              "alpha": 1
            },
            "pixelSize": 15,
            "show": true,
            "render": true
          }
        ],
        "entityId": "0a8faa63-0588-11ea-8496-fd95a9d8b573",
        "name": "polyline",
        "color": {
          "red": 1,
          "green": 1,
          "blue": 1,
          "alpha": 1
        },
        "show": true,
        "width": 4
      },
      []
    ]
  ],
  "azimuth": 180,
  "tilt": 10,
  "panelWidth": 1.956,
  "panelLength": 0.992,
  "rowSpace": 0.5,
  "colSpace": 0,
  "align": "center",
  "height": 5,
  "initArraySequenceNum": 1,
  "rowPerArray": 1,
  "panelsPerRow": 1,
  "pitchedRoofPolygon": {
    "entityId": "041d9480-0588-11ea-8496-fd95a9d8b573",
    "name": "roofPlane",
    "height": 0,
    "hierarchy": [
      -117.840171758022,
      33.646298311987,
      4.995,
      -117.840071637953,
      33.64623483852,
      6.995,
      -117.83999656565,
      33.646318053476,
      4.995
    ],
    "perPositionHeight": true,
    "extrudedHeight": 0,
    "material": {
      "red": 1,
      "green": 0.6470588235294118,
      "blue": 0,
      "alpha": 1
    },
    "outlineColor": {
      "red": 0,
      "green": 0,
      "blue": 0,
      "alpha": 1
    },
    "outlineWidth": 2,
    "shadow": 1,
    "show": true,
    "brng": -7.708820059600839,
    "obliquity": 13.647204257856696,
    "highestNode": [
      -117.840071637953,
      33.64623483852,
      7
    ],
    "lowestNode": [
      -117.840171758022,
      33.646298311987,
      5
    ],
    "edgesCollection": [
      {
        "startNode": 0,
        "endNode": 4,
        "clockWise": 1,
        "counterWise": 1,
        "type": "Hip",
        "startNodePara": {
          "id": "ffc44c80-0587-11ea-8496-fd95a9d8b573",
          "lon": -117.840171758022,
          "lat": 33.646298311987,
          "height": 5,
          "bound": 0,
          "children": [
            1,
            3,
            4
          ]
        },
        "endNodePara": {
          "id": "ffc44c84-0587-11ea-8496-fd95a9d8b573",
          "lon": -117.840071637953,
          "lat": 33.64623483852,
          "height": 7,
          "bound": 1,
          "children": [
            0,
            1,
            2,
            3
          ]
        }
      },
      {
        "startNode": 3,
        "endNode": 4,
        "clockWise": 1,
        "counterWise": 1,
        "type": "Hip",
        "startNodePara": {
          "id": "ffc44c83-0587-11ea-8496-fd95a9d8b573",
          "lon": -117.83999656565,
          "lat": 33.646318053476,
          "height": 5,
          "bound": 0,
          "children": [
            2,
            0,
            4
          ]
        },
        "endNodePara": {
          "id": "ffc44c84-0587-11ea-8496-fd95a9d8b573",
          "lon": -117.840071637953,
          "lat": 33.64623483852,
          "height": 7,
          "bound": 1,
          "children": [
            0,
            1,
            2,
            3
          ]
        }
      },
      {
        "startNode": 3,
        "endNode": 0,
        "clockWise": 0,
        "counterWise": 0,
        "type": "OuterEdge",
        "startNodePara": {
          "id": "ffc44c83-0587-11ea-8496-fd95a9d8b573",
          "lon": -117.83999656565,
          "lat": 33.646318053476,
          "height": 5,
          "bound": 0,
          "children": [
            2,
            0,
            4
          ]
        },
        "endNodePara": {
          "id": "ffc44c80-0587-11ea-8496-fd95a9d8b573",
          "lon": -117.840171758022,
          "lat": 33.646298311987,
          "height": 5,
          "bound": 0,
          "children": [
            1,
            3,
            4
          ]
        }
      }
    ]
  }
}

lambdaHandler(testdata);
