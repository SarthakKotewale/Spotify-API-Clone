const express = require('express')
const artistRouter = express.Router()
const {createArtist, getArtists, getArtistById, updateArtist, deleteArtist, getTopArtists, getArtistTopSongs} = require('../controllers/artistController')
const {protect, isAdmin} = require('../middlewares/auth')
const upload = require('../middlewares/upload')

artistRouter.post('/', protect, isAdmin, upload.single("image"), createArtist)
artistRouter.put('/:id', protect, isAdmin, upload.single("image"), updateArtist)
artistRouter.delete('/:id', protect, isAdmin, deleteArtist)

artistRouter.get('/', getArtists)
artistRouter.get('/top', getTopArtists)
artistRouter.get('/:id', getArtistById)
artistRouter.get("/:id/top-songs", getArtistTopSongs);
module.exports = artistRouter