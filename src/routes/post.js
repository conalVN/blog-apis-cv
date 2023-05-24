const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.get("/all", postController.getAll);
router.get("", postController.getPostsWithQuery);
router.get("/limit", postController.getLimitPosts);
router.get("/tags", postController.getTags);
router.get("/random", postController.getRandom);
router.get("/:id", postController.getPostById);

module.exports = router;
