const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

const connectDatabase = async (URL) => {
  try {
    cloudinary.config({
      cloud_name: "blogconal",
      api_key: "192659538827766",
      api_secret: "f0onI-EAIlufTlOTKhvAxkyyycE",
    });
    await mongoose.connect(URL, { dbName: "blog-full" });
    console.log("Connect database successfully!");
  } catch (error) {
    console.log(error);
    console.log("Connect database fail!");
  }
};

module.exports = connectDatabase;
