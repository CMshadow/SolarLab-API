const Wiring = require('./infrastructure/wiring/wiring');
const Combinatorics = require('js-combinatorics');
const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.lambdaHandler = async (event) => {
  const userID = event.userID;
  const PVSpec = event.PVSpec;

  const panelLambdaParams = {
    FunctionName: 'solarlab-api-getPanelFunction-1J5QDXOK53RUW',
    LogType: 'Tail',
    Payload: JSON.stringify({
      userID: userID,
    }),
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
      userID: userID,
    }),
  };

  const inverterData = await lambda.invoke(inverterLambdaParams, (err, data)=>{
    if (err) throw err;
    else return data;
  }).promise();
  if (inverterData.FunctionError) {
    throw new Error('Error: Database error');
  }
  const allInverters = JSON.parse(inverterData.Payload);

  const panelInfo = PVSpec.map((aggregate) =>
    allPanels.find((elem) => elem.panelID === aggregate.panelID),
  );
  const totalPanels = PVSpec.reduce((acc, elem) => {
    acc + elem.panelCount;
  }, 0);

  const allResult = allInverters.map((inverter) => {
    const possiblePlans = Wiring.calculateWiringRestriction(
      Number(inverter.vdcmax), Number(inverter.vdcmin),
      Number(inverter.idcmax), Number(inverter.paco),
      Number(inverter.mpptLow), Number(inverter.mpptHigh),
      Number(inverter.mpptNum), Number(inverter.stringNum),
      Number(inverter.mpptIdcmax), Number(inverter.stringIdcmax),
      Number(panelInfo.voco), Number(panelInfo.bvoco),
      Number(panelInfo.bvmpo), Number(panelInfo.vmpo),
      Number(panelInfo.impo), Number(panelInfo.isco),
    );

    const mpptRes = [];
    const existMpptSetUp = new Set();
    possiblePlans.forEach((plan) => {
      plan.mpptSpec.forEach((spec) => {
        const obj = {
          panelPerString: plan.panelPerString,
          stringPerInverter: spec,
        };
        if (!existMpptSetUp.has(JSON.stringify(obj))) {
          mpptRes.push(obj);
          existMpptSetUp.add(JSON.stringify(obj));
        }
      });
    });

    const allSubPlans = PVSpec.map((roofSpec) =>
      Wiring.calculateWiring(roofSpec, roofSpec.panelCount, mpptRes)
        .filter((x) => x.length != 0),
    );

    const cp = Combinatorics.cartesianProduct(...allSubPlans);

    return {
      ...Wiring.calculateWiring(PVParams, totalPanels, possiblePlans),
      inverterID: inverter.inverterID,
    };
  });

  const validResult = allResult.filter((p) =>
    p.inverterSetUp !== undefined &&
    p.wasted !== undefined &&
    p.inverterSetUp.length !== 0,
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
