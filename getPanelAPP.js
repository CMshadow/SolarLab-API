const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.lambdaHandler = async (event, context, callback) => {
  console.log('==================EVENT===================');
  console.log(event);
  console.log('===================END====================');

  const userID = event.userID;

  const params = {
    TableName: 'SolarLab-UsersPanel',
    KeyConditionExpression: 'userID = :userID',
    ExpressionAttributeValues: {
      ':userID': { S: userID }
    }
  };
  if (event.attributes) {
    params.ProjectionExpression = event.attributes.join(', ');
  }

  let response = null;
  await dynamodb.query(params, (err, data) => {
    if (err) {
      throw new Error('Error: Database error');
    } else {
      if (data.Items.length === 0) {
        throw new Error('Error: User does not have any record');
      } else {
        response = data.Items.map(panel => {
          Object.keys(panel).forEach(k => {
            panel[k] = Object.values(panel[k])[0];
          });
          return panel;
        });
      }
    }
  }).promise();

  return response;
};
