// Helper functions for the data files

export const aetherflowCost = function({ time }, timeline) {
  const recitations = timeline.filter(cd => cd.name === 'Recitation');
  return recitations.find(
    usage => time > usage.time && time - usage.time < 1500
  )
    ? 0
    : 1;
};

export const fairyGain = function({ time }, timeline) {
  const dissipation = timeline.find(
    cd => cd.name === 'Dissipation' && cd.time < time && time < cd.time + 3000
  );
  return dissipation ? 0 : 10;
};
