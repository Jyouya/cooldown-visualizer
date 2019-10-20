import chargeGraph from './chargeGraph';
import graphIntersections from './graphIntersections';

export default function closestCharge(cooldown, timeline) {
  const points = graphIntersections(
    [[0, 1], [360000, 1]],
    chargeGraph(timeline, cooldown.name).map(([x, y]) => [Math.round(x), y])
  ).map(x => Math.round(x));

  // binary search for the index before cooldown.time
  let low = 0,
    high = points.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    if (points[mid] < cooldown.time) low = mid + 1;
    else high = mid;
  }
  const left = points[low - 1],
    right = points[low];

  //   console.log('points: ', points);

  //   console.log('left: ', left, 'right: ', right);
  if (!left) {
    return right;
  } else if (!right) {
    return left;
  } else if (Math.abs(left - cooldown.time) < Math.abs(right - cooldown.time))
    return left;
  else return right;
}
