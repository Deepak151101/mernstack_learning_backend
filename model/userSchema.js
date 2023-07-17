const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');

// Here we actually define the structure of document, how we want to store data
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  work: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});
// Above we have created a document or schema, now we need to attach this to our project- this can be done using models
// Creating models is like creating collections
// In MongoDB - A collection contains multiple documents

// We are hashing the password
userSchema.pre("save", async function (next) {
  // pre is a middleware hook by Mongoose schema that works before something in this case it will work before userSchema

  console.log("Hi from inside of password hashing");

  if (this.isModified("password")) {
    // If password is modified then only call save function (only when user himself changes the password field)
    // User password = Convert the password into 12 rounds of hash
    this.password = await bcrypt.hash(this.password, 12); // hash() is a inbuilt function of bcryptjs library  to hash the password
    this.cpassword = await bcrypt.hash(this.password, 12); // 12 indicates  number of rounds of hashing to be performed, providing a higher level of security
  }
  next(); // 'next()' function is called, which is a callback indicating that the middleware has completed its operation, and the next middleware or save operation can proceed.
});

// We are generating token
userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY); // Generating tokens - Here we get the id the user logged in from the database, we can understand for which email we need to generate token
    this.tokens = this.tokens.concat({ token: token }); // The Token in userSchema is to be added with the concat function, we add token

    await this.save(); // To save the token & save() returns a promise so we use await
    return token;

  } catch (err) {
    console.log(err);
  }
};
// userSchema is a instance & when working with a instance we need to use method

// Collection creation - model(collection_name , document_structure)
const User = mongoose.model("USER", userSchema);

module.exports = User;
