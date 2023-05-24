require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDatabase = require("./src/config/connectDatabase");
const systemRouter = require("./src/routes/system");
const postRouter = require("./src/routes/post");

const app = express();
const port = process.env.PORT || 8080;
const URL = process.env.URL_DB;
// config
app.use(
  cors({
    origin: process.env.URL_CLIENT,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// connect database
connectDatabase(URL);

// router
app.get("", (req, res) => res.send("Server on"));
app.use("/api/system", systemRouter);
app.use("/api/posts", postRouter);

app.listen(port, () => console.log(`Server running on port: ${port}`));
