"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
const dns = require("dns");
var cors = require("cors");
var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});
app.listen(port, function() {
  console.log("Node.js listening ...");
});

/** this project needs a db !! **/

try {
  mongoose.connect(
    process.env.DB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    },
    () => console.log("connected to MongoDB")
  );
} catch (error) {
  console.log("could not connect to MongoDB");
}

const Url = mongoose.model(
  "Urls",
  new mongoose.Schema({
    original_url: { type: String, required: true },
    short_url: {
      type: Number,
      unique: true,
      required: true
    }
  })
);

// your first API endpoint...
app.get("/api/shorturl/:shortUrl", async(req, res) => {
  const urlNum = req.params.shortUrl;
  const data = await Url.findOne({short_url: urlNum});
  res.redirect(`https://${data['original_url']}`);

});
  
 
app.post("/api/shorturl/:new", function(req, res) {
  const url = req.body.url.split("/")[2];
  dns.lookup(url, (err, address) => {
    if (err) {
      res.json({ error: `${err.hostname} is an invalid URL` });
    } else {
      var createAndSaveURL = function(done) {
        const newUrl = new Url({
          original_url: url,
          short_url: Math.floor(Math.random() * 1000)
        });
        newUrl.save((err, data) => {
          if (err) done(err);
          res.send({original_url: data['original_url'], short_url: data['short_url']})
          done(null, data);
        });
        
      };
      createAndSaveURL(function() {});
    }
  });
});
