const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-type-email');

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: /[^<>;&/'"]+/
  },
  email: { type: mongoose.SchemaTypes.Email, required: true, unique: true },
  passHash: { type: String, required: true },

  savedEncounters: [{ type: Schema.Types.ObjectId, ref: 'Encounter' }],

  defaultParty: [String]
});

module.exports = mongoose.model('User', UserSchema);
