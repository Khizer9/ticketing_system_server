const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const express = require("express");
let app = express();

// datebase configurations

app.use(cors());
app.use(express.json());

// all routes
app.use("/", (req, res) => {
  res.send("am running");
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
