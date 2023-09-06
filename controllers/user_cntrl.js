const User = require("../models/user_schema");
const { hashPassword, comparePassword } = require("../utils/Auth-Middlewares");
const jwt = require('jsonwebtoken')

const RegisterAnyone = async (req, res) => {
  const { name, email, password, role, category } = req.body;

  // validation
  if (!name) {
    return res.json({ error: "Name is required" });
  } else if (!role) {
    return res.json({ error: "Role is required" });
  } else if (!category) {
    return res.json({ error: "category is required" });
  } else if (!password || password.length < 6) {
    return res.json({
      error: "Password is required and should be 6 charactor long",
    });
  }

  const exist = await User.findOne({ email });

  if (exist) {
    return res.json({ error: "Email is taken" });
  }

  // hashing the password
  const hashed = await hashPassword(password);

  const user = new User({
    name,
    email,
    password: hashed,
    role,
    category,
  });

  try {
    await user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log("failed error", err);
    res.status(500).json({ err: "Error, Try again" });
  }
};

// not sending any data
const RegisterForClient = async (req, res) => {
  const { name, email, password } = req.body;

  // validation
  if (!name) {
    return res.json({ error: "Name is required" });
  } else if (!email) {
    return res.json({ error: "Email is required" });
  } else if (!password || password.length < 6) {
    return res.json({
      error: "Password is required and should be 6 charactor long",
    });
  }

  const exist = await User.findOne({ email });

  if (exist) {
    return res.json({ error: "Email is taken" });
  }

  // hashing the password
  const hashed = await hashPassword(password);

  const user = new User({
    name,
    email,
    password: hashed,
    role: "client",
  });

  try {
    await user.save();
    return res.json({ ok: true });
  } catch (err) {
    console.log("failed error", err);
    res.status(500).json({ err: "Error, Try again" });
  }
};

// sending - data
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email })
      .populate("image", "_id url public_id")
    if (!user) return res.json({ error: "No user found" });
    if (!password) return res.json({ error: "Please enter your password" });

    // check password
    const match = await comparePassword(password, user.password);
    if (!match) return res.json({ error: "Credentials are not correct" });

    // create a signed token
    const token = jwt.sign({ _id: user._id }, process.env.secrets_cy_of_tc, {
      expiresIn: "4d",
    });

    user.password = undefined;
    user.passwordResetOTP = undefined;
    user.passwordResetExpiry = undefined;

    res.json({ user, token });
  } catch (error) {
    console.log("failed error", error);
    res.status(500).json({ error: "Error, Try again" });
  }
};

// not sending
const currentUser = async (req, res) => {
  try {
    // console.log("toucjed rom admin");
    const user = await User.findById(req.user._id).populate(
      "image",
      "url public_id"
    );

    res.json({ ok: true });
  } catch (error) {
    console.log("failed error", error);
    res.status(500).json({ error: "Error, Try again" });
  }
};

module.exports = {
  RegisterAnyone,
  RegisterForClient,
  Login,
  currentUser,
};
