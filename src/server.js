const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log("Error connecting to DB: ", err);
  });

app.listen(process.env.PORT || 5000, () => {
    console.log("Server started on port", process.env.PORT)
})