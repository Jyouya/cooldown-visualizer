import cooldowns from '../data/cooldowns';

function dummyCooldown(timeline, name, time) {
  const cd = cooldowns[name];

  const duration = cd.variable ? cd.minMax(timeline)[1] : cd.duration;

  return { name, time, duration };
}

export default dummyCooldown;
