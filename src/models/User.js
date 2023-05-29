const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, require: true },
    password: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", UserSchema);

module.exports = UserModel;
