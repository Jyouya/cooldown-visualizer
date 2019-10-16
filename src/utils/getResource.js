import sortedInsert from '../utils/sortedInsert';
import cooldowns from '../data/cooldowns';
import resources from '../data/resources';

export default function getResource(time, resourceName, timeline) {
  const resource = resources[resourceName];
  const uses = timeline.filter(
    ({ name }) => name && cooldowns[name].resource === resourceName
  );
  let charges = resource.initial;
  let chargeTime = 0;
  let currentCharges;
  let overcharges = charges;

  // * do the sorted insert
  // * test if the new timeline is valid
  // * get the charges at the new cooldown

  const test = sortedInsert(uses, { time }, (a, b) =>
    a.time > b.time ? 1 : -1
  );

  for (const use of test) {
    charges += (use.time - chargeTime + .0001) / resource.recharge;
    overcharges += (use.time - chargeTime + .0001) / resource.recharge;
    // Deal with overcapping on charges
    if (charges > resource.max) {
      charges = resource.max + (charges % 1);
    }

    chargeTime = use.time;
    // Consume the charge
    charges -= 1;
    overcharges -= 1;

    if (use.time === time) {
      currentCharges = charges;
      overcharges = charges;
    }

    if (charges < 0) return -1;
  }

  return Math.min(overcharges, resource.max, currentCharges);
}
