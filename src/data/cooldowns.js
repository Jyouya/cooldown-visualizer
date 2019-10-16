export default {
  Camouflage: {
    img: './icons/camouflage.png',
    duration: 2000,
    recast: 9000
  },
  Rampart: {
    img: './icons/rampart.png',
    duration: 2000,
    recast: 9000
  },
  Nebula: {
    img: './icons/nebula.png',
    duration: 1000,
    recast: 12000
  },
  Superbolide: {
    img: './icons/superbolide.png',
    duration: 800,
    recast: 36000
  },
  'Heart of Stone': {
    img: './icons/heart_of_stone.png',
    duration: 700,
    recast: 2500
  },
  'Heart of Light': {
    img: './icons/heart_of_light.png',
    duration: 1500,
    recast: 9000,
    raid: true
  },
  Aurora: {
    img: './icons/aurora.png',
    duration: 1800,
    recast: 6000,
    heal: true
  },
  Sentinel: {
    img: './icons/sentinel.png',
    duration: 1000,
    recast: 12000
  },
  'Hallowed Ground': {
    img: './icons/hallowed_ground.png',
    duration: 1000,
    recast: 42000
  },
  Sheltron: {
    img: './icons/sheltron.png',
    duration: 600,
    recast: 500,
    resource: { cost: { resource: 'oath', fn: instance => 50 } }
  },
  Cover: {
    img: './icons/cover.png',
    duration: 1200,
    recast: 12000,
    resource: { cost: { resource: 'oath', fn: instance => 50 } }
  },
  Intervention: {
    img: './icons/intervention.png',
    duration: 600,
    recast: 1000,
    resource: { cost: { resource: 'oath', fn: instance => 50 } }
  },
  'Passage of Arms': {
    img: './icons/passage_of_arms.png',
    duration: 1800,
    recast: 12000,
    raid: true,
    variable: true,
    minMax: () => [500, 1800]
  },
  'Divine Veil': {
    img: './icons/divine_veil.png',
    duration: 3000,
    recast: 9000,
    raid: true,
    shield: true
  },
  'The Blackest Night': {
    img: './icons/the_blackest_night.png',
    duration: 700,
    recast: 1500,
    shield: true
  },
  'Dark Mind': {
    img: './icons/dark_mind.png',
    duration: 1000,
    recast: 6000
  },
  'Shadow Wall': {
    img: './icons/shadow_wall.png',
    duration: 1000,
    recast: 12000
  },
  'Living Dead': {
    img: './icons/living_dead.png',
    duration: 1000,
    recast: 30000
  },
  'Dark Missionary': {
    img: './icons/dark_missionary.png',
    duration: 1500,
    recast: 9000,
    raid: true
  },
  'Raw Intuition': {
    img: './icons/raw_intuition.png',
    duration: 500,
    recast: 2500
  },
  'Nascent Flash': {
    img: './icons/nascent_flash.png',
    duration: 600,
    recast: 2500,
    shared: 'Raw Intuition'
  },
  'Thrill of Battle': {
    img: './icons/thrill_of_battle.png',
    duration: 1000,
    recast: 12000
  },
  Vengeance: {
    img: './icons/vengeance.png',
    duration: 1000,
    recast: 12000
  },
  Holmgang: {
    img: './icons/holmgang.png',
    duration: 600,
    recast: 24000
  },
  'Shake It Off': {
    img: './icons/shake_it_off.png',
    duration: 1500,
    recast: 9000,
    raid: true,
    shield: true
  },
  Reprisal: {
    img: './icons/reprisal.png',
    duration: 500,
    recast: 6000,
    raid: true
  },
  "Arm's Length": {
    img: "./icons/arm's_length.png",
    duration: 600,
    recast: 12000
  },

  'Presence of Mind': {
    img: './icons/presence_of_mind.png',
    duration: 1500,
    recast: 15000
  },
  Asylum: {
    img: './icons/asylum.png',
    duration: 2400,
    recast: 9000,
    raid: true,
    heal: true
  },
  Assize: {
    img: './icons/assize.png',
    duration: 0,
    recast: 4500,
    raid: true,
    heal: true
  },
  Temperance: {
    img: './icons/temperance.png',
    duration: 2000,
    recast: 12000,
    raid: true
  },
  'Divine Benison': {
    img: './icons/divine_benison.png',
    duration: 1500,
    recast: 3000,
    raid: true,
    shield: true
  },
  Tetragrammaton: {
    img: './icons/tetragrammaton.png',
    duration: 0,
    recast: 6000,
    raid: true,
    heal: true
  },
  'Afflatus Solace': {
    img: './icons/afflatus_solace.png',
    duration: 0,
    recast: 200,
    raid: true,
    heal: true,
    gcd: true,
    resource: { cost: { resource: 'lily', fn: instance => 1 } }
  },
  'Afflatus Rapture': {
    img: './icons/afflatus_rapture.png',
    duration: 0,
    recast: 200,
    raid: true,
    heal: true,
    gcd: true,
    resource: { cost: { resource: 'lily', fn: instance => 1 } }
  },
  Medica: {
    img: './icons/medica.png',
    duration: 0,
    recast: 200,
    raid: true,
    heal: true,
    gcd: true
  },
  'Medica II': {
    img: './icons/medica_ii.png',
    duration: 1500,
    recast: 200,
    raid: true,
    heal: true,
    gcd: true
  },
  Regen: {
    img: './icons/regen.png',
    duration: 1800,
    recast: 200,
    raid: true,
    heal: true,
    gcd: true
  }
};
