const express = require("express");
const systemController = require("../controllers/systemController");
const router = express.Router();

router.post("/create", systemController.createNewPost);

router.put("/update/:id", systemController.updatePost);

router.delete("/:id", systemController.deletePost);

module.exports = router;
