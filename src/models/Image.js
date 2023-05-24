const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ImageSchema = new Schema({
  public_id: { type: String, require: true },
  url: { type: String, require: true },
});

const ImageModel = model("Image", ImageSchema);

module.exports = ImageModel;
