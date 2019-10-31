const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.lambdaHandler = async (event, context, callback) => {
  const userID = event.userID;

  const params = {
    TableName: 'SolarLab-UsersPanel',
    KeyConditionExpression: 'userID = :userID',
    ExpressionAttributeValues: {
      ':userID': { S: userID }
    }
  };
  if (event.attributes !== '') params.ProjectionExpression = event.attributes;

  const queryItems = new Promise((resolve, reject) => {
    dynamodb.query(params, (err, data) => {
      if (err) {
        console.log('Error', err);
        reject(err);
      } else {
        const formedData = data.Items.map(panel => {
          Object.keys(panel).forEach(k => {
            panel[k] = Object.values(panel[k])[0];
          });
          return panel;
        });
        console.log('Success', formedData);
        resolve(data);
      }
    });
  });

  const result = await queryItems;
  return result;
};
