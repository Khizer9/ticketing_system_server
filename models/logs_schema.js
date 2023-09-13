const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  actions: { type: String, requried: true },
  whichSchema: { type: String, requried: true },
  performBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", reportSchema);
