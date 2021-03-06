const express = require("express");
const app = express();
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
require("dotenv").config();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

//MongoURI
const mongoURI =
  process.env.MONGODB_URI ||
  "mongodb+srv://admin:admin@cluster0.huiu0.mongodb.net/AudioDatabase?retryWrites=true&w=majority";

//create mongo connection
const conn = mongoose.createConnection(mongoURI);
// const promise = mongoose.connect(mongoURI, { useNewUrlParser: true });

// const conn = mongoose.connection;

let gfs;

conn.once("open", () => {
  // init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

const rejecterror = (req, res) => {
  console.log("Error while uploading File");
};

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // crypto.randomBytes(16, (err, buf) => {
      //   if (err) {
      //     return reject(err);
      //   }
      const fileName = file.originalname;
      const fileInfo = {
        filename: fileName,
        bucketName: "uploads",
      };
      resolve(fileInfo);
    });
    // reject(rejecterror());
    //   });
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

app.post("/upload", upload.single("audioFile"), (req, res) => {
  res.json({ file: req.file });
});

// app.post("/uploadString", (req, res) => {
//   const fileString = req.body.audioFile;
//   console.log(req.body.audioFile);
//   const buff = Buffer.from(fileString, "utf-8");
//   console.log(buff);

//   console.log(buff.toString());
// });

app.get("/getFiles", (req, res) => {
  gfs.files.find().toArray((error, files) => {
    //Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "No files found" });
    }
    return res.json({ files: files });
  });
});

app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
