const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PostSchema = new Schema(
  {
    title: { type: String, require: true },
    description: { type: String, require: true },
    categories: { type: Array, require: false },
    thumbnail: { type: Schema.Types.ObjectId, ref: "Image", require: true },
    content: { type: String, require: true },
    comments: { type: Schema.Types.ObjectId, ref: "CommentThread" },
  },
  {
    timestamps: true,
  }
);

const PostModel = model("Post", PostSchema);

module.exports = PostModel;
