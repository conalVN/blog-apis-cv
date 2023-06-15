const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CommentThreadSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", require: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

const CommentThreadModel = model("CommentThread", CommentThreadSchema);

module.exports = CommentThreadModel;
