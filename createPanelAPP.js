const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.lambdaHandler = async (event, context) => {
  const userId = event.userId;
  const panelId = event.panelId;
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
      userId: { S: '0000-0000-0000-0000' },
      panelId: { S: '01' }
    },
    TableName: 'userPanel'
  };

  dynamodb.putItem(params, (err, data) => {
    if (err) console.log(err);
    else console.log(data);
  });
};
