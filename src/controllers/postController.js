const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const CommentThread = require("../models/CommentThread");

const getAll = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("thumbnail")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't get posts! Server error" });
  }
};
const getPostsWithQuery = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const category = req.query.category;
    const perPage = 12;
    const start = (page - 1) * perPage;

    if (category) {
      const posts = await Post.find({ categories: { $in: [category] } })
        .populate("thumbnail")
        .skip(start)
        .limit(perPage)
        .sort({ createdAt: -1 });
      return res.json(posts);
    } else {
      const posts = await Post.find()
        .populate("thumbnail")
        .skip(start)
        .limit(perPage)
        .sort({ createdAt: -1 });
      return res.json(posts);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Can't get posts with query page & categories" });
  }
};
const getLimitPosts = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit;
    const start = (page - 1) * limit;
    const posts = await Post.find()
      .populate("thumbnail")
      .skip(start)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Can't get limit posts" });
  }
};
const getTags = async (req, res) => {
  try {
    const posts = await Post.find();
    const arr = [];
    for (let i of posts) {
      arr.push(i?.categories);
    }
    const tags = arr
      ?.flat()
      ?.reduce(
        (unique, item) => (unique.includes(item) ? unique : [...unique, item]),
        []
      );
    res.json(tags);
  } catch (error) {
    console.log(error);
    res.json({ message: "Can't get tags. Server error" });
  }
};
const getRandom = async (req, res) => {
  try {
    const posts = await Post.find().populate("thumbnail");
    const listRandom = [];
    const listIndex = [];
    for (let i = 0; listIndex.length < 6; i++) {
      const randomIndex = Math.floor(Math.random() * posts.length);
      if (!listIndex.includes(randomIndex)) {
        listIndex.push(randomIndex);
        listRandom.push(posts[randomIndex]);
      }
    }
    return res.json(listRandom);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't get random post" });
  }
};
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    let postData = {};
    const data = await Post.findById({ _id: id })
      .populate("thumbnail")
      .populate("comments");
    postData.data = data;
    postData.related = [];
    const arr = [];
    await Promise.all(
      data?.categories?.map(async (cate) => {
        const related = await Post.find({ categories: { $in: [cate] } });
        arr.push(...related);
      })
    );
    const newArr = arr.filter((obj, index, array) => {
      return (
        index ===
        array.findIndex(
          (item) => item?._id.equals(obj?._id) && item?.title === obj?.title
        )
      );
    });
    postData.related.push(...newArr);
    res.status(201).json(postData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't get post by id" });
  }
};
const getCommentThread = async (req, res) => {
  try {
    const { id } = req.params;
    const commentThread = await CommentThread.findOne({ post: id }).populate({
      path: "comments",
      populate: {
        path: "user",
        model: "User",
        select: "username",
      },
    });
    res.status(201).json(commentThread);
  } catch (error) {
    res.status(500).json({ err: error });
  }
};

const createComment = async (req, res) => {
  try {
    const token = req.cookies["access-token"];
    const user = jwt.verify(token, process.env.SECRET_KEY);
    const { id } = req.params;
    const { comment } = req.body;
    // create new comment
    const dataComment = await Comment.create({
      textDisplay: comment,
      user: user?.userId,
    });
    // push thread or create new
    let commentThread = await CommentThread.findOne({ post: id });
    if (!commentThread) {
      commentThread = CommentThread.create({
        post: id,
        comments: [dataComment._id],
      });
    } else {
      commentThread.comments.push(dataComment._id);
      await commentThread.save();
    }
    const newPost = await Post.findOneAndUpdate(
      { _id: id },
      { comments: commentThread._id }
    );
    await newPost.save();

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
  }
};

module.exports = {
  getAll,
  getPostsWithQuery,
  getLimitPosts,
  getPostById,
  getTags,
  getRandom,
  getCommentThread,
  createComment,
};
