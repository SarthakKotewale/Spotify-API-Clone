const express = require('express')
const artistRouter = express.Router()
const {createArtist} = require('../controllers/artistController')
const {protect, isAdmin} = require('../middlewares/auth')
const upload = require('../middlewares/upload')

artistRouter.post('/', protect, isAdmin, upload.single("image"), createArtist)

module.exports = artistRouter