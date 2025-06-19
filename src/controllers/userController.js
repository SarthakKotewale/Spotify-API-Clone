const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

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
    return res.status(StatusCodes.UNAUTHORIZED).json({error: "Invalid email or password"})
  }
};

module.exports = { register, login };
