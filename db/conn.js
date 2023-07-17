const mongoose = require("mongoose");

// Connect backend with database
const DB = process.env.DATABASE; // Inbuilt function of 'dotenv' to get the database (in mongo atlas) in "DB" variable

// Promise - return either 'yes' else 'no'
mongoose
  .connect(DB)
  .then(() => {
    console.log(`connection is successfull`); // If we get connected to the database
  })
  .catch((err) => console.log(`Not connected`)); // If connection cannot be done
