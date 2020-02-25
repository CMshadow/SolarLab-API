const calculateWiringRestriction = (
  VdcMax, VdcMin, IdcMax, Paco, VMpptLow, VMpptHigh, MpptNum, StringNum,
  MpptIdcmax, StringIdcmax,
  Voco, Bvoco, Bvmpo, Vmpo, Impo, Isco,
) => {
  const t = -20;
  const tPrime = 40;
  const Kv = Bvoco / Voco;
  const KvPrime = Bvmpo / Voco;

  const minPanelPerInverter = Math.ceil(Paco / (Impo * Vmpo));
  const maxPanelPerInverter = Math.floor(Paco * 1.2 / (Impo * Vmpo));

  const maxPanelPerString = Math.min(
    Math.floor(VdcMax / Voco / (1 + (t - 25) * Kv)),
    Math.floor(VMpptHigh / Vmpo / (1 + ((t - 25) * KvPrime))),
  );
  const minPanelPerString = Math.ceil(
    VMpptLow / Vmpo / (1 + (tPrime - 25) * KvPrime),
  );

  if (maxPanelPerString < minPanelPerString) return [];

  const potentialPPSArray = Array.from(
    Array(maxPanelPerString - minPanelPerString + 1),
    (x, i) => i + minPanelPerString,
  );

  const inverterPlans = [];
  potentialPPSArray.forEach((pps) => {
    const Umax = Voco * pps;
    const Umin = Vmpo * pps;
    if (Umax < VdcMax && Umin > VdcMin) {
      const minParallelString = Math.floor(Paco * 0.95 / (pps * Impo * Vmpo));
      const maxParallelString = Math.floor(Paco * 1.2 / (pps * Impo * Vmpo));

      const potentialSPIArray = Array.from(
        Array(maxParallelString - minParallelString + 1),
        (x, i) => i + minParallelString,
      );

      potentialSPIArray.forEach((spi) => {
        const mpptSetup = Array.from(
          Array(MpptNum),
          (x) => Array.from(Array(StringNum / MpptNum), (y) => 0),
        );

        let remainingString = spi;
        let currentMpptIndex = 0;
        while (remainingString > 0) {
          if (currentMpptIndex >= MpptNum) {
            break;
          }
          const totalConnectedStringNum =
            mpptSetup[currentMpptIndex].reduce((acc, val) => acc + val, 0);

          if (totalConnectedStringNum * Isco <= MpptIdcmax) {
            const minLoadPortIndex = mpptSetup[currentMpptIndex]
              .reduce((minInd, val, i) =>
                val < mpptSetup[currentMpptIndex][minInd] ? i : minInd
              , 0);
            if (
              (mpptSetup[currentMpptIndex][minLoadPortIndex] + 1) * Isco <=
              StringIdcmax && (totalConnectedStringNum + 1) * Isco <= MpptIdcmax
            ) {
              mpptSetup[currentMpptIndex][minLoadPortIndex] += 1;
              remainingString -= 1;
            } else {
              currentMpptIndex += 1;
            }
          } else {
            currentMpptIndex += 1;
          }
        }

        if (
          pps * spi >= minPanelPerInverter &&
          pps * spi <= maxPanelPerInverter &&
          remainingString === 0
        ) {
          inverterPlans.push({
            panelPerString: pps,
            stringPerInverter: mpptSetup.reduce((acc, mppt) =>
              acc + mppt.reduce((acc2, port) =>
                acc2 + port
              , 0)
            , 0),
            mpptSetup: mpptSetup,
            mpptSpec: mpptSetup.map((ary) =>
              ary.reduce((acc, val) => acc + val, 0),
            ),
          });
        }
      });
    }
  });
  return inverterPlans;
};

const calculateWiring = (PVparams, totalPanels, wiringRestriction) => {
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
    second.panelPerString * second.stringPerInverter,
  );

  const DPtable = Array(sortedPlan.length).fill(0);

  DPtable.forEach((row, i) => {
    DPtable[i] = Array(totalPanels + 1).fill().map((x, i) => i);
  });

  historyPlan = new Set();
  DPtable.forEach((row, i) => {
    row.forEach((col, j) => {
      if (i === 0) {
        const numInverter = Math.floor(
          j / (sortedPlan[i].panelPerString * sortedPlan[i].stringPerInverter),
        );
        const plan = [];
        for (let count = 0; count < numInverter; count++) {
          plan.push(sortedPlan[i]);
        }
        historyPlan.add(JSON.stringify(plan));
        DPtable[i][j] = {
          plan: plan,
          wasted: j - (
            numInverter * sortedPlan[i].panelPerString *
            sortedPlan[i].stringPerInverter
          ),
        };
      }
      if (i !== 0) {
        if (
          j >= (sortedPlan[i].panelPerString * sortedPlan[i].stringPerInverter)
        ) {
          if (
            DPtable[i - 1][j].wasted <
            DPtable[i][j - (
              sortedPlan[i].panelPerString * sortedPlan[i].stringPerInverter
            )].wasted
          ) {
            historyPlan.add(JSON.stringify([...DPtable[i - 1][j].plan]));
            DPtable[i][j] = {
              plan: [...DPtable[i - 1][j].plan],
              wasted: DPtable[i - 1][j].wasted,
            };
          } else {
            const newPlan = [
              ...DPtable[i][j - (
                sortedPlan[i].panelPerString * sortedPlan[i].stringPerInverter
              )].plan,
            ];
            newPlan.push(sortedPlan[i]);
            let newWasted = j;
            newPlan.forEach((plan) => {
              newWasted -= (plan.panelPerString * plan.stringPerInverter);
            });
            historyPlan.add(JSON.stringify(newPlan));
            DPtable[i][j] = {
              plan: newPlan,
              wasted: newWasted,
            };
          }
        } else {
          historyPlan.add(JSON.stringify([...DPtable[i - 1][j].plan]));
          DPtable[i][j] = {
            plan: [...DPtable[i - 1][j].plan],
            wasted: DPtable[i - 1][j].wasted,
          };
        }
      }
    });
  });

  const allPlans = [...historyPlan].map((elem) => JSON.parse(elem))
    .filter((elem) => elem !== '[]');
  return allPlans;
};

module.exports = {
  calculateWiringRestriction,
  calculateWiring,
};
