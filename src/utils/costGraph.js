import cooldowns from '../data/cooldowns';
import resources from '../data/resources';

/**
 * A Cooldown
 * @typedef {Object} Cooldown
 * @property {string} name
 * @property {number} time
 * @property {number} id
 * @property {number} duration
 */

/**
 * A pair of coordinates [x, y] defining a point
 * @typedef {number[]} Point
 * @property [x,y]
 */

/**
 * Generates a graph of resource cost over time
 * @param {Cooldown} cooldown - The instance of the cooldown
 * @param {Cooldown[]} timeline - The raw timeline of all cooldowns from one player
 * @param {String} resourceName - The name of the resource for which to graph the cost
 * @return {Point[]} An array of points, with x being the time, and y the cost
 */
export default function costGraph(cooldown, timeline, resourceName) {
  const costFn = cooldowns[cooldown.name].resource.cost.amount;

  // Leftmost node at time 0, representing the initial cost
  const graph = [[0, costFn({ ...cooldown, time: 0 }, timeline)]];

  let modifies;
  const events = timeline.filter(
    ({ name }) =>
      name &&
      (modifies = cooldowns[name].modifiesCostOf) &&
      ((modifies.abilities && modifies.abilities.includes(cooldown.name)) ||
        (modifies.resources && modifies.resources.includes(resourceName)))
  );

  for (const event of events) {
    const beforeStart = costFn({ ...cooldown, time: event.time - 1 }, timeline);
    graph.push([event.time, beforeStart]);
    const afterStart = costFn({ ...cooldown, time: event.time + 1 }, timeline);
    graph.push([event.time, afterStart]);

    const duration = cooldowns[event.name].duration;
    if (duration > 0) {
      const endTime = event.time + duration;

      const beforeEnd = costFn({ ...cooldown, time: endTime - 1 }, timeline);
      graph.push([endTime - 1, beforeEnd]);

      const afterEnd = costFn({ ...cooldown, time: endTime + 1 }, timeline);
      graph.push([endTime + 1, afterEnd]);
    }
  }

  // End of graph at Infinity
  graph.push([360000, costFn({ ...cooldown, time: Infinity }, timeline)]);

  return graph;
}
