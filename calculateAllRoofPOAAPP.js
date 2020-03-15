const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.lambdaHandler = async (event) => {
  const lambdaParams = {
    FunctionName: 'solarlab-api-findClosestUSWeatherFunction-14C5RBUKKU9VQ',
    LogType: 'Tail',
    Payload: JSON.stringify({
      longitude: event.longitude,
      latitude: event.latitude,
    }),
  };

  const closestWeatherFile = await lambda.invoke(lambdaParams, (err, data) => {
    if (err) throw err;
    else return data;
  }).promise();
  const tmy3Filename = JSON.parse(closestWeatherFile.Payload).filename;

  const tilts = event.tilts;
  const azimuths = event.azimuths;

  const requestData = {
    longitude: event.longitude,
    latitude: event.latitude,
    tilts: tilts,
    azimuths: azimuths,
    weatherFilename: tmy3Filename,
  };

  const params = {
    FunctionName:
      'solarlab-api-python-CalculateAllRoofPOAFunction-VF25YGOIQOBX',
    LogType: 'Tail',
    Payload: JSON.stringify(requestData),
  };

  const promise = await lambda.invoke(params, (err, data) => {
    if (err) throw err;
    else return data;
  }).promise();
  const allRoofPOA = JSON.parse(promise.Payload);
  console.log(allRoofPOA);

  return allRoofPOA;
};
