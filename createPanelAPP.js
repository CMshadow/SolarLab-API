const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.lambdaHandler = async (event, context, callback) => {
  const userID = event.userID;
  const panelID = event.panelID;
  const panelName = event.panelName;
  const createdAt = event.createdAt;
  const updatedAt = event.updatedAt;
  const aisc = event.aisc;
  const bvoco = event.bvoco;
  const cost = event.cost;
  const description = event.description;
  const impo = event.impo;
  const isco = event.isco;
  const ixo = event.ixo;
  const ixxo = event.ixxo;
  const panelLength = event.panelLength;
  const panelWidth = event.panelWidth;
  const material = event.material;
  const parallelCells = event.parallelCells;
  const seriesCells = event.seriesCells;
  const vmpo = event.vmpo;
  const voco = event.voco;

  const params = {
    Item: {
      userID: { S: userID },
      panelID: { S: panelID },
      panelName: { S: panelName },
      createdAt: { S: createdAt },
      updatedAt: { S: updatedAt },
      aisc: { N: aisc },
      bvoco: { N: bvoco },
      cost: { N: cost },
      description: { S: description },
      impo: { N: impo },
      isco: { N: isco },
      ixo: { N: ixo },
      ixxo: { N: ixxo },
      panelLength: { N: panelLength },
      panelWidth: { N: panelWidth },
      material: { S: material },
      parallelCells: { N: parallelCells },
      seriesCells: { N: seriesCells },
      vmpo: { N: vmpo },
      voco: { N: voco }
    },
    TableName: 'SolarLab-UsersPanel'
  };

  const putItem = new Promise((resolve, reject) => {
    dynamodb.putItem(params, (err, data) => {
      if (err) {
        console.log('Error', err);
        reject(err);
      } else {
        console.log('Success', data);
        resolve('Insert data completed');
      }
    });
  });

  const result = await putItem;
  console.log(result);
  return result;
};
