const fs = require('fs');

const fights = {};

fs.readdirSync(__dirname).forEach(file => {
  if (file !== 'index.js') {
    const fight = require(`./${file}`);
    fights[fight.url] = fight;
  }
});

module.exports = fights;
