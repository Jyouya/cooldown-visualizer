module.exports = function(app, db) {
  require('./fights')(app, db);
  require('./user')(app, db);
};
