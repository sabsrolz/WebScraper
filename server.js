let express = require("express");
let logger = require("morgan");
let mongoose = require("mongoose");
let exphbs = require("express-handlebars");
let existingComments = [];
//scraping tools
let axios = require("axios");
let cheerio = require("cheerio");

//require db models
let db = require("./models/index");

let PORT = 3000;

//initialize Express
let app = express();

//morgan logger will be used for logging requests
app.use(logger("dev"));

//parse req.body as json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//folder for static files
app.use(express.static("public"));

//connect to Mongo DB
//name of db is webScraper
let MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/webScraper";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});

//Routing
//GET route to scrape website

app.get("/scraped", function(req, res) {
  axios.get("https://www.medicalnewstoday.com/").then(function(response) {
    let $ = cheerio.load(response.data);
    //console.log(data)
    //res.json(data)
    // let existingArticles = [];
    // db.Article.find({}).then(function(database) {
    //   database.forEach(element => existingArticles.push(element.title));
    //   console.log(existingArticles);

    let count = 0;
    let result = {};
    $("li").each(function(i, element) {
      result = {};
      count = count + 1;

      result.title = $(this)
        .children("a")
        .attr("title");
      //add domain to external link of article
      result.link =
        "https://www.medicalnewstoday.com" +
        $(this)
          .children("a")
          .attr("href");

      result.summary = $(this)
        .children("a")
        .children("span")
        .children("em")
        .text();

      //console.log(result);
      //check if article is already in db

      //create new article in db

      db.Article.create(result)
        .then(function(addedArticle) {
          //console.log(addedArticle);
        })
        .catch(function(error) {
          console.log(error);
        });
    });
    res.render("scraped", {
      count: count
    });
    //res.send("scraped!");
    // });
  });
});

//route to get all articles from db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(database) {
      res.json(database);
    })
    .catch(function(error) {
      res.json(error);
    });
});

//route to capture article by id and show related comments
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("Comment")
    .then(function(articleComment) {
      res.json(articleComment);
    })
    .catch(function(error) {
      res.json(error);
    });
});

//post route to save an article's comment or add to existing

app.post("/articles/:id", function(req, res) {
  //console.log(req.body);
  db.Comment.create(req.body)
    .then(function(newComment) {
      //existingComments.push(newComment._id);
      //console.log(existingComments);

      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { $push: { comment: newComment._id } },
        { new: true }
      );
    })
    .then(function(updatedArticle) {
      //console.log(existingComments);
      res.json(updatedArticle);
    })
    .catch(function(error) {
      res.json(error);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
