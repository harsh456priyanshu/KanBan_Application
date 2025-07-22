const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Ensure these match your actual User IDs
});

module.exports = mongoose.model('Team', teamSchema);
