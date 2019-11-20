const AWS = require('aws-sdk');
const Coordinate = require('./infrastructure/point/coordinate');

AWS.config.update({ region: 'us-west-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.lambdaHandler = async (event, context, callback) => {
  console.log('==================EVENT===================');
  console.log(event);
  console.log('===================END====================');

  const targetLon = event.longitude;
  const targetLat = event.latitude;
  const targetCor = new Coordinate(targetLon, targetLat, 0);

  const params = {
    TableName: 'US-tmy3-index'
  };

  const scanResults = [];
  let items;
  try {
    do {
      items = await dynamodb.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== 'undefined');
  } catch (err) {
    throw new Error('Error: Database Error');
  }

  const min = scanResults.reduce((min, v) => {
    return Coordinate.surfaceDistance(
      targetCor, new Coordinate(v.lon, v.lat, 0)
    ) < Coordinate.surfaceDistance(
      targetCor, new Coordinate(min.lon, min.lat, 0)
    ) ? v : min;
  }, scanResults[0]);

  return min;
};
