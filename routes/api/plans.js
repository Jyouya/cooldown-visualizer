module.exports = function(app, db, auth) {
  app
    .route('/api/plans')
    .get(function(req, res) {})
    .post(async function(req, res, auth) {
      if (!req.user._id) return res.status(401);
      const { encounter, party } = req.body;
      const newEncounter = await db.Encounter.create({
        encounter,
        party,
        users: [req.user._id],
        name: 'Demo Encounter',
        timelines: party
      });

      // TODO: push new encounter's ID to users's saved encounters

      // create
      // respond with players default party setup
    })
    .patch(function(req, res) {});
};
