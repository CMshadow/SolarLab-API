const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

const lambdaHandler = async (event, context, callback) => {
  const params = {
    TableName: 'SolarLab-UsersPanelData',
    IndexName: 'userID',
    KeyConditionExpression: '#userID = :userID',
    ProjectionExpression: 'panelID, panelName, panelLength, panelWidth',
    ExpressionAttributeNames: {
      '#userID': 'userID'
    },
    ExpressionAttributeValues: {
      ':userID': { S: '0000-0000-0000-0000' }
    }
  };

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

lambdaHandler();
