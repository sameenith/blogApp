const express = require("express");
const mongoose = require("mongoose");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
const { Blog } = require("./models/blog");
require("dotenv").config();

const path = require("path");

const app = express();
const PORT = process.env.PORT;
// const MONGO_URL = process.env.MONGO_URL;
MONGO_URL =
  "mongodb+srv://adnanq61:oU41ky7XPmiZEeSi@cluster0.abqftrf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log("MongoDB URL:", MONGO_URL);
mongoose
  .connect(MONGO_URL)
  .then((e) => {
    console.log("mogoDb connected!!!");
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public"))); // it means public folder me jo bhi h use ham statically resolve kr skte ho

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  return res.render("homePage", { user: req.user, blogs: allBlogs });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log(`server is started at PORT: ${PORT}`);
});
