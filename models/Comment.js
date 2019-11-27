let mongoose = require("mongoose");

//reference to Schema constructor
let Schema = mongoose.Schema;

//create new Schema object for comment model

let CommentSchema = new Schema({
    title: String,
    body: String

});

//create model from article schema that we just created
let Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;