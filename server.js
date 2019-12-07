let express = require("express");
let logger = require("morgan");
let mongoose = require("mongoose");
let exphbs = require("express-handlebars");
require("dotenv");
let existingComments = [];
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
//console.log(process.env.MONGODB_URI);
// mongoose.connect(
//   "mongodb://sabsrolz@umich.edu:Coqui123@ds017248.mlab.com:17248/heroku_dpjcfv0b",
//   {
//     useNewUrlParser: true
//   }
// );

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

app.post("/real-articles/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(newComment) {
      console.log(req.params);
      // return db.Article.findOneAndUpdate(
      //   { _id: req.params.id },
      //   { $push: { comment: "test" } },
      //   { new: true },
      //   { useFindAndModify: false }
      // );
      // db.Article.update(
      //   { _id: req.params.id },
      //   { $push: { comment: newComment._id } },
      //   { new: true }
      // ),
      //   then(function(test) {
      //     console.log(test);
      //   });
    })
    .then(function(updatedArticle) {
      console.log(updatedArticle);
      res.json(updatedArticle);
    })
    .catch(function(error) {
      res.json(error);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body)
    .then(function(doc) {
      console.log("Document created:", doc);
    })
    .catch(function(error) {
      console.log("ERROR could not create document");
      res.json(error);
    });

  db.Article.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { comment: req.body } },
    { new: true },
    function(err, doc) {
      if (err) console.log("ERROR!");
      console.log("Document updated!", doc);
    }
  );
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
