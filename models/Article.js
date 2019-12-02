let mongoose = require("mongoose");

//reference to Schema constructor
let Schema = mongoose.Schema;

//create new Schema object for article model
//comment oject will take id of comment and link it to article
let ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  summary: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  comment: [
    {
      type: [Schema.Types.ObjectId],
      ref: "Comment"
    }
  ]
  //   comment: [String]
});

//create model from article schema that we just created
let Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
