const express = require("express");
const fs = require("fs");
const upload = require("express-fileupload");
const bodyParser = require("body-parser");
const https = require("https");

const app = express();

let videoName = "";

app.use(upload());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html")
})


app.post("/", (req, res) => {
  if (req.files) {
    let file = req.files.file;
    let fileName = file.name;
    file.mv(__dirname + '/' + fileName, function(err) {
      if (err) {
        console.log(err);
        res.send("Error Kindly upload Again")
      } else {
        res.redirect("/");
      }
    })
  }
})

app.post('/stream', (req, res) => {
  videoName = req.body.NameOfVideo;
  res.sendFile(__dirname + '/streaming.html');
})


app.get("/video", function(req, res) {
  const range = req.headers.range;
  if (!range) {
    res.send(400).send("Require Range header");
  }
  const videoPath = __dirname + "/" + videoName;
  const videoSize = fs.statSync(videoName).size;
  //parse Range
  //Example : 'bytes = 32324-'
  const CHUNK_SIZE = 10 ** 6; //1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, {
    start,
    end
  });

  videoStream.pipe(res);

});

app.post("/download", (req, res) => {
      videoName = req.body.NameOfVideo;
      res.download(videoName, function(error) {
        console.log("Error: ", error);
      })
    })

    app.listen(process.env.PORT || 3000, function() {
      console.log("Listening on port 3000");
    })
