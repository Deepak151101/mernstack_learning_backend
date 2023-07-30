const express = require("express");
const router = express.Router();
const brcypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");
const cookieParser = require("cookie-parser"); // Import cookie-parser
router.use(cookieParser()); // Use cookie-parser middleware

require("../db/conn");
const User = require("../model/userSchema");

router.get("/", (req, res) => {
  res.send("Hello World from the server router js"); // Respond with "Hello World" when a get request is made to the homepage
});

// If user goes to (/register) & enters the data, we get it on backend using post method

// Registration route
// Async-Await
router.post("/register", async (req, res) => {
  // console.log(req.body); // The data of user entered is received to us

  // To get all fields using just by writing name of field -
  const { name, email, phone, work, password, cpassword } = req.body; // To get data
  //   console.log(name); // Gives only name

  if (!name || !email || !phone || !work || !password || !cpassword) {
    return res.status(422).json({ error: "Please fill the field properly" });
  } // Check validation of data

  try {
    // Left email is Database email & Right side is the email user is filling while registering, it should not be same if yes then user is already registered.
    // Promise - .then() will execute when it is fulfilled i.e if email is already present in database
    const userExist = await User.findOne({ email: email }); // Check if user is registered

    if (userExist) {
      return res.status(422).json({ error: "Email already exists" }); // If user is already existing
    } else if (password != cpassword) {
      // Check if confirm pass is same as pass

      return res.status(422).json({ error: "Password is not matching" });
    } else {
      // If user doesnt exist then get the data
      const user = new User({ name, email, phone, work, password, cpassword });

      // MIDDLEWARE - (Works between getting data & saving data in db). Here before saving data in database we need to hash the user's password

      // Now in 'user' all data of the user entered is stored, now we need to save this data in our database collection
      await user.save();

      const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    }

    res.status(201).json({ message: "User registered successfully" }); // Give this msg after getting all data
  } catch (err) {
    console.log("Error occured");
  }
  // This catch() will work if the 'findOne' command won't work due to some error

  // res.json({ message : res.body });
  //   res.send("My register page");
});

// Login route
// Here we use post method as we are passing data from frontend to backend
router.post("/signin", async (req, res) => {
  // console.log(req.body); // To get data from user (in login page)

  try {
    let token;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please fill the data" }); // First Validate if user has filled the details
    }

    const userLogin = await User.findOne({ email: email }); // Validate if the email from database is equals to the email the user just entered, FindOne finds the email (or any data) from the database
    // console.log(userLogin); // If we login using correct credentials present in db, we get all other details of that user that just logged in

    if (userLogin) {
      const isMatch = await brcypt.compare(password, userLogin.password); // Used to verify if the password user entered when login (1st parameter) is equal to userLogin.password i.e we check the email stored in database has same password

      token = await userLogin.generateAuthToken(); // Generate token & then store in DB
      console.log(token);

      // Generate cookie
      res.cookie("jwtoken", token, {
        // respond a cookie a inbuilt function to store token into cookie, with 2 parameters - Name of cookie & what value we want to store, when should the cookie expire, and where we can add it (http or https)
        expires: new Date(Date.now() + 2589200000), // Here we expire the user's token from current date to 30 days later...25892000000 is in miliseconds
        httpOnly: true, // Ensures it will work even if our page is not secure i.e https
        secure: false, // Set this to true when using HTTPS
      });

      if (!isMatch) {
        res.status(400).json({ error: "Enter correct credentials" }); // If password credentials don't match
      } else {
        res.json({ message: "User signin successful" }); // Give this msg on login
      }
    } else {
      res.status(400).json({ error: "Enter correct credentials" }); // If email credentials don't match
    }
  } catch (err) {
    console.log(err);
  }
});

// About us page
router.get("/about", authenticate, (req, res) => {
  // authenticate is a middleware
  console.log("Hello my About");
  console.log("User's JWT token:", req.cookies.jwtoken); // Verify that the token is received
  res.send(req.rootUser);
});

// Get user data for contact us & home page
router.get("/getdata", authenticate, (req, res) => {
  res.send(req.rootUser);
});

// Contact Us page
router.post("/contact", authenticate, async (req, res) => {
  try {
    // We need to get data that user has entered in contact page. All details of user Name, Email, Phone, Message must be received

    const { name, email, phone, message } = req.body; // Object Destructuring

    // Check if user hasn't sent empty data as -
    if (!name || !email || !phone || !message) {
      console.log("Error in contact form");
      return res.json({ error: "Please fill the contact form" });
    }

    // Now, we need to upload the message in the database of that particular user

    const userContact = await User.findOne({ _id: req.userID }); // From auth.js line 10

    if (userContact) {
      const userMessage = await userContact.addMessage(
        name,
        email,
        phone,
        message
      );

      await userContact.save();

      res.status(201).json({ message: "User contact successfully" });
    }
  } catch (error) {
    console.log(error);
  }
});
// Logout page
router.get("/logout", (req, res) => {
  // authenticate is a middleware
  console.log("Hello my Logout Page");
  res.clearCookie("jwtoken", { path: "/" }); // Clear the cookies & go to home page '/'
  res.status(200).send("User logout");
});

module.exports = router;
