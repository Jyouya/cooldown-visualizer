// Helper functions for the data files

export const aetherflowCost = function({ time }, timeline) {
  const recitations = timeline.filter(cd => cd.name === 'Recitation');
  return recitations.find(
    usage => time > usage.time && time - usage.time < 1500
  )
    ? 0
    : 1;
};
