const fights = require('../../fights');

module.exports = function(app) {
  app.get('/api/fights/:fight', function(req, res) {
    try {
      res.json(fights[req.params.fight]);
    } catch {
      res.status(404).end();
    }
  });

  app.get('/api/fights', function(req, res) {
    res.json({
      patch: process.env.CURRENT_PATCH,
      fights: Object.entries(fights).map(([url, { name, type, patch }]) => ({
        url,
        name,
        type,
        patch
      }))
    });
  });
};
