module.exports = function(app, db, auth) {
  require('./fights')(app, db, auth);
  require('./user')(app, db, auth);
  require('./plans')(app, db, auth);
};
