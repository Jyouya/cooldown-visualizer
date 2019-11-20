module.exports = function(app, db, auth) {
  app
    .route('/api/plans')
    .get(function(req, res) {})
    .post(auth, async function(req, res) {
      console.log(req.user);
      if (!req.user._id) return res.status(401);
      const { encounter, party } = req.body;
      const newEncounter = await db.Encounter.create({
        mechanicURL: encounter,
        users: [
          {
            user: req.user._id,
            permissions: {
              edit: true,
              view: true
            }
          }
        ],
        owner: req.user._id,
        name: 'Demo Encounter',
        timelines: party
      });

      db.User.findOneAndUpdate({_id: req.user._id}, {$push: {savedEncounters: newEncounter._id}})

      // TODO: push new encounter's ID to users's saved encounters

      // create
      // respond with players default party setup
    })
    .patch(function(req, res) {});
};
