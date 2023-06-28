const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const createError = require("http-errors");
const User = require("../models/User");
const formatDate = require("../config/formatDate");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} = require("../helpers/jwt_services");

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
    if (account.verify_at === null) {
      return res.send({ message: "Please verify your email to login" });
    }
    // check password
    const passMatch = bcrypt.compareSync(password, account.password);
    if (!passMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }
    const accessToken = await signAccessToken(account._id, "1d");
    const refreshToken = await signRefreshToken(account._id, "1y");

    res.cookie("access-token", accessToken);
    res.status(200).json({
      userId: account._id,
      success: true,
      message: "Login successful!",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
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
      role: 0,
      verify_at: null,
    });
    // const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    signAccessToken({ userId: user._id }, "15m")
      .then((token) => {
        const verificationUrl = `${process.env.URL_CLIENT}/verify/${token}`;

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: "587",
          service: "gmail",
          secure: false, // true for 465
          auth: {
            user: process.env.FROM,
            pass: process.env.PASS,
          },
        });
        // email options
        const mailOptions = {
          from: `"Coanl Blog" <${process.env.FROM}>`,
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
            return res
              .status(500)
              .json({ success: false, message: "Email sending failed" });
          }
        });

        res
          .status(201)
          .json({ success: true, message: "Check your verification email" });
      })
      .catch((err) => console.log(err));
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

const verify = async (req, res) => {
  try {
    const { token } = req.params;
    const user = jwt.verify(token, process.env.SECRET_KEY);
    if (!user) {
      return res.status(401).json({ success: false, message: "Login faild!" });
    }
    User.findOne({ _id: user?.data?.userId }).then(async (data) => {
      if (!data) {
        return res.status(404).json({ message: "User not found." });
      }
      const time = formatDate(new Date());
      data.verify_at = time;
      await data.save();
      res
        .status(201)
        .json({ message: "Verification successful. You can now log in." });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const { data } = await verifyRefreshToken(refreshToken);
    // create new token
    const accessToken = await signAccessToken(data);
    const refresh = await signRefreshToken(data);
    res.json({ accessToken, refreshToken: refresh });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("access-token");
    res.send({ message: "Logout success!" });
  } catch (error) {
    res.json({ message: "Logout faild! Error server" });
  }
};

module.exports = { login, logout, register, verify, refreshToken };
