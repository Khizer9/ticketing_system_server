const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ["P1", "P2", "P3", "P4"], required: true },
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved", "review"],
    default: "open",
  },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resolutionTime: { type: Number }, // Store resolution time in minutes
  createdAt: { type: Date, default: Date.now },
  pickedAt: Date, // Timestamp when an agent picked the ticket
  respondedAt: Date, // Timestamp when an agent responded to the ticket
  solvedAt: Date, // Timestamp when the ticket was solved
  reviewedAt: Date, // Timestamp when the ticket went to review
  yankedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Manager who yanked the ticket
  logs: [
    {
      timestamp: { type: Date, default: Date.now },
      action: String,
      agent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
