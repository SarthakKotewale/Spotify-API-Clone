const express = require('express')
const songRouter = express.Router()
const upload = require('../middlewares/upload')
const {protect, isAdmin} = require('../middlewares/auth')
const {createSong} = require('../controllers/songController')

const songUpload = upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]);

songRouter.post('/', protect, isAdmin, songUpload, createSong )

module.exports = songRouter