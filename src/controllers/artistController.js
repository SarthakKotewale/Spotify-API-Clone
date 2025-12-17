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

const getArtists = async(req, res) => {
    try{
        const {genre, search, page = 1, limit = 10} = req.query
        const filter = {}
        if(genre){
            filter.genres = {$in: [genre]}
        }
        if(search){
            filter.$or = [
                {
                    name: {$regex: search, $options: "i"}
                },
                {
                    bio: {$regex: search, $options: "i"}
                }
            ]
        }

        const count = await Artist.countDocuments(filter)
        const skip = (parseInt(page) - 1) * parseInt(limit)
        
        const artists = await Artist.find(filter)
            .sort({followers: -1})
            .limit(parseInt(limit))
            .skip(skip)
        
            res.status(StatusCodes.OK).json({
                artists,
                page: parseInt(page),
                pages: Math.ceil(count / parseInt(limit)),
                totalArtists: count
            })
    }catch(error){
        console.error("Error in getArtists", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message })
    }
}


const getArtistById = async(req, res) => {
    try{
        const {id} = req.params
        const artist = await Artist.findById(id)
        if(artist){
            res.status(StatusCodes.OK).json(artist)
        }
    }catch(error){
        
        res.status(StatusCodes.NOT_FOUND)
        throw new Error("Artist not found")
    }
}

const updateArtist = async(req, res) => {
    try{
        const {name, bio, genres, isVerified} = req.body
        const {id} = req.params
        const artist = await Artist.findById(id)
        if(!artist){
            res.status(StatusCodes.NOT_FOUND);
            throw new Error("Artist not found");
        }

        artist.name = name || artist.name
        artist.bio = bio || artist.bio
        artist.genres = genres || artist.genres
        artist.isVerified = isVerified !== undefined ? isVerified === "true" : artist.isVerified

        if(req.file){
            const result = await uploadToCloudinary(req.file.path, "spotify/artists")
            artist.image = result.secure_url
        }

        const updatedArtist = await artist.save()
        res.status(StatusCodes.OK).json(updatedArtist)
    }catch(error){
        console.error("Error in updateArtist", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message })
    }
}

const deleteArtist = async(req, res) => {
    try{
        const {id} = req.params
        const artist = await Artist.findById(id)
        if(!artist){
            res.status(StatusCodes.NOT_FOUND)
            throw new Error("Artist not found")
        }
        await Song.deleteMany({artist: artist._id})
        await Album.deleteMany({artist: artist._id})
        
        await artist.deleteOne()
        res.status(StatusCodes.OK).json({message: "Artist Deleted"})
    }catch(error){
        console.error("Error in deleteArtist", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message })
    }
}

const getTopArtists = async(req, res) => {
    try{
        const {limit = 10} = req.query
        const artists = await Artist.find()
            .sort({followers: -1})
            .limit(parseInt(limit))
        res.status(StatusCodes.OK).json(artists)
    }catch(error){
        console.error("Error in getTopArtists", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message })
    }
}

module.exports = { createArtist, getArtists, getArtistById, updateArtist, deleteArtist, getTopArtists}