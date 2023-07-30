const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
// const cookieParser = require('cookie-Parser');

// router.use(cookieParser());

const Authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwtoken; // We get the token
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY); // We compare already present token with secret key to verify if it's that user only

    const rootUser = await User.findOne({
      _id: verifyToken._id,
      "tokens.token": token,
    }); // We check if user belongs or not , if id and token matches with token then user is genuine

    if (!rootUser) {
      throw new Error("User not found");
    }

    req.token = token;
    req.rootUser = rootUser;
    req.userID = rootUser._id;

    next(); // For next function to run
  } catch (err) {
    res.status(401).send("Unauthorized: no token provided");
    console.log(err);
  }
};

module.exports = Authenticate;
