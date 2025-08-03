const jwt = require("jsonwebtoken");

const secret = "mohammedSamee#LearningBackend";

function creatTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    profileImageURL: user.profileImageURL,
    role: user.role,
  };
  return jwt.sign(payload, secret);
}

function validateToken(token) {
  try {
    return jwt.verify(token, secret);  // it will return the decoded payload of the JWT.
  } catch (error) {
    return null;
  }
}

module.exports = {
  creatTokenForUser,
  validateToken,
};
