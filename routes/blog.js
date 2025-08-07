const express = require("express");
const router = express.Router();
const { Blog } = require("../models/blog");
const { Comment } = require("../models/comment");
const streamifier = require('streamifier');
const cloudinary = require("../middleware/cloudinary");

const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage();

//old code
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.resolve(`./public/uploads`));
//   },
//   filename: function (req, file, cb) {
//     const filename = `${Date.now()}-${file.originalname}`;
//     cb(null, filename);
//   },
// });

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  const comment = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy"
  );
  return res.render("blog", { user: req.user, blog, comment });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  let coverImageURL = "";
  
  if (req.file) {

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "blogCovers" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    coverImageURL = result.secure_url;
  }
  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL,
  });
  return res.redirect(`/blog/${blog._id}`);
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
