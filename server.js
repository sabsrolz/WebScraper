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

            //create new article in db
            db.Article.create(result).then(function (addedArticle) {
                console.log(addedArticle)
            }).catch(function (error) {
                console.log(error)
            })
        })

        res.send("scraped!")
    })
})

//route to get all articles from db
app.get("/articles", function (req, res) {
    db.Article.find({}).then(function (database) {
        res.json(database)
    }).catch(function (error) {
        res.json(error)
    })
})

//route to capture article by id and show related comments
app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id }).populate("Comment").then(function (articleComment) {
        res.json(articleComment);
    }).catch(function (error) {
        res.json(error)
    });
});

//post route to save an article's comment or add to existing
app.post("/articles/:id", function (req, res) {
    db.Comment.create(req.body).then(function (newComment) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: newComment._id }, { new: true });
    }).then(function (updatedArticle) {
        res.json(updatedArticle)
    }).catch(function (error) {
        res.json(error)
    })
})

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});