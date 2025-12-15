const express = require('express')
const artistRouter = express.Router()
const {createArtist, getArtists, getArtistById} = require('../controllers/artistController')
const {protect, isAdmin} = require('../middlewares/auth')
const upload = require('../middlewares/upload')

artistRouter.post('/', protect, isAdmin, upload.single("image"), createArtist)

artistRouter.get('/', getArtists)
artistRouter.get('/:id', getArtistById)

module.exports = artistRouter