


// not sending
const Register = async (req, res) => {
  const { name, email, password, role, status } = req.body;

  // validation
  if (!name) {
    return res.json({ error: "Name is required" });
  } else if (!role) {
    return res.json({ error: "Role is required" });
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
    status,
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
const RegisterSimpleStudent = async (req, res) => {
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
    role: "student",
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
      .populate("assignedBatches", "_id title");
    if (!user) return res.json({ error: "No user found" });

    // check password
    const match = await comparePassword(password, user.password);
    if (!match) return res.json({ error: "Credentials are not correct" });

    // create a signed token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "4d",
    });

    user.password = undefined;
    user.passwordResetOTP = undefined;
    user.passwordResetExpiry = undefined;

    if (user.role === "instructor") {
      user.enrolledBatches = undefined;
      user.completedBatches = undefined;
      user.payments = undefined;
      user.certifications = undefined;
      user.unAssignedCount = undefined;
    } else if (user.role === "cord") {
      user.enrolledBatches = undefined;
      user.completedBatches = undefined;
      user.assignedBatches = undefined;
      user.payments = undefined;
      user.certifications = undefined;
      user.unAssignedCount = undefined;
    } else if (user.role === "student") {
      user.assignedBatches = undefined;
    }

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

// sending
const UpdateUser = async (req, res) => {
  try {
    const data = {};

    if (req.body.name) {
      data.name = req.body.name;
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.json({
          error: "password required & should be minimum 6 chr long",
        });
      } else {
        data.password = await hashPassword(req.body.password);
      }
    }

    if (req.body.role) {
      data.role = req.body.role;
    }

    if (req.body.status) {
      data.status = req.body.status;
    }

    let user = await userModels.findByIdAndUpdate(req.user._id, data, {
      new: true,
    });

    user.password = undefined;
    user.role = undefined;
    user.passwordResetOTP = undefined;
    user.passwordResetExpiry = undefined;
    user.enrolledBatches = undefined;
    user.completedBatches = undefined;
    user.payments = undefined;
    user.certifications = undefined;
    user.unAssignedCount = undefined;
    user.assignedBatches = undefined;

    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ error: "Duplicate error" });
    }
    console.log("failed error", error);
  }
};

// get user by id
// sending
const GetUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select(
      "-password -secret -passwordResetOTP -passwordResetExpiry "
    );
    res.json(user);
  } catch (error) {
    console.log(error);
  }
};

// sending
const GetAllUsers = async (req, res) => {
  //   console.log(req.body.blocked, "from getting all users");
  try {
    const users = await User.find().select(
      "-password -secret -passwordResetOTP -passwordResetExpiry"
    );
    res.json({ users });
  } catch (error) {
    console.log(error);
  }
};

const DeleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete({ _id: req.params.id });
    res.json({ ok: true });
  } catch (error) {
    console.log(error);
  }
};

// sending
const updateUserByAdmin = async (req, res) => {
  try {
    const { id, name, email, password, status, role, image, exp } = req.body;
    // console.log(req.body);
    const userFromDb = await User.findById(id);

    // check password length
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and should be 6 characters long",
      });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updated = await User.findByIdAndUpdate(
      id,
      {
        name: name || userFromDb.name,
        email: email || userFromDb.email,
        password: hashedPassword || userFromDb.password,
        status: status || userFromDb.status,
        role: role || userFromDb.role,
        image: image || userFromDb.image,
        exp: exp || userFromDb.exp,
      },
      { new: true }
    ).populate("image");

    res.json(updated);
  } catch (err) {
    console.log(err);
  }
};
