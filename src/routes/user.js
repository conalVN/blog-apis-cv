const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/verify", userController.verify);

module.exports = router;
