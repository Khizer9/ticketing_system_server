const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const express = require("express");
const connectDB = require("./config/db");
let app = express();

// datebase configurations
connectDB();

app.use(cors());
app.use(express.json());

const userRouters = require("./routers/user_routers");

// all routes
app.use("/api", userRouters);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
