import cooldowns from '../data/cooldowns';
import getResource from './getResource';

export const checkRecastCollision = function(timeline, target, time) {
  const cooldown = cooldowns[target.name];
  return timeline.find(
    cd => cd.name === target.name && Math.abs(time - cd.time) < cooldown.recast
  );
};

export const checkResourceAvailability = function(timeline, target, time) {
  const resource = cooldowns[target.name].resource;
  return (
    resource &&
    resource.cost &&
    getResource({ ...target, time }, resource.cost.name, timeline) <
      resource.cost.amount({ ...target, time }, timeline)
  );
};

export const checkBusy = function(timeline, target, time) {
  const cooldown = cooldowns[target.name];
  return timeline.find(
    cd =>
      cd.name &&
      cooldown[cooldowns[cd.name].channel] &&
      time > cd.time &&
      time < cd.time + cd.duration
  );
};

export const checkRequirements = function(timeline, target, time) {
  const cooldown = cooldowns[target.name];
  const requires = cooldown.requires;
  return (
    !requires ||
    timeline.find(
      cd =>
        cd.name === requires && cd.time < time && time < cd.time + cd.duration
    )
  );
};

export const checkCharges = function(timeline, target, time) {
  const cdInfo = cooldowns[target.name];
  if (!cdInfo.charges) return true;
  const { max, time: recharge } = cdInfo.charges;
  return !Array.from(Array(max))
    .map((_, i) =>
      timeline.filter(
        cd =>
          cd.name === target.name &&
          cd.time < time + (max - i) * recharge &&
          cd.time > time - i * recharge
      )
    )
    .find(arr => arr.length === max);
};
