const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TimelineSchema = require('./TimelineSchema');

const EncounterSchema = new Schema({
  name: { type: String, required: true },
  private: Boolean,
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  users: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User' },
      permissions: {
        edit: Boolean,
        view: Boolean
      },
      settings: {
        views: [[{ id: String }]]
      }
    }
  ],
  timelines: [TimelineSchema]
});

module.exports = mongoose.model('Encounter', EncounterSchema);
