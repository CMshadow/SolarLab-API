const AWS = require('aws-sdk');
const lambda = new AWS.Lambda();

exports.lambdaHandler = async (event) => {
  console.log(typeof(event.PVSpec));
  console.log(event.PVSpec);
  const userID = event.userID;

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

  // const panelInfo = PVSpec.map((aggregate) =>
  //   allPanels.find((elem) => elem.panelID === aggregate.panelID),
  // );

  const globalOptimal = await Promise.all(
    allInverters.map(async (inverter) => {
      const params = {
        FunctionName:
          'solarlab-api-calculateManualInverterFunction-1FEN2957E00HZ',
        LogType: 'Tail',
        Payload: JSON.stringify({
          ...event,
          PVSpec: event.PVSpec,
          inverterID: inverter.inverterID,
        }),
      };
      return await lambda.invoke(params).promise();
    }),
  ).then((values) => {
    const subsetOptimal = values.filter((v) => !v.FunctionError).map((v) => {
      return JSON.parse(v.Payload);
    });
    if (subsetOptimal.length == 0) {
      throw new Error('Error: No Inverter can fit');
    } else {
      const globalOptimal = subsetOptimal.reduce((best, val) =>
        val.connectedCount > best.connectedCount ? val : best
      , subsetOptimal[0]);
      return globalOptimal;
    }
  });
  console.log(typeof(globalOptimal));
  return globalOptimal;
};
