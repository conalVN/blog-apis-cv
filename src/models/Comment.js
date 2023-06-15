const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CommentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    textDisplay: { type: String },
    reply: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
  },
  {
    timestamps: true,
  }
);

const CommentModel = model("Comment", CommentSchema);

module.exports = CommentModel;
