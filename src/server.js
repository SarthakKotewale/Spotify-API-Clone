const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const { StatusCodes } = require("http-status-codes");
const dotenv = require("dotenv");
const userRouter = require("./routes/userRoutes");;

dotenv.config();

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database connected...");
  })
  .catch((err) => {
    console.log("Error connecting to database..", err.message);
  });

app.use(express.json());

//Routes
app.use("/api/users", userRouter);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = StatusCodes.NOT_FOUND;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: err.message || "Internal server Error",
    status: "error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is running on the port", PORT);
});
