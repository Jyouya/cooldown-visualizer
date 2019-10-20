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
