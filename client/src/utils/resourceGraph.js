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
 * Generates a graph of resource availability over time
 * @param {Cooldown[]} timeline - The raw timeline of all cooldowns from one player
 * @param {string} resourceName - The name of the resource for which to graph the availability
 * @returns {Point[]} An array of points, with x being the time, and y the amount of resource available
 */

export default function resourceGraph(timeline, resourceName) {
  const resource = resources[resourceName];
  const round = Math.max(1, resource.rechargeAmount);

  const graph = [[0, resource.initial]];

  const events = timeline.filter(({ name }) => {
    const resource = cooldowns[name] && cooldowns[name].resource;
    return (
      resource &&
      ((resource.cost && resource.cost.name === resourceName) ||
        (resource.gives && resource.gives.name === resourceName))
    );
  });

  let charges = resource.initial;
  let chargeTime = 0;

  for (const event of events) {
    const details = cooldowns[event.name].resource;

    let cost;
    if (details.cost && details.cost.name === resourceName) {
      cost = details.cost.amount(event, timeline);
    } else {
      const amount = details.gives.amount;
      cost = -(typeof amount === 'function' ? amount(event, timeline) : amount);
    }

    charges +=
      (resource.rechargeAmount * (event.time - chargeTime + 0.00001)) /
      resource.recharge;

    if (charges > resource.max) {
      const [prevTime, prevCharge] = graph[graph.length - 1];
      if (prevCharge < resource.max) {
        // Determine when max charges were hit
        // (current.charge - prev.charge) / (current.time - prev.time) * (when - current.time) = resource.max - current.charge
        // when - current.time = (resource.max - current.charge) * (current.time - prev.time) / (current.charge - prev.charge)
        const when =
          ((resource.max - charges) * (event.time - prevTime)) /
            (charges - prevCharge) +
          event.time;

        // Add the point where resource caps to our graph
        graph.push([when, resource.max]);
      }
      charges = resource.max + (charges % round);
    }
    // Add amount of charges we have prior to ability usage to the graph
    const before = [event.time, charges];
    graph.push(before);

    chargeTime = event.time;

    charges -= cost;

    // const before = [graph];
    const after = [event.time, charges];

    // Add amount of charges we have after skill usage only if it has changed
    if (before[1] !== after[1]) graph.push(after);
  }

  // If rechargeAmount > 0, calculate when we next max out
  // Otherwise, the next node is at [Infinity, charges]
  if (resource.rechargeAmount > 0) {
    const [prevTime, prevCharge] = graph[graph.length - 1];
    if (prevCharge < resource.max) {
      // Determine when max charges were hit
      // resource.max - prevCharge = (resource.rechargeAmount / resource.recharge) * (when - prevTime)
      // when - prevTime = (resource.max - prevCharge) * (resource.recharge / resource.rechargeAmount)
      const when =
        (resource.max - prevCharge) *
          (resource.recharge / resource.rechargeAmount) +
        prevTime;

      // Add the point where resource caps to our graph
      graph.push([when, resource.max]);
    } else {
      // If we're already maxed, charges are unchanging, forever
      graph.push([360000, resource.max]);
    }
  } else {
    // If we don't accumlate charges passively, they are unchanging, forever
    graph.push([360000, charges]);
  }

  return graph;
}
