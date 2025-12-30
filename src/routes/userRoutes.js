const express = require("express");
const {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  toggleLikeSong,
  toggleLikeAlbum,
  toggleFollowArtist,
  toggleFollowPlaylist,
} = require("../controllers/userController");
const { protect } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const {
  registerSchema,
  loginSchema,
} = require("../validations/auth.validation");
const validateRequest = require("../middlewares/validateRequest");

const userRouter = express.Router();

userRouter.post("/register", validateRequest(registerSchema), register);
userRouter.post("/login", validateRequest(loginSchema), login);

userRouter.get("/profile", protect, getUserProfile);

userRouter.put(
  "/profile",
  protect,
  upload.single("profilePicture"),
  updateUserProfile
);

userRouter.put("/like-song/:id", protect, toggleLikeSong);
userRouter.put("/like-album/:id", protect, toggleLikeAlbum); //left to test
userRouter.put("/follow-artist/:id", protect, toggleFollowArtist);

userRouter.put("/follow-playlist/:id", protect, toggleFollowPlaylist); //left to test

module.exports = userRouter;
