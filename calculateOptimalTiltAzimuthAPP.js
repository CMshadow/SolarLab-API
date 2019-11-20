const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.lambdaHandler = async (event) => {
  const lambdaParams = {
    FunctionName: 'solarlab-api-findClosestUSWeatherFunction-14C5RBUKKU9VQ',
    LogType: 'Tail',
    Payload: JSON.stringify({
      longitude: event.longitude,
      latitude: event.latitude
    })
  };

  const closestWeatherFile = await lambda.invoke(lambdaParams, (err, data) => {
    if (err) throw err;
    else return data;
  }).promise();
  const tmy3Filename = JSON.parse(closestWeatherFile.Payload).filename;

  const tilts = [];
  for (let t = 0; t < 51; t += 2) {
    tilts.push(t);
  }
  const azimuths = [];
  if (event.latitude > 0) {
    for (let a = 125; a < 235; a += 5) {
      azimuths.push(a);
    }
  } else {
    for (let a = 0; a < 90; a += 5) {
      azimuths.push(a);
    }
    for (let a = 270; a < 360; a += 5) {
      azimuths.push(a);
    }
  }

  const requestData = [];
  for (let i = 0; i < tilts.length; i++) {
    for (let j = 0; j < azimuths.length; j += 15) {
      requestData.push({
        longitude: event.longitude,
        latitude: event.latitude,
        tilts: [tilts[i]],
        azimuths: azimuths.slice(j, j + 15),
        weatherFilename: tmy3Filename
      });
    }
  }
  const allPromise = [];

  requestData.forEach(data => {
    const params = {
      FunctionName:
        'solarlab-api-python-CalculateSubsetOptimalFunction-KNU5H0T9TG1D',
      LogType: 'Tail',
      Payload: JSON.stringify(data)
    };

    const invokePromise = lambda.invoke(params, (err, data) => {
      if (err) throw err;
      else return data;
    }).promise();

    allPromise.push(invokePromise);
  });

  const globalOptimal = await Promise.all(allPromise).then(values => {
    const subsetOptimal = values.map(v => {
      return JSON.parse(v.Payload);
    });
    const maxSetup = subsetOptimal.reduce((max, v) => {
      return max.totalPOA > v.totalPOA ? max : v;
    }, subsetOptimal[0]);
    return {
      optimalTilt: maxSetup.tilt,
      optimalAzimuth: maxSetup.azimuth
    };
  });

  return globalOptimal;
};
