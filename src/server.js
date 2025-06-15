const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRouter = require("./routes/userRoutes");

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

app.use(express.json());
app.use("/api/users", userRouter);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server started on port", process.env.PORT);
});
