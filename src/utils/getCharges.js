import cooldowns from '../data/cooldowns';

export default function getCharges(timeline, abilityName, time) {
  const { max, time: recharge } = cooldowns[abilityName].charges;
  return max - Math.max(
    ...Array.from(Array(max)).map(
      (_, i) =>
        timeline.filter(
          cd =>
            cd.name === abilityName &&
            cd.time < time + (max - i) * recharge &&
            cd.time > time - i * recharge
        ).length
    )
  );
}
