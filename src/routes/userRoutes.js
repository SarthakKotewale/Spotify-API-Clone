const express = require("express");
const {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  toggleLikeSong,
  toggleFollowArtist,
  toggleFollowPlaylist,
} = require("../controllers/userController");
const { protect } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);

userRouter.get("/profile", protect, getUserProfile)

userRouter.put(
  "/profile",
  protect,
  upload.single("profilePicture"),
  updateUserProfile
);

userRouter.put("/like-song/:id", protect, toggleLikeSong); //left to test
userRouter.put("/follow-artist/:id", protect, toggleFollowArtist); //left to test

userRouter.put("/follow-playlist/:id", protect, toggleFollowPlaylist); //left to test

module.exports = userRouter;
