import sortedInsert from '../utils/sortedInsert';
import cooldowns from '../data/cooldowns';
import resources from '../data/resources';

export default function getResource(cooldown, resourceName, timeline) {
  const resource = resources[resourceName];
  const uses = timeline.filter(
    ({ name }) =>
      cooldowns[name] &&
      cooldowns[name].resource &&
      cooldowns[name].resource.cost.resource === resourceName
  );
  let charges = resource.initial;
  let chargeTime = 0;
  let currentCharges;
  let overcharges = charges;

  // * do the sorted insert
  // * test if the new timeline is valid
  // * get the charges at the new cooldown

  console.log(cooldown);

  const test = sortedInsert(uses, cooldown, (a, b) =>
    a.time > b.time ? 1 : -1
  );

  let finalCost;

  for (const use of test) {
    const cost = cooldowns[use.name].resource.cost.fn(use);

    charges +=
      (resource.rechargeAmount * (use.time - chargeTime + 0.00001)) /
      resource.recharge;
    overcharges +=
      (resource.rechargeAmount * (use.time - chargeTime + 0.00001)) /
      resource.recharge;
    // Deal with overcapping on charges
    if (charges > resource.max) {
      charges = resource.max + (charges % resource.rechargeAmount);
    }

    chargeTime = use.time;
    // Consume the charge
    charges -= cost;
    overcharges -= cost;

    if (use.time === cooldown.time) {
      currentCharges = charges;
      overcharges = charges;
      finalCost = cost;
    }

    if (charges < 0) break;
  }

  // TODO: round to nearest charge amount
  const unrounded = Math.min(overcharges, resource.max, currentCharges);
  return (
    Math.floor(unrounded / resource.rechargeAmount) * resource.rechargeAmount +
    finalCost
  );
}
