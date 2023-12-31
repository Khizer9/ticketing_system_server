const Category = require("../models/category_schema");
const Ticket = require("../models/ticket_schema");
const User = require("../models/user_schema");
const sendError = require("../utils/Error");
const Comment = require("../models/comment_Schema");

const createTicketByClient = async (req, res) => {
  try {
    // Validate inputs
    const { title, description, category, priority, images } = req.body;

    if (!title || !description || !category || !priority) {
      return sendError(res, "All required fields must be filled", 400);
    }

    // Check if user exists
    const user = await User.findById(req.user._id);
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
      createdBy: req.user._id,
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

// for the first SLA
const pickTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    if (!ticketId) {
      return sendError(res, "Ticket ID and User ID are required", 400);
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return sendError(res, "Invalid ticket ID", 400);
    }

    if (ticket.pickedBy) {
      return sendError(res, "Ticket has already been picked", 400);
    }

    const user = await User.findById(req.user._id);
    if (!user || (user.role !== "agent" && user.role !== "admin")) {
      return sendError(res, "Only agents or admins can pick tickets", 400);
    }

    // Check if the user's category matches the ticket's category
    if (user.category.toString() !== ticket.category.toString()) {
      return sendError(
        res,
        "User's category does not match the ticket's category",
        400
      );
    }

    // SLA Check
    const currentTime = new Date();
    const timeDifference = (currentTime - new Date(ticket.createdAt)) / 60000; // Difference in minutes

    if (timeDifference > 10) {
      ticket.firstSLABreach = true;
    }

    ticket.pickedBy = req.user._id;
    ticket.pickedAt = currentTime;
    await ticket.save();

    return res.status(200).json({
      message: "Ticket picked successfully",
      ticket: ticket,
    });
  } catch (error) {
    console.error("Error picking ticket:", error);
    return sendError(res);
  }
};

// for the second SLA
const addCommentToTicket = async (req, res) => {
  try {
    const { ticketId, content } = req.body;
    if (!ticketId || !content) {
      return sendError(
        res,
        "Ticket ID, User ID, and content are required",
        400
      );
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return sendError(res, "Invalid ticket ID", 400);
    }

    const user = await User.findById(req.user._id);
    if (!user || (user.role !== "agent" && user.role !== "admin")) {
      return sendError(res, "Only agents or admins can add comments", 400);
    }

    // Create a new comment
    const newComment = new Comment({
      content,
      createdBy: req.user._id,
      createdAt: new Date(),
    });
    await newComment.save();

    // Add the comment to the ticket
    ticket.comments.push(newComment._id);

    // Check for the second SLA breach
    if (!ticket.firstRespondedAt) {
      ticket.firstRespondedAt = new Date();
      const timeDifference =
        (ticket.firstRespondedAt - new Date(ticket.createdAt)) / 60000; // Difference in minutes

      if (timeDifference > 1) {
        ticket.secondSLABreach = true;
      }
    }

    await ticket.save();

    return res.status(200).json({
      message: "Comment added successfully",
      ticket: ticket,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return sendError(res);
  }
};

const markTicketAsResolvedByAgent = async (req, res) => {
  try {
    const { ticketId } = req.body;

    // Validate inputs
    if (!ticketId) {
      return res.status(400).json({ message: "Both ticketId is required" });
    }

    // Find the ticket by its ID
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if ((ticket.status = "Resolved")) {
      return res.status(404).json({ message: "Ticket is already resolved" });
    }
    // Additional checks can be done here, for example, to verify that the user
    // resolving the ticket has the necessary permissions or that the ticket status
    // is in a state that allows it to be resolved.

    // Update the ticket status and resolvedAt fields
    ticket.status = "Resolved";
    ticket.resolvedAt = new Date();

    // Save the changes
    await ticket.save();

    return res
      .status(200)
      .json({ message: "Ticket marked as resolved", ticket });
  } catch (error) {
    console.log("Error in markTicketAsResolved:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while resolving the ticket" });
  }
};

const escalateTicketByAgent = async (req, res) => {
  try {
    const { ticketId, why, escalatedTo } = req.body;

    // Validate inputs
    if (!ticketId || !why || !escalatedTo) {
      return res
        .status(400)
        .json({ message: "All fields are required for escalation" });
    }

    // Find the ticket by its ID
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if the user escalating the ticket is an agent and has the authority to do so
    const agent = await User.findById(req.user._id);
    if (!agent || agent.role !== "agent") {
      return res
        .status(403)
        .json({ message: "Only agents can escalate tickets" });
    }

    // Additional checks can be done here, for example, to verify the status of the ticket

    // Check if escalatedTo user exists and is of the appropriate role (likely a manager or admin)
    const escalateToUser = await User.findById(escalatedTo);
    if (
      !escalateToUser ||
      !["manager", "admin"].includes(escalateToUser.role)
    ) {
      return res.status(400).json({ message: "Invalid user to escalate to" });
    }

    // Update the escalated field in the ticket
    ticket.escalated.push({
      yes: true,
      why,
      escalatedTo,
      escalatedAt: new Date(),
    });

    // Save the changes
    await ticket.save();

    return res
      .status(200)
      .json({ message: "Ticket escalated successfully", ticket });
  } catch (error) {
    console.log("Error in escalateTicket:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while escalating the ticket" });
  }
};

const escalateTicketByManager = async (req, res) => {
  try {
    const { ticketId, why, escalatedTo } = req.body;

    // Validate inputs
    if (!ticketId || !why || !escalatedTo) {
      return res
        .status(400)
        .json({ message: "All fields are required for escalation" });
    }

    // Find the ticket by its ID
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if the user escalating the ticket is a manager
    const manager = await User.findById(req.user._id);
    if (!manager || manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can escalate tickets" });
    }

    // Additional checks can be done here, for example, to verify the status of the ticket

    // Check if escalatedTo user exists and is of the appropriate role (likely an admin)
    const escalateToUser = await User.findById(escalatedTo);
    if (!escalateToUser || !["admin"].includes(escalateToUser.role)) {
      return res.status(400).json({ message: "Invalid user to escalate to" });
    }

    // Update the escalated field in the ticket
    ticket.escalated.push({
      yes: true,
      why,
      escalatedTo,
      escalatedAt: new Date(),
    });

    // Save the changes
    await ticket.save();

    return res
      .status(200)
      .json({ message: "Ticket escalated successfully by manager", ticket });
  } catch (error) {
    console.log("Error in escalateTicketByManager:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while escalating the ticket" });
  }
};

// getting all tickets by client
const gettingAllTickets = async (req, res) => {
  const { status } = req.body;

  try {
    if (!status) return sendError(res, "Please select the ticket status", 400);
    const tickets = await Ticket.find({
      createdBy: req.user._id,
      status,
    });
    return res.json(tickets);
  } catch (error) {
    console.log(error);
    sendError(res);
  }
};

module.exports = {
  createTicketByClient,
  pickTicket,
  addCommentToTicket,
  markTicketAsResolvedByAgent,
  escalateTicketByAgent,
  escalateTicketByManager,
  gettingAllTickets,
};
