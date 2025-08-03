const mongoose = require("mongoose");
const { createHash, randomBytes, createHmac } = require("node:crypto");
const { creatTokenForUser } = require("../services/authentication");
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

//----hashing----//
userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  const salt = randomBytes(16).toString("hex");

  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  // salt = this.salt;
  user.salt = salt;
  user.password = hashedPassword;
  next();
});
//-----------//

//----signin----//
userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("user not found");

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
      .update(password) // hashing the password provided by user
      .digest("hex");

    if (hashedPassword !== userProvidedHash)
      throw new Error("Incorrect password");

    const token = creatTokenForUser(user);
    return token;
  }
);

const User = mongoose.model("user", userSchema);
module.exports = {
  User,
};
