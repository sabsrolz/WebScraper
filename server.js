let express = require("express");
let logger = require("morgan");
let mongoose = require("mongoose");

//scraping tools
let axios = require("axios");
let cheerio = require("cheerio");

//require db models
let db = require("./models");

let PORT = 3000;

//initialize Express
let app = express();

//morgan logger will be used for logging requests
app.use(logger("dev"));

//parse req.body as json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//folder for static files
app.use(express.static("public"));

//connect to Mongo DB
//name of db is webScraper
mongoose.connect("mongodb://localhost/webScraper", { userNewUrlParser: true });

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

//Routing
//GET route to scrape website

app.get("/scraped", function (req, res) {
    axios.get("https://www.medicalnewstoday.com/").then(function (response) {
        let $ = cheerio.load(response.data);
        //console.log(data)
        //res.json(data)
        let result = {};
        $("li").each(function (i, element) {

            result = {};

            result.title = $(this).children("a").attr("title");
            //add domain to external link of article
            result.link = "https://www.medicalnewstoday.com" + $(this).children("a").attr("href");

            result.summary = $(this).children("a").children("span").children("em").text();

            console.log(result)
        })


    })
})