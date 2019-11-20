const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-west-1' });
const lambda = new AWS.Lambda();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.lambdaHandler = async (event, context, callback) => {
  console.log('==================EVENT===================');
  console.log(event);
  console.log('===================END====================');

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

  const tmy3lon = JSON.parse(closestWeatherFile.Payload).lon;
  const tmy3lat = JSON.parse(closestWeatherFile.Payload).lat;
  const DBparams = {
    TableName: 'US-OptimalTiltAzimuth',
    KeyConditionExpression: 'longitude = :longitude and latitude = :latitude',
    ExpressionAttributeValues: {
      ':longitude': tmy3lon,
      ':latitude': tmy3lat
    }
  };

  const result = await dynamodb.query(DBparams).promise();

  return {
    optimalTilt: JSON.parse(result.Items[0].optimalTilt),
    optimalAzimuth: JSON.parse(result.Items[0].optimalAzimuth)
  };
};
