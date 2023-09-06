const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.BD}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection SUCCESS");
  } catch (error) {
    console.log(error);
    console.error("MongoDB connection FAIL");
    process.exit(1);
  }
};
module.exports = connectDB;
