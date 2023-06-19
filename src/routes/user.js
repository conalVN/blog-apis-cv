const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/logout", userController.logout);
router.get("/refresh-token", userController.refreshToken);
router.get("/verify/:token", userController.verify);

module.exports = router;
