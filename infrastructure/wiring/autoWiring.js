const Inverter = require('../inverter/inverter');

const calculateWiringRestriction = (
  VdcMax, VdcMin, IdcMax, Paco, VMpptLow, VMpptHigh,
  Voco, Bvoco, Bvmpo, Vmpo, Impo, Isco
) => {
  const t = -20;
  const tPrime = 40;
  const Kv = Bvoco / Voco;
  const KvPrime = Bvmpo / Voco;

  const minPanelPerInverter = Math.ceil(Paco / (Impo * Vmpo));
  const maxPanelPerInverter = Math.floor(Paco * 1.2 / (Impo * Vmpo));

  const maxPanelPerString = Math.min(
    Math.floor(VdcMax / Voco / (1 + (t - 25) * Kv)),
    Math.floor(
      VMpptHigh / Vmpo / (1 + (t - 25) * KvPrime)
    )
  );
  const minPanelPerString = Math.ceil(
    VMpptLow / Vmpo / (1 + (tPrime - 25) * KvPrime)
  );

  const potentialPPSArray = Array.from(
    Array(maxPanelPerString - minPanelPerString + 1),
    (x, i) => i + minPanelPerString
  );

  const inverterPlans = [];
  potentialPPSArray.forEach(pps => {
    const Umax = Voco * pps;
    const Umin = Vmpo * pps;
    if (Umax < VdcMax && Umin > VdcMin) {
      const minParallelString = Math.floor(Paco * 0.95 / (pps * Impo * Vmpo));
      const maxParallelString = Math.floor(Paco * 1.2 / (pps * Impo * Vmpo));

      const potentialSPIArray = Array.from(
        Array(maxParallelString - minParallelString + 1),
        (x, i) => i + minParallelString
      );

      potentialSPIArray.forEach(spi => {
        if (spi * Isco <= IdcMax) {
          if (
            pps * spi >= minPanelPerInverter &&
            pps * spi <= maxPanelPerInverter
          ) {
            inverterPlans.push({
              panelPerString: pps,
              stringPerInverter: spi
            });
          }
        }
      });
    }
  });
  return inverterPlans;
};

const calculateWiring = (PVparams, totalPanels, wiringRestriction) => {
  // // 数板数
  // const totalPanels = Object.keys(PVcollection).reduce((acc, k) => {
  //   const totalPanelsOnRoof = PVcollection[k].reduce((acc2, partial) => {
  //     const totalPanelOnPartial = partial.reduce((acc3, array) => {
  //       return acc3 + array.length;
  //     }, 0);
  //     return acc2 + totalPanelOnPartial;
  //   }, 0);
  //   return acc + totalPanelsOnRoof;
  // }, 0);

  let filteredPlan = [];
  if (PVparams.mode === 'array') {
    for (const plan of wiringRestriction) {
      if (plan.panelPerString === PVparams.panelPerRow * PVparams.rowPerArray) {
        filteredPlan.push(plan);
      }
    }
  } else {
    filteredPlan = wiringRestriction;
  }

  if (filteredPlan.length === 0) return null;

  const sortedPlan = filteredPlan.sort((first, second) =>
    first.panelPerString * first.stringPerInverter >
    second.panelPerString * second.stringPerInverter
  );

  const DPtable = Array(sortedPlan.length).fill(0);

  DPtable.forEach((row, i) => {
    DPtable[i] = Array(totalPanels + 1).fill().map((x, i) => i);
  });

  DPtable.forEach((row, i) => {
    row.forEach((col, j) => {
      if (i === 0) {
        const numInverter = Math.floor(
          j /
          (sortedPlan[i].panelPerString * sortedPlan[i].stringPerInverter)
        );
        const plan = [];
        for (let count = 0; count < numInverter; count++) {
          plan.push(sortedPlan[i]);
        }
        DPtable[i][j] = {
          plan: plan,
          wasted: j - (
            numInverter * sortedPlan[i].panelPerString *
            sortedPlan[i].stringPerInverter
          )
        };
      }
      if (i !== 0) {
        if (
          j >=
          (sortedPlan[i].panelPerString * sortedPlan[i].stringPerInverter)
        ) {
          if (
            DPtable[i - 1][j].wasted <
            DPtable[i][j - (
              sortedPlan[i].panelPerString * sortedPlan[i].stringPerInverter
            )].wasted
          ) {
            DPtable[i][j] = {
              plan: [...DPtable[i - 1][j].plan],
              wasted: DPtable[i - 1][j].wasted
            };
          } else {
            const newPlan = [
              ...DPtable[i][j - (
                sortedPlan[i].panelPerString * sortedPlan[i].stringPerInverter
              )].plan
            ];
            newPlan.push(sortedPlan[i]);
            let newWasted = j;
            newPlan.forEach(plan => {
              newWasted -= (plan.panelPerString * plan.stringPerInverter);
            });
            DPtable[i][j] = {
              plan: newPlan,
              wasted: newWasted
            };
          }
        } else {
          DPtable[i][j] = {
            plan: [...DPtable[i - 1][j].plan],
            wasted: DPtable[i - 1][j].wasted
          };
        }
      }
    });
  });

  const solution = DPtable[sortedPlan.length - 1][totalPanels];
  return {
    inverterSetUp: solution.plan,
    wasted: solution.wasted
  };
};

exports.handler = async(event, context, callback) => {
  const PVParams = event.PVParams;
  const userID = event.userID
  var inverters_parameters = JSON.parse(event["body"])['inverters_parameters']
  var pVpanels_collection = JSON.parse(event["body"])['pVpanels_collection']
  console.log(inverters_parameters)

  var possible_solutions = [];

  console.log("Scan succeeded.");
  for(var i = 0; i < inverters_parameters.length; i++){
      var selected_inverter = inverters_parameters[i]
      var inverterName = inverters_parameters[i]["model"];
      var I_max = inverters_parameters[i]["idcmax"];
      var P_standard = inverters_parameters[i]["paco"];
      var V_max = inverters_parameters[i]["mpptHigh"];
      var V_min = inverters_parameters[i]["mpptLow"];
      if(parseFloat(P_standard)/(PVParams["model_full_info"]["impo"]*PVParams["model_full_info"]["vmpo"]) >= 2){
          var restricts_json = calculateWiringRestriction(PVParams["model_full_info"]["voco"], PVParams["model_full_info"]["isco"], PVParams["model_full_info"]["impo"]*PVParams["model_full_info"]["vmpo"], V_min, V_max, I_max, P_standard);
          var one_solution = wiring_calculation(PVParams, pVpanels_collection, restricts_json, inverterName, selected_inverter)

          if(one_solution !== undefined){
              possible_solutions.push(one_solution)
          }
      }
  }


  possible_solutions.sort(function(a, b) {
    return a.wasted - b.wasted  ||  a.solution.length - b.solution.length;
  });
  console.log('Final result')
  console.log(possible_solutions[0])

  var response = {
      "statusCode": 200,
      "headers":{
          "Access-Control-Allow-Origin": "*"
      },
      "body": JSON.stringify(possible_solutions[0]),
  };
  callback(null, response);
};
