const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "manager", "agent", "client"],
    required: true,
  },
  password: { type: String, required: true },
  passwordResetOTP: {
    type: String,
  },
  passwordResetExpiry: {
    type: Date,
  },

  category: { type: String, required: true },
  image: {
    url: String,
    public_id: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
