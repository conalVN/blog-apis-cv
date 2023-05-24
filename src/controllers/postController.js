const Post = require("../models/Post");

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
    const tag = req.query.tag;
    const perPage = 9;
    const start = (page - 1) * perPage;

    if (tag) {
      const posts = await Post.find({ categories: { $in: [tag] } })
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
    const data = await Post.findById({ _id: id }).populate("thumbnail");
    postData.data = data;
    postData.related = [];
    await Promise.all(
      data?.categories?.map(async (cate) => {
        const related = await Post.find({ categories: { $in: [cate] } });
        postData.related.push(...related);
      })
    );
    res.json(postData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Can't get post by id" });
  }
};

module.exports = {
  getAll,
  getPostsWithQuery,
  getLimitPosts,
  getPostById,
  getTags,
  getRandom,
};
