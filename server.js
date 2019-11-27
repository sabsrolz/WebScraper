let express = require("express");
let logger = require("logger");
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
//mongoose.connect("mongodb://localhost/app", { userNewUrlParser: true });

