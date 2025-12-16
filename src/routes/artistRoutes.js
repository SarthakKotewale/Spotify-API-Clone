const express = require('express')
const artistRouter = express.Router()
const {createArtist, getArtists, getArtistById, updateArtist, deleteArtist} = require('../controllers/artistController')
const {protect, isAdmin} = require('../middlewares/auth')
const upload = require('../middlewares/upload')

artistRouter.post('/', protect, isAdmin, upload.single("image"), createArtist)
artistRouter.put('/:id', protect, isAdmin, upload.single("image"), updateArtist)
artistRouter.delete('/:id', protect, isAdmin, deleteArtist)

artistRouter.get('/', getArtists)
artistRouter.get('/:id', getArtistById)

module.exports = artistRouter