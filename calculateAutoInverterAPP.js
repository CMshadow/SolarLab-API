const Wiring = require('./infrastructure/wiring/wiring');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.lambdaHandler = async (event) => {
  const panelID = event.panelID;
  const userID = event.userID;
  const totalPanels = event.totalPanels;
  const PVParams = event.PVParams;

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
  if (inverterData.FunctionError) {
    throw new Error('Error: Database error');
  }
  const allInverters = JSON.parse(inverterData.Payload);

  const panelInfo = allPanels.reduce((match, val) => {
    return val.panelID === panelID ? val : match;
  }, allPanels[0]);

  const allResult = allInverters.map(inverter => {
    const possiblePlans = Wiring.calculateWiringRestriction(
      Number(inverter.vdcmax), Number(inverter.vdcmin), Number(inverter.idcmax),
      Number(inverter.paco), Number(inverter.mpptLow), Number(inverter.mpptHigh),
      Number(panelInfo.voco), Number(panelInfo.bvoco), Number(panelInfo.bvmpo),
      Number(panelInfo.vmpo), Number(panelInfo.impo), Number(panelInfo.isco)
    );
    return {
      ...Wiring.calculateWiring(PVParams, totalPanels, possiblePlans),
      inverterID: inverter.inverterID
    };
  });
  const validResult = allResult.filter(p =>
    p.inverterSetUp !== undefined &&
    p.wasted !== undefined &&
    p.inverterSetUp.length !== 0
  );
  validResult.sort((first, second) => {
    if (first.wasted > second.wasted) return 1;
    if (first.wasted < second.wasted) return -1;
    if (first.inverterSetUp.length > second.inverterSetUp.length) return 1;
    if (first.inverterSetUp.length < second.inverterSetUp.length) return -1;
  });
  console.log(validResult);
  if (validResult.length === 0) {
    throw new Error('Error: No matching Inverters');
  } else {
    return JSON.stringify(validResult[0]);
  }
};
