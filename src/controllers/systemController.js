const cloudinary = require("cloudinary").v2;
const Post = require("../models/Post");
const Image = require("../models/Image");

const createNewPost = async (req, res) => {
  try {
    const { title, description, categories, content, thumbnail } = req.body;
    const image = JSON.parse(thumbnail);
    if ((title, description, categories, content, thumbnail)) {
      const thumb = await Image.create({
        public_id: image?.id,
        url: image?.url,
      });
      await Post.create({
        title,
        description,
        categories: categories.split(","),
        content,
        thumbnail: thumb?._id,
      });
      res.status(201).json({ message: "Post created successfully" });
    } else {
      res.json({ message: "Post create err from server!" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Post create err from server!" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { categories, thumbnail } = req.body;
    const postUpdate = await Post.findById({ _id: id }).populate("thumbnail");
    if (thumbnail) {
      const dataImage = JSON.parse(thumbnail);
      // delete old thumbnail
      cloudinary.uploader.destroy(
        postUpdate?.thumbnail?.public_id,
        async (err, result) => {
          if (result) {
            await Image.findByIdAndUpdate(
              { _id: postUpdate?.thumbnail?._id },
              { public_id: dataImage?.id, url: dataImage?.url }
            );
            const dataUpdate = categories
              ? { ...req.body, categories: categories.split(",") }
              : { ...req.body };
            delete dataUpdate?.thumbnail;
            await Post.findByIdAndUpdate({ _id: id }, dataUpdate, {
              new: true,
            });
            res.status(200).json({ message: "Post update success" });
          } else {
            console.log(err);
            res.status(500).json({ error: "Post update error" });
          }
        }
      );
    } else {
      const dataUpdate = categories
        ? { ...req.body, categories: categories.split(",") }
        : { ...req.body };
      await Post.findByIdAndUpdate({ _id: id }, dataUpdate, { new: true });
      res.status(200).json({ message: "Post update success" });
    }
  } catch (error) {
    console.log(error);
    res.status().json({ message: "Can't update post. Server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById({ _id: id }).populate("thumbnail");
    cloudinary.uploader.destroy(
      post?.thumbnail?.public_id,
      async (err, results) => {
        if (results) {
          await Image.findByIdAndDelete({ _id: post?.thumbnail?._id });
          await Post.findByIdAndDelete({ _id: id });
          res.status(200).json({ message: "Delete post success!" });
        } else {
          console.log(err);
          res
            .status(500)
            .json({ message: "An error occurred while deleting the post" });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't delete post. Server error" });
  }
};

module.exports = {
  createNewPost,
  updatePost,
  deletePost,
};
