const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');
const signP = util.promisify(jwt.sign);

const passwordRules = [
  /(?=.*[A-Z])(?=.*[a-z])/,
  /[^a-z ]/i,
  /(?=.*[a-z])(?=.*\d)/i
];

module.exports = (app, db) => {
  async function login(user, res) {
    const jwt = await signP(
      {
        _id: user._id,
        username: user.username
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '30d' }
    );
    res.cookie('user', jwt);
  }

  app.post('/login', async function(req, res) {
    const { email, password } = req.body;
    const user = await db.User.findOne({ email });

    const match = await bcrypt.compare(password, user.passHash);

    if (user && match) {
      await login(user, res);
      res.json({ msg: 'Login successful' });
    } else {
      res.json({ msg: 'E-mail or Password is invalid' });
    }
  });

  app.post('/register', async function(req, res) {
    const { password, email, username } = req.body;

    // Validate inputs
    if (!username.match(/[^<>;&/'"]+/))
      return res.json({ msg: 'Username has invalid characters' });

    if (!email.match(/.+@.+\..+/))
      return res.json({ msg: 'Please enter a valid e-mail address' });

    if (
      !password.match(/.{8}/) ||
      passwordRules.filter(regex => password.match(regex)).length < 2
    )
      return res.json({ msg: 'weak password' });

    try {
      if (await db.User.findOne({ email }))
        return res.json({
          msg: 'An account with that email address already exists'
        });
      else if (await db.User.findOne({ username }))
        return res.json({
          msg: 'User name is taken'
        });
    } catch (err) {
      console.log(err);
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await db.User.create({
      username,
      email,
      passHash: hash,
      savedEncounters: []
    });

    await login(user, res);

    res.json({ msg: 'Account creation successful' });
  });
};
