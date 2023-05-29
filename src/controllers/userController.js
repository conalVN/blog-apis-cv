const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await User.findOne({ email: email });
    if (account) {
      const isAdmin = account.email === email && account.password === password;
      if (isAdmin) {
        const token = jwt.sign({ id: account?._id }, process.env.SECRET_KEY, {
          expiresIn: "1d",
        });
        res.cookie("token", token, { maxAge: 86400 });
        res.status(200).json({
          message: "Welcome to the admin dashboard",
        });
      } else {
        res.status(401).json({
          message: "Access denied. User must be an admin.",
        });
      }
    } else {
      res.status(401).json({
        message: "Can't find account",
      });
    }
  } catch (error) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login };
