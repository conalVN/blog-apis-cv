const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check email exists or not
    const account = await User.findOne({ email: email });
    if (!account) {
      res.status(401).json({
        message: "Account does not exist. Please register a new account",
      });
    }
    // check password
    const passMatch = bcrypt.compareSync(password, account.password);
    if (!passMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ userId: account._id }, process.env.SECRET_KEY, {
      expiresIn: "3d",
    });
    res.json({ token });
  } catch (error) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const isUser = await User.findOne({ email: email });
    if (isUser) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const hashPass = bcrypt.hashSync(password, 12);
    const user = await User.create({
      username,
      email,
      password: hashPass,
      role: "user",
    });
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    const verificationUrl = `${process.env.URL_CLIENT}/verify?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dvt12a4008@gmail.com",
        pass: "mjdkkuwxptchkmgd",
      },
    });
    // email options
    const mailOptions = {
      from: "dvt12a4008@gmail.com",
      to: email,
      subject: "Email Verification",
      html: `
      <div>
        <p>Please click the following to verify your email:
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
      </div>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log(info);
      }
    });

    res.status(201).json({ message: "Register successful!" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

module.exports = { login, register };
