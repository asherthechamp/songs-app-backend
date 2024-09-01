const express = require("express");
const Song = require("../models/song");
const router = express.Router();

// Create a new song
router.post("/", async (req, res) => {
  try {
    const song = new Song(req.body);
    await song.save();
    res.status(201).send(song);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Read all songs
router.get("/", async (req, res) => {
  try {
    const filter = req.query.filter || "";
    //const songs = await Song.find({});
    const songs = await Song.find({ title: { $regex: filter, $options: "i" } });
    res.send(songs);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read a song by ID
router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).send();
    }
    res.send(song);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a song by ID
router.patch("/:id", async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!song) {
      return res.status(404).send();
    }
    res.send(song);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a song by ID
router.delete("/:id", async (req, res) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) {
      return res.status(404).send();
    }
    res.send(song);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalSongs = await Song.countDocuments();
    const totalArtists = await Song.distinct("artist").then(
      (artists) => artists.length
    );
    const totalAlbums = await Song.distinct("album").then(
      (albums) => albums.length
    );
    const totalGenres = await Song.distinct("genre").then(
      (genres) => genres.length
    );

    const songsByGenre = await Song.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
    ]);

    const songsByArtist = await Song.aggregate([
      { $group: { _id: "$artist", count: { $sum: 1 } } },
    ]);

    const albumsByArtist = await Song.aggregate([
      { $group: { _id: "$artist", albums: { $addToSet: "$album" } } },
      { $project: { artist: "$_id", albums: { $size: "$albums" } } },
    ]);

    const songsByAlbum = await Song.aggregate([
      { $group: { _id: "$album", count: { $sum: 1 } } },
    ]);

    res.send({
      totalSongs,
      totalArtists,
      totalAlbums,
      totalGenres,
      songsByGenre,
      songsByArtist,
      albumsByArtist,
      songsByAlbum,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
