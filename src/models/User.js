const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    username: { type: String },
    email: { type: String, require: true },
    password: { type: String, require: true },
    role: { type: String, require: true },
    verify_at: { type: String },
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", UserSchema);

module.exports = UserModel;
