// import sortedInsert from '../utils/sortedInsert';
import cooldowns from '../data/cooldowns';
import resources from '../data/resources';
import getResource from './getResource';

// ! Assumes that there is a valid time between the nodes to the left and right of guess
export default function closestResource(
  cooldown,
  resourceName,
  timeline,
  guess
) {
  const resource = resources[resourceName];
  const uses = timeline.filter(
    ({ name }) =>
      name &&
      cooldowns[name].resource &&
      cooldowns[name].resource.cost.resource === resourceName
  );

  const cost = cooldowns[cooldown.name].resource.cost.fn(cooldown);

  if (!uses.length) return (cost / resource.rechargeAmount) * resource.recharge;

  const rightIndex = uses.findIndex((_, i) => uses[i] && uses[i].time > guess);

  let left;
  const right = uses[rightIndex];

  if (!right) left = uses[uses.length - 1];
  else if (rightIndex === 0) left = { ...cooldown, time: 0 };
  else left = uses[rightIndex - 1];

  const leftResource = getResource(left, resourceName, timeline);

  const leftGuess =
    left.time +
    ((cost - leftResource) / resource.rechargeAmount) * resource.recharge -
    (left.time % resource.recharge);
  console.log(getResource(left, resourceName, timeline));
  console.log(guess);
  console.log('left guess: ', leftGuess);

  const rightResource = right && getResource(right, resourceName, timeline);

  const rightGuess = right
    ? right.time -
      ((cost - rightResource) / resource.rechargeAmount - 1) *
        resource.recharge -
      ((((cost - rightResource) / resource.rechargeAmount) * right.time) %
        resource.recharge) -
      100
    : Infinity;
  console.log('right guess', rightGuess);

  if (
    Math.abs(leftGuess - cooldown.time) < Math.abs(rightGuess - cooldown.time)
  )
    return leftGuess;
  else return rightGuess;
}
