const User = require("../models/User");
const Artist = require("../models/Artist");
const Album = require("../models/Album");
const Song = require("../models/Song");
const {StatusCodes} = require('http-status-codes')
const { uploadToCloudinary } = require('../utils/cloudinaryUpload')

const createArtist = async (req, res) => {
    try {
        const { name, bio, genres } = req.body
        if (!name || !bio || !genres) {
            res.status(StatusCodes.BAD_REQUEST);
            throw new Error("Name, bio, genres are required");
        }

        const existingArtist = await Artist.findOne({ name })
        if (existingArtist) {
            res.status(StatusCodes.BAD_REQUEST);
            throw new Error("Artist already exists");
        }
        
        let imageUrl = "";
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path, "spotify/artists");
            imageUrl = result.secure_url;
        }

        const artist = await Artist.create({
            name,
            bio,
            genres,
            isVerified: true,
            image: imageUrl   
        })

        res.status(StatusCodes.CREATED).json(artist);
    } catch (error) {
        console.error("Error in createArtist", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message })
    }
}

module.exports = { createArtist }