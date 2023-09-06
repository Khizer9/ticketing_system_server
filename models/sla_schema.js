const mongoose = require("mongoose");

const slaBreachSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  reason: { type: String, required: true },
  breachedAt: { type: Date, default: Date.now },
});

const SLABreach = mongoose.model("SLABreach", slaBreachSchema);

module.exports = SLABreach;
