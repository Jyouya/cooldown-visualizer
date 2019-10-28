import cooldowns from '../data/cooldowns';

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
 * Generates a graph of charge availability over time
 * @param {Cooldown[]} timeline - The raw timeline of all cooldowns from one player
 * @param {string} cooldownName - The name of the cooldown for which to graph the availability
 * @returns {Point[]} An array of points, with x being the time, and y the amount of resource available
 */

export default function chargeGraph(timeline, cooldownName) {
  const cooldown = cooldowns[cooldownName];
  const max = cooldown.charges.max;
  const recharge = cooldown.charges.time;

  const graph = [[0, max]];

  const uses = timeline.filter(({ name }) => name === cooldownName);

  let charges = max;
  let lastUse = 0;

  for (const use of uses) {
    const prev = charges;
    charges += (use.time - lastUse + 0.00001) / recharge;

    if (charges > max) {
      const when =
        ((max - charges) * (use.time - lastUse)) / (charges - prev) + use.time;

      // Add the point where charges cap to our graph
      graph.push([when, max]);

      charges = max;
    }
    // Add amount of charges we have prior to ability usage to the graph
    const before = [use.time, charges];
    graph.push(before);

    lastUse = use.time;

    charges -= 1;

    const after = [use.time, charges];

    // Add amount of charges we have after skill usage only if it has changed
    if (before[1] !== after[1]) graph.push(after);
  }

  const [prevTime, prevCharge] = graph[graph.length - 1];
  if (prevCharge < max) {
    // Determine when max charges were hit
    const when = (max - prevCharge) * recharge + prevTime;

    graph.push([when, max]);
  } else {
    // If we're already maxed, charges are unchanging, forever
    graph.push([360000, max]);
  }

  return graph;
}
