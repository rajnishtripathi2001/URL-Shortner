const express = require("express");
const bodyParser = require("body-parser");
const { customAlphabet } = require("nanoid");
const fs = require("fs");
const mongoose = require("mongoose");

const app = express();
const port = 3000;
const urlDataFile = "urlData.json";

// Function to read data from the JSON file
function readUrlData() {
  try {
    const data = fs.readFileSync(urlDataFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

// Function to write data to the JSON file
function writeUrlData(data) {
  fs.writeFileSync(urlDataFile, JSON.stringify(data, null, 2), "utf8");
}

// In-memory data store to store the shortened URLs.
let urlStore = readUrlData();

// Function to generate a random short URL using nanoid.
const generateShortUrl = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
  6
);

app.use(express.json());


const URL=mongoose.Schema({
  short_url:String,
  destination_url:String,
})
const Url=mongoose.model("Url",URL)
app.post("/api/shorten", async(req, res) => {
    const { destination_url } = req.body;
  
    if (!destination_url) {
      return res.status(400).json({ error: "Destination URL is required." });
    }
  
    const short_url = generateShortUrl();
    urlStore[short_url] = destination_url;
    const url=new Url({short_url,destination_url})
  
    await url.save()
    writeUrlData(urlStore); // Update the file with the new data
  
    res.status(201).json({ short_url:"http://localhost:3000/"+short_url, destination_url });
  });

// Route to handle redirection from short URL to the original URL.
app.get("/:short_url", (req, res) => {
  const { short_url } = req.params;
  const destination_url = urlStore[short_url];

  if (!destination_url) {
    return res.status(404).json({ error: "Short URL not found." });
  }

  res.redirect(destination_url);
});

mongoose.connect("mongodb+srv://rajnishtripathi2001:victor$rct1A@codiopy.ewnwvnb.mongodb.net/?retryWrites=true&w=majority").then(()=>{console.log("hdfjidjfe")})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

