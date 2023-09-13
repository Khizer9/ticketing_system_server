const sendError = (
  res,
  message = "An error occurred while processing the request",
  status = 500
) => {
  console.log(message);
  return res.status(status).json({ error: message });
};

module.exports = sendError;
