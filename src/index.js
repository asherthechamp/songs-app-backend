const express = require("express");
const mongoose = require("mongoose");
const songsRouter = require("./routes/songs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.DATABASE_URI);

app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json());
app.use("/api/songs", songsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
