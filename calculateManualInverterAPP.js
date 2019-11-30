const Wiring = require('./infrastructure/wiring/wiring');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.lambdaHandler = async (event) => {
  const panelID = event.panelID;
  const inverterID = event.inverterID;
  const userID = event.userID;
  const totalPanels = event.totalPanels;
  const PVParams = JSON.parse(event.PVParams);

  const panelLambdaParams = {
    FunctionName: 'solarlab-api-getPanelFunction-1J5QDXOK53RUW',
    LogType: 'Tail',
    Payload: JSON.stringify({
      userID: userID
    })
  };

  const panelData = await lambda.invoke(panelLambdaParams, (err, data) => {
    if (err) throw err;
    else return data;
  }).promise();
  const allPanels = JSON.parse(panelData.Payload);

  const inverterLambdaParams = {
    FunctionName: 'solarlab-api-getInverterFunction-JDZE9IXKHLK9',
    LogType: 'Tail',
    Payload: JSON.stringify({
      userID: userID
    })
  };

  const inverterData = await lambda.invoke(inverterLambdaParams, (err, data) => {
    if (err) throw err;
    else return data;
  }).promise();
  const allInverters = JSON.parse(inverterData.Payload);

  const panelInfo = allPanels.reduce((match, val) => {
    return val.panelID === panelID ? val : match;
  }, allPanels[0]);

  const inverterInfo = allInverters.reduce((match, val) => {
    return val.inverterID === inverterID ? val : match;
  }, allPanels[0]);
  const possiblePlan = Wiring.calculateWiringRestriction(
    Number(inverterInfo.vdcmax), Number(inverterInfo.vdcmin),
    Number(inverterInfo.idcmax), Number(inverterInfo.paco),
    Number(inverterInfo.mpptLow), Number(inverterInfo.mpptHigh),
    Number(panelInfo.voco), Number(panelInfo.bvoco), Number(panelInfo.bvmpo),
    Number(panelInfo.vmpo), Number(panelInfo.impo), Number(panelInfo.isco)
  );
  const result = Wiring.calculateWiring(PVParams, totalPanels, possiblePlan);
  if (result === null) {
    throw new Error('Error: The Inverter does not fit');
  } else {
    return {
      ...result,
      inverterID: inverterInfo.inverterID
    };
  }
};
