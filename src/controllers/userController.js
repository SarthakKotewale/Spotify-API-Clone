const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const Song = require("../models/Song");
const Album = require("../models/Album");
const Playlist = require("../models/Playlist");
const Artist = require("../models/Artist")
const generateToken = require("../utils/generateToken");
const { uploadToCloudinary } = require('../utils/cloudinaryUpload')

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Name, email and password are required!" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User with this email already exists." });
    }

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(StatusCodes.CREATED).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST);
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist && (await userExist.matchPassword(password))) {
      return res.status(StatusCodes.OK).json({
        _id: userExist._id,
        email: userExist.email,
        isAdmin: userExist.isAdmin,
        profilePicture: userExist.profilePicture,
        token: generateToken(userExist._id),
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: "Invalid email or password" })
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("likedSongs", "title artist duration")
      .populate("likedAlbums", "title artist coverImage")
      .populate("followedArtists", "name image")
      .populate("followedPlaylists", "name creator coverImage")

    return res.status(StatusCodes.OK).json(
      user
    )
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.NOT_FOUND).json({ error: "User not found. Can't get the profilee" })
  }
}

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const { name, email, password } = req.body
    if (user) {
      user.name = name || user.name
      user.email = email || user.email
      if (password) {
        user.password = password
      }
      if (req.file) {
        const result = await uploadToCloudinary(req.file.path, "spotify/users")
        user.profilePicture = result.secure_url
      }
      const updatedUser = await user.save()
      res.status(StatusCodes.OK).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        isAdmin: updatedUser.isAdmin,
      })
    }
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.NOT_FOUND).json({ error: "Can't update user" })
  }
}

const toggleLikeSong = async (req, res) => {
  try {
    const songId = req.params.id
    const user = await User.findById(req.user._id)
    if (!user) {
      res.status(StatusCodes.NOT_FOUND)
      throw new Error("User not found")
    }

    const song = await Song.findById(songId)
    if (!song) {
      res.status(StatusCodes.NOT_FOUND)
      throw new Error("Song not found")
    }

    const songIndex = user.likedSongs.indexOf(songId)
    if (songIndex === -1) {
      user.likedSongs.push(songId)
      song.likes += 1
    } else {
      user.likedSongs.splice(songIndex, 1)
      if (song.likes > 0) {
        song.likes -= 1
      }
    }

    await Promise.all([user.save(), song.save()])

    res.status(StatusCodes.OK).json({
      likedSongs: user.likedSongs,
      message: songIndex === -1 ? "Song added to liked songs" : "Song removed from liked songs"
    })
  } catch (error) {
    console.error("Error in toggleLikeSong", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message })
  }
}

const toggleFollowArtist = async (req, res) => {
  try {
    const artistId = req.params.id
    const user = await User.findById(req.user._id)
    const artist = await Artist.findById(artistId)

    if (!user) {
      res.status(StatusCodes.NOT_FOUND)
      throw new Error("User not found")
    }
    if (!artist) {
      res.status(StatusCodes.NOT_FOUND)
      throw new Error("Artist not found")
    }

    const artistIndex = user.followedArtists.indexOf(artistId)
    if (artistIndex === -1) {
      user.followedArtists.push(artistId)
      artist.followers += 1
    } else {
      user.followedArtists.splice(artistIndex, 1)
      if (artist.followers > 0) {
        artist.followers -= 1
      }
    }

    await Promise.all([user.save(), artist.save()])
    res.status(StatusCodes.OK).json({
      followedArtists: user.followedArtists,
      message: artistIndex === -1 ? "Artist followed" : "Artist unfollowed",
    });

  } catch (error) {
    console.error("Error in toggleFollowArtist", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message })
  }
}

const toggleFollowPlaylist = async (req, res) => {
  try {
    const playlistId = req.params.id
    const user = await User.findById(req.user._id)
    const playlist = await Playlist.findById(playlistId)

    if (!user) {
      res.status(StatusCodes.NOT_FOUND)
      throw new Error("User not found")
    }
    if (!playlist) {
      res.status(StatusCodes.NOT_FOUND)
      throw new Error("Playlist not found")
    }
    const playlistIndex = user.followedPlaylists.indexOf(playlistId)
    if (playlistIndex === -1) {
      user.followedPlaylists.push(playlistId)
      playlist.followers += 1
    } else {
      user.followedPlaylists.splice(playlistIndex, 1)
      if (playlist.followers > 0) {
        playlist.followers -= 1
      }
    }
    await Promise.all([user.save(), playlist.save()])
    res.status(StatusCodes.OK).json({
      followedPlaylists: user.followedPlaylists,
      message: playlistIndx === -1 ? "Playlist followed" : "Playlist unfollowed",
    });
  } catch (error) {
    console.error("Error in toggleFollowPlaylist ", error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message })

  }
}

module.exports = { register, login, getUserProfile, updateUserProfile, toggleLikeSong, toggleFollowArtist, toggleFollowPlaylist };