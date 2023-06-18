const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const formatDate = require("../config/formatDate");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check email exists or not
    const account = await User.findOne({ email: email });
    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Account does not exist. Please register a new account",
      });
    }
    // check password
    const passMatch = bcrypt.compareSync(password, account.password);
    if (!passMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }
    const token = jwt.sign({ userId: account._id }, process.env.SECRET_KEY, {
      expiresIn: "3d",
    });
    res
      .status(200)
      .json({ success: true, message: "Login successful!", token });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server login error!", error: error });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    const duplicateUsername = await User.findOne({ username: username });
    if (duplicateUsername)
      return res
        .status(409)
        .json({ success: false, message: "Username already used" });
    const isUser = await User.findOne({ email: email });
    if (isUser) {
      return res
        .status(409)
        .json({ message: "Email is already in use. Please signin!" });
    }
    const hashPass = bcrypt.hashSync(password, 12);
    const user = await User.create({
      username,
      email,
      password: hashPass,
      role: "user",
      verify_at: null,
    });
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    const verificationUrl = `${process.env.URL_CLIENT}/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.FROM,
        pass: process.env.PASS,
      },
    });
    // email options
    const mailOptions = {
      from: process.env.FROM,
      to: email,
      subject: "Email Verification",
      html: `
      <div>
        <p>Hi ${username}! Please click the following to verify your email:
          <a href="${verificationUrl}">Click here</a>
        </p>
      </div>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      }
    });

    res
      .status(201)
      .json({ success: true, message: "Check your verification email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

const verify = async (req, res) => {
  try {
    const { token } = req.body;
    const user = jwt.verify(token, process.env.SECRET_KEY);
    if (!user) {
      return res.status(401).json({ success: false, message: "Login faild!" });
    }
    const time = formatDate(new Date());
    if (user) {
      User.findOneAndUpdate(
        { _id: user.userId },
        { $set: { verify_at: time } },
        { new: true, upsert: true, returnNewDocument: true }
      );
      res.status(201).json({ message: "Email verification successful." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { login, register, verify };
