// require() function is a built-in CommonJS module function supported in Node. js that lets you include modules within your project
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const express = require("express");

// app contains all methods & functions i.e to access to methods of express in variable 'app'
const app = express(); // Now with the help of app we can access the properties of express

// We have specified the path of file
dotenv.config({ path: "./config.env" }); // We store the connection to db in a separate 'config.env' file to keep our username and password secure/private to us, as we add the 'config.env' file to '.gitignore'. So it would ignore that file when we host the application
require("./db/conn");

// For our application to understand json data format as a input from user i.e data we need to use middleware
app.use(express.json());
// If we don't use it, we will get "undefined" on getting input from user

// Calling auth.js using middleware
// A Middleware is a function invoked by the Express routing layer before the final request handler
// We link the router files to make our route easy
app.use(require("./router/auth"));

const PORT = process.env.PORT; // To get port number from config.env (Keeps it private)

// Importing our schema - For using the schema in our app.js that we created in userSchema.js
const User = require("./model/userSchema");

// To print Hello World on screen (from backend)
// Syntax : app.get(path, callback) - APP ROUTING
// Here path = '/' represents root of our file (Acts like home page of our website)
// Callback has 2 parameters - Request & Response
app.get("/", (req, res) => {
  res.send("Hello World from the server app.js"); // Respond with "Hello World" when a get request is made to the homepage
});

// The server will give us the response 'Hello World' but how will the server know that the user is on that page (path = '/') ? So we need to listen to server that if user is on that particular root, then only give response as 'Hello world'

// We can use the page above (Hello World) if we use the port 3000 i.e localhost:3000
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});

// Middleware -
// After executing of req and res what next
const middleware = (req, res, next) => {
  console.log("Hello my Middleware");
  next(); // 'next()' function is called, which is a callback indicating that the middleware has completed its operation, and the next middleware or save operation can proceed.
};

// When we click on about middleware will first check if the user has login or not, if not then he will be redirected to login page first & then after login he can access About
app.get("/about", middleware, (req, res) => {
  res.send("Hello AboutMe from the server"); // When we use a Middleware in between '/about' & '(req,res)' then the middleware will work in between, to check if user is logged in, if yes then only he can access AboutMe page else using middleware we redirect him to login page
});

app.get("/contact", (req, res) => {
  res.cookie("Test", 'Deepak');
  res.send("Hello Contact from the server");
});

app.get("/signin", (req, res) => {
  res.send("Hello Login from the server");
});

app.get("/signup", (req, res) => {
  res.send("Hello Register from the server");
});
