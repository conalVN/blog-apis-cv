const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const signAccessToken = async (data, expiresIn) => {
  return new Promise((resolve, reject) => {
    const payload = { data };
    const secret = process.env.SECRET_KEY;
    const options = {
      expiresIn: expiresIn,
    };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const verifyAccessToken = async (req, res, next) => {
  if (!req.headers["authorization"]) {
    return next(createError.Unauthorized());
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
    if (err) {
      if (err.name === "JsonWebTokenError") {
        return next(createError.Unauthorized());
      }
      return next(createError.Unauthorized(err.message));
    }
    req.payload = payload;
    next();
  });
};

const signRefreshToken = async (data, expiresIn) => {
  return new Promise((resolve, reject) => {
    const payload = { data };
    const secret = process.env.REFRESH_SECRET_KEY;
    const options = {
      expiresIn: expiresIn,
    };
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
