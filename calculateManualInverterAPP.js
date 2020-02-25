const Wiring = require('./infrastructure/wiring/wiring');
const AWS = require('aws-sdk');
const Combinatorics = require('js-combinatorics');
const lambda = new AWS.Lambda();

exports.lambdaHandler = async (event) => {
  const panelID = event.panelID;
  const inverterID = event.inverterID;
  const userID = event.userID;
  const PVSpec = JSON.parse(event.PVSpec);
  const totalPanels = PVSpec.reduce((acc, elem) => acc + elem.panelCount, 0);

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

  const allInverters = JSON.parse(inverterData.Payload);

  const panelInfo = allPanels.reduce((match, val) => {
    return val.panelID === panelID ? val : match;
  }, allPanels[0]);

  const inverterInfo = allInverters.reduce((match, val) => {
    return val.inverterID === inverterID ? val : match;
  }, allPanels[0]);

  const res = Wiring.calculateWiringRestriction(
    Number(inverterInfo.vdcmax), Number(inverterInfo.vdcmin),
    Number(inverterInfo.idcmax), Number(inverterInfo.paco),
    Number(inverterInfo.mpptLow), Number(inverterInfo.mpptHigh),
    Number(inverterInfo.mpptNum), Number(inverterInfo.stringNum),
    Number(inverterInfo.mpptIdcmax), Number(inverterInfo.stringIdcmax),
    Number(panelInfo.voco), Number(panelInfo.bvoco), Number(panelInfo.bvmpo),
    Number(panelInfo.vmpo), Number(panelInfo.impo), Number(panelInfo.isco),
  );
  const mpptRes = {};
  res.forEach((plan) => {
    plan.mpptSpec.forEach((spec) => {
      const obj = {
        panelPerString: plan.panelPerString,
        stringPerInverter: spec,
      };
      if (JSON.stringify(obj) in mpptRes) {
        mpptRes[JSON.stringify(obj)] += 1;
      } else {
        mpptRes[JSON.stringify(obj)] = 1;
      }
    });
  });
  console.log(mpptRes);
  const overallInverterPlan =
    Wiring.calculateWiring(PVSpec[0], totalPanels, res);
  const overallInverterDict = overallInverterPlan.map((plan) => {
    const mpptDict = {};
    plan.map((inverter) => {
      inverter.mpptSpec.forEach((spec) => {
        const obj = {
          panelPerString: inverter.panelPerString,
          stringPerInverter: spec,
        };
        if (JSON.stringify(obj) in mpptDict) {
          mpptDict[JSON.stringify(obj)] += 1;
        } else {
          mpptDict[JSON.stringify(obj)] = 1;
        }
      });
    });
    return JSON.stringify(mpptDict);
  });

  const allSubPlans = PVSpec.map((roofSpec) =>
    Wiring.calculateWiring(
      roofSpec, roofSpec.panelCount,
      Object.keys(mpptRes).map((obj) => JSON.parse(obj)),
    ).filter((x) => x.length != 0),
  );

  const cp = Combinatorics.cartesianProduct(...allSubPlans).toArray();
  const practicalPlan = cp.map((combo) => {
    const dic = {};
    combo.forEach((roof) => {
      roof.forEach((mppt) => {
        if (JSON.stringify(mppt) in dic) {
          dic[JSON.stringify(mppt)] += 1;
        } else {
          dic[JSON.stringify(mppt)] = 1;
        }
      });
    });
    return {dic: dic, origin: combo};
  }).filter((obj) =>
    overallInverterDict.includes(JSON.stringify(obj.dic)),
  ).map((obj) => {
    return {
      'mpptPlan': obj.origin.map((roof) =>
        roof.map((plan) => JSON.stringify(plan)),
      ),
      'inverterPlan': overallInverterPlan[
        overallInverterDict.indexOf(JSON.stringify(obj.dic))
      ],
    };
  }).map((obj) => {
    obj.inverterPlan.forEach((inverter) => {
      const layout = [];
      inverter.mpptSpec.forEach((mppt) => {
        const matchQuery = {
          panelPerString: inverter.panelPerString,
          stringPerInverter: mppt,
        };
        for (let i = 0; i < obj.mpptPlan.length; i++) {
          const roof = obj.mpptPlan[i];
          if (roof.includes(JSON.stringify(matchQuery))) {
            roof.splice(roof.indexOf(JSON.stringify(matchQuery)), 1);
            layout.push(i);
            break;
          }
        };
      });
      inverter.layout = layout;
    });
    return obj.inverterPlan;
  });

  const result = practicalPlan.sort((a, b) =>
    b.reduce((acc, val) =>
      acc += val.panelPerString * val.stringPerInverter, 0,
    ) - a.reduce((acc, val) =>
      acc += val.panelPerString * val.stringPerInverter, 0,
    ),
  )[0];


  if (result.length == 0) {
    throw new Error('Error: The Inverter does not fit');
  } else {
    return JSON.stringify({
      inverterSetUp: result,
      inverterID: inverterInfo.inverterID,
    });
  }
};
