const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TimelineSchema = new Schema({
  id: String,
  job: String,
  cooldowns: [
    {
      time: Number,
      name: String,
      id: Number,
      duration: Number
    }
  ]
});

module.exports = TimelineSchema;
