const express = require("express");
const router = express.Router();
const brcypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

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

      res.cookie("jwtoken", token, { // respond a cookie a inbuilt function to store token into cookie, with 2 parameters - Name of cookie & what value we want to store, when should the cookie expire, and where we can add it (http or https)
        expires: new Date(Date.now() + 2589200000), // Here we expire the user's token from current date to 30 days later...25892000000 is in miliseconds
        httpOnly: true // Ensures it will work even if our page is not secure i.e https
      });

      if (!isMatch) {
        res.status(400).json({  error: "Enter correct credentials" }); // If password credentials don't match
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

module.exports = router;
