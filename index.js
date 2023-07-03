require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { google } = require("googleapis");

const connectDatabase = require("./src/config/connectDatabase");
const systemRouter = require("./src/routes/system");
const postRouter = require("./src/routes/post");
const userRouter = require("./src/routes/user");

const app = express();
const port = process.env.PORT || 8080;
const URL = process.env.URL_DB;
const CLIENT_ID = process.env.OAUTH_CLIENTID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN;
const REDIRECT_URI = process.env.REDIRECT_URI;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
// config
app.use(
  cors({
    origin: process.env.URL_CLIENT,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// connect database
connectDatabase(URL);

// router
app.get("/", (req, res) => res.send("Server on"));
app.use("/api/user", userRouter);
app.use("/api/system", systemRouter);
app.use("/api/posts", postRouter);

app.listen(port, () => console.log(`Server running on port: ${port}`));
