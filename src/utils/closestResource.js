// import sortedInsert from '../utils/sortedInsert';
import cooldowns from '../data/cooldowns';
import resources from '../data/resources';

// ! Assumes that there is a valid time between the nodes to the left and right of guess
export default function closestResource(time, resourceName, timeline, guess) {
  const resource = resources[resourceName];
  const uses = timeline.filter(
    ({ name }) => name && cooldowns[name].resource === resourceName
  );

  if (!uses.length) return resource.recharge;

  const rightIndex = uses.findIndex((_, i) => uses[i] && uses[i].time > guess);

  let left;
  const right = uses[rightIndex];

  if (!right) left = uses[uses.length - 1];
  else if (rightIndex === 0) left = { time: 0 };
  else left = uses[rightIndex - 1];

  const leftGuess =
    left.time + resource.recharge - (left.time % resource.recharge);

  const rightGuess = right
    ? right.time - (right.time % resource.recharge) - 100
    : Infinity;

  if (Math.abs(leftGuess - time) < Math.abs(rightGuess - time))
    return leftGuess;
  else return rightGuess;
}
