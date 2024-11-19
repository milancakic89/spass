const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  activation_token: { type: String, default: null },
  activated: { type: Boolean, default: false },
  items: [
    {
      name: { type: String, required: true },
      password: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model('user', userSchema);