// import sortedInsert from '../utils/sortedInsert';
// import cooldowns from '../data/cooldowns';
// import resources from '../data/resources';
// import getResource from './getResource';

import costGraph from './costGraph';
import resourceGraph from './resourceGraph';
import graphIntersections from './graphIntersections';

export default function closestResource(
  cooldown,
  resourceName,
  timeline,
  guess
) {
  const points = graphIntersections(
    costGraph(cooldown, timeline, resourceName).map(([x, y]) => [
      Math.round(x),
      y
    ]),
    resourceGraph(timeline, resourceName).map(([x, y]) => [Math.round(x), y])
  ).map(x => Math.round(x));

  // binary search for the index before cooldown.time
  let low = 0,
    high = points.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (points[mid] < cooldown.time) low = mid + 1;
    else high = mid;
  }

  // TODO: round left and right to nearest integer
  const left = points[low - 1],
    right = points[low];

  // if (low === points.length - 1) return points[points.length - 1];
  console.log('points: ', points);

  console.log('left: ', left, 'right: ', right);
  if (!left) {
    return right;
  } else if (!right) {
    return left;
  } else if (Math.abs(left - cooldown.time) < Math.abs(right - cooldown.time))
    return left;
  else return right;
}

// ! Assumes that there is a valid time between the nodes to the left and right of guess
/*export default function closestResource(
  cooldown,
  resourceName,
  timeline,
  guess
) {
  const resource = resources[resourceName];

  const uses = timeline.filter(({ name }) => {
    const resource = name && cooldowns[name].resource;
    return (
      resource &&
      ((resource.cost && resource.cost.name === resourceName) ||
        (resource.gives && resource.gives.name === resourceName))
    );
  });

  const cost = cooldowns[cooldown.name].resource.cost.amount(
    cooldown,
    timeline
  );

  const recharge = cost ? resource.rechargeAmount : 1;

  console.log('debug');
  if (!uses.length) return (cost / recharge) * resource.recharge;

  const rightIndex = uses.findIndex((_, i) => uses[i] && uses[i].time > guess);

  let left;
  const right = uses[rightIndex];

  if (!right) left = uses[uses.length - 1];
  else if (rightIndex === 0) left = { ...cooldown, time: 0 };
  else left = uses[rightIndex - 1];

  const leftResource = getResource(left, resourceName, timeline);

  const leftGuess =
    left.time +
    ((cost - leftResource) / recharge) * resource.recharge -
    (left.time % resource.recharge);
  console.log(getResource(left, resourceName, timeline));
  console.log(guess);
  console.log('left guess: ', leftGuess);

  const rightResource = right && getResource(right, resourceName, timeline);

  const rightGuess = right
    ? right.time -
      ((cost - rightResource) / recharge - 1) * resource.recharge -
      ((((cost - rightResource) / recharge) * right.time) % resource.recharge) -
      100
    : Infinity;
  console.log('right guess', rightGuess);

  if (
    Math.abs(leftGuess - cooldown.time) < Math.abs(rightGuess - cooldown.time)
  )
    return Math.max(leftGuess, -50);
  else return rightGuess;
}*/
