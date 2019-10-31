const jwt = require('jsonwebtoken');
const utils = require('util');
const verifyP = utils.promisify(jwt.verify);

module.exports = async function(req, res, next) {
  try {
    const decoded = await verifyP(req.cookies.user, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    next();
  }
};
