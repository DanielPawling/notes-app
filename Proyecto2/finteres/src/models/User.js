const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: { type: String, required: true, unique: true }, // o username
  password: { type: String, required: true },
  // otros campos que necesites
}, {
  timestamps: true // añade createdAt y updatedAt
});

module.exports = model('User', userSchema);