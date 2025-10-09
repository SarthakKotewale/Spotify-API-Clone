const express = require('express')
const songRouter = express.Router()
const upload = require('../middlewares/upload')
const {protect, isAdmin} = require('../middlewares/auth')
const {createSong, getSongs, getSongById, updateSong, deleteSong} = require('../controllers/songController')

const songUpload = upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]);

songRouter.post('/', protect, isAdmin, songUpload, createSong )
songRouter.get('/', getSongs)
songRouter.get('/:id', getSongById)

songRouter.put('/:id', songUpload, protect, isAdmin, updateSong)
songRouter.delete('/:id', protect, isAdmin, deleteSong)

module.exports = songRouter