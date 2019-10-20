import sortedInsert from '../utils/sortedInsert';
import cooldowns from '../data/cooldowns';
import resources from '../data/resources';

export default function getResource(cooldown, resourceName, timeline) {
  const resource = resources[resourceName];
  const round = Math.max(1, resource.rechargeAmount);

  const uses = timeline.filter(({ name }) => {
    const resource = cooldowns[name] && cooldowns[name].resource;
    return (
      resource &&
      ((resource.cost && resource.cost.name === resourceName) ||
        (resource.gives && resource.gives.name === resourceName))
    );
  });

  let charges = resource.initial;
  let chargeTime = 0;
  let currentCharges = charges;
  let overcharges = charges;

  // * do the sorted insert
  // * test if the new timeline is valid
  // * get the charges at the new cooldown

  const test = sortedInsert(uses, cooldown, (a, b) =>
    a.time > b.time ? 1 : -1
  );

  let finalCost;
  let currentFlag;

  for (const use of test) {
    const resourceDetails = cooldowns[use.name].resource;
    let cost;
    if (resourceDetails.cost && resourceDetails.cost.name === resourceName) {
      cost = resourceDetails.cost.amount(use, timeline);
    } else {
      cost = -resourceDetails.gives.amount;
    }

    const prevCharges = charges;

    // Add a tiny amount of charge to account for floating point errors
    charges +=
      (resource.rechargeAmount * (use.time - chargeTime + 0.00001)) /
      resource.recharge;
    overcharges +=
      (resource.rechargeAmount * (use.time - chargeTime + 0.00001)) /
      resource.recharge;

    // Deal with overcapping on charges
    if (charges > resource.max) {
      charges = resource.max + (charges % round);
    }

    chargeTime = use.time;
    // Consume the charge
    charges -= cost;
    overcharges -= cost;

    if (currentFlag && charges > prevCharges) {
      currentFlag = false;
      currentCharges = prevCharges;
    }

    if (use.time === cooldown.time) {
      currentCharges = charges;
      overcharges = charges;
      finalCost = cost;
      currentFlag = true;
    }

    if (charges < 0) break;
  }

  const unrounded = Math.min(overcharges, resource.max, currentCharges);

  return Math.floor(unrounded / round) * round + finalCost;
}
