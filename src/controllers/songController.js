const { StatusCodes } = require("http-status-codes");
const User = require('../models/User')
const Album = require("../models/Album");
const Playlist = require("../models/Playlist");
const Artist = require("../models/Artist");
const Song = require("../models/Song")
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");
const mm = require('music-metadata');

const createSong = async (req, res) => {
    try {
        const { title, artistId, albumId, genre, lyrics, isExplicit, featuredArtists } = req.body
        const artist = await Artist.findById(artistId)
        if (!artist) {
            res.status(StatusCodes.NOT_FOUND);
            throw new Error("Artist not found");
        }
        if (albumId) {
            const album = await Album.findById(albumId)
            if (!album) {
                res.status(StatusCodes.NOT_FOUND);
                throw new Error("Album not found");
            }
        }
        if (!req.files || !req.files.audio) {
            res.status(StatusCodes.BAD_REQUEST);
            throw new Error("Audio file is required");
        }
        const audioPath = req.files.audio[0].path
        const metadata = await mm.parseFile(audioPath)
        const durationInSeconds = Math.floor(metadata.format.duration)

        const audioResult = await uploadToCloudinary(audioPath, "spotify/songs")

        let coverImageUrl = ""
        if (req.files && req.files.cover) {
            const imageResult = await uploadToCloudinary(req.files.cover[0].path, "spotify/covers")
            coverImageUrl = imageResult.secure_url
        }

        // let parsedDuration = duration;
        // if (typeof duration === "string" && duration.includes(":")) {
        //     const [minutes, seconds] = duration.split(":").map(Number);
        //     parsedDuration = minutes * 60 + seconds;
        // }

        const song = await Song.create({
            title,
            artist: artistId,
            album: albumId || null,
            duration: durationInSeconds,
            audioUrl: audioResult.secure_url,
            genre,
            lyrics,
            isExplicit: isExplicit === 'true',
            featuredArtists: featuredArtists ? JSON.parse(featuredArtists) : [],
            coverImage: coverImageUrl
        })

        artist.songs.push(song._id)
        await artist.save()

        if (albumId) {
            const album = await Album.findById(albumId)
            album.songs.push(song._id)
            await album.save()
        }
        res.status(StatusCodes.CREATED).json(song)
    } catch (error) {
        console.error("Error in createSong", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong", error: error.message })
    }
}

module.exports = { createSong }