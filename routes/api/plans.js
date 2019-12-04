const mongoose = require('mongoose');
const fights = require('../../fights');

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
        name: req.body.title || 'Untitled',
        timelines: party
      });
      console.log(req.body);

      db.User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { savedEncounters: mongoose.Types.ObjectId(newEncounter._id) }
        },
        function(error, success) {
          if (error) {
            console.log(error);
          } else {
            console.log(success);
          }
        }
      );

      res.json({ encounterId: newEncounter._id });
    })
    .patch(function(req, res) {});

  app.get('/api/plan/:id', auth, async function(req, res) {
    console.log(req.params.id);
    const plan = await db.Encounter.findById(req.params.id);
    if (!plan) return res.status(404).end();
    console.log(plan);

    if (plan.private) {
      const permissions = plan.users.find(({ user }) => (user = req.user._id));
      if (!(permissions && permissions.view)) return res.status(401).end();
    }

    const { timelines, _id, owner, name, updated_at } = plan;

    res.json({
      timelines,
      _id,
      owner,
      name,
      updated_at,
      mechanics: fights[plan.mechanicURL]
    });
  });
};
