const Category = require("../models/category_schema");
const Ticket = require("../models/ticket_schema");
const User = require("../models/user_schema");
const sendError = require("../utils/Error");

const createTicketByClient = async (req, res) => {
  try {
    // Validate inputs
    const { title, description, category, priority, images, createdBy } =
      req.body;

    if (!title || !description || !category || !priority || !createdBy) {
      return sendError(res, "All required fields must be filled", 400);
    }

    // Check if user exists
    const user = await User.findById(createdBy);
    if (!user || user.role !== "client") {
      return sendError(res, "Invalid user", 400);
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return sendError(res, "Invalid category", 400);
    }

    // Create new ticket
    const newTicket = new Ticket({
      title,
      description,
      category,
      priority,
      images: images || [],
      createdBy,
      status: "Open",
      createdAt: new Date(),
    });

    // Save the ticket
    await newTicket.save();

    // Send success response
    return res
      .status(201)
      .json({ message: "Ticket created successfully", ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return sendError(res);
  }
};

module.exports = {
  createTicketByClient,
};
