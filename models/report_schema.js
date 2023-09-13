const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dateRange: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  metrics: {
    totalTickets: { type: Number },
    resolvedTickets: { type: Number },
    SLABreaches: { type: Number },
    clientSatisfaction: { type: Number }, // E.g., Average of ratings
  },
  format: { type: String, enum: ["PDF", "CSV"], required: true },
});

module.exports = mongoose.model("Report", reportSchema);
