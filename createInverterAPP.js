const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-1' });
const dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

exports.lambdaHandler = async (event, context, callback) => {
  const userID = event.userID;
  const inverterID = event.inverterID;
  const inverterName = event.inverterName;
  const createdAt = event.createdAt;
  const updatedAt = event.updatedAt;
  const idcmax = event.idcmax;
  const mpptHigh = event.mpptHigh;
  const mpptLow = event.mpptLow;
  const cost = event.cost;
  const description = event.description;
  const paco = event.paco;
  const pdco = event.pdco;
  const pnt = event.pnt;
  const pso = event.pso;
  const vac = event.vac;
  const vdcmax = event.vdcmax;
  const vdcmin = event.vdcmin;
  const vdco = event.vdco;
  const mpptNum = event.mpptNum;
  const stringNum = event.stringNum;
  const mpptIdcmax = event.mpptIdcmax;
  const stringIdcmax = event.stringIdcmax;

  const params = {
    Item: {
      userID: { S: userID },
      inverterID: { S: inverterID },
      inverterName: { S: inverterName },
      createdAt: { S: createdAt },
      updatedAt: { S: updatedAt },
      idcmax: { N: idcmax },
      mpptHigh: { N: mpptHigh },
      mpptLow: { N: mpptLow },
      cost: { N: cost },
      description: { S: description },
      paco: { N: paco },
      pdco: { N: pdco },
      pnt: { N: pnt },
      pso: { N: pso },
      vac: { N: vac },
      vdcmax: { N: vdcmax },
      vdcmin: { N: vdcmin },
      vdco: { N: vdco },
      mpptNum: { N: mpptNum },
      stringNum: { N: stringNum },
      mpptIdcmax: { N: mpptIdcmax },
      stringIdcmax: { N: stringIdcmax }
    },
    TableName: 'SolarLab-UsersInverter'
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
