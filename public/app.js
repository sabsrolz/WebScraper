//articles-section
//comments-section

$.getJSON("/articles", function(res) {
  for (let art = 0; art < res.length; art++) {
    $("#articles-section").append(
      `<p class = "article-clicked" data-id = ${res[art]._id}>Title: ${res[art].title}</br><a href = ${res[art].link} target="_blank">Link: ${res[art].link}</a ><div class = "small">Summary: ${res[art].summary}</div></br></p>`
    );
  }
});

$("#refresh-scrape").on("click", function() {
  $.ajax({
    method: "GET",
    url: "/scraped"
  }).then(function(res) {
    setTimeout(function() {
      // wait for 5 secs(2)
      location.reload(); // then reload the page.(3)
    }, 1000);
    console.log("scrape completed");
  });
});
//to display comments
$(document).on("click", "p", function() {
  $("#comments-section").empty();

  let idSelected = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + idSelected
  }).then(function(res) {
    $("#comments-section").append(
      "<h5>" + "Article selected: " + res.title + "</h5>"
    );
    // An input to enter a new title
    $("#comments-section").append(
      "<input id='titleinput' name='title' class = 'col-md-2' >"
    );
    // A textarea to add a new note body
    $("#comments-section").append(
      "<input id='bodyinput' name='body' class = 'col-md-4'>"
    );
    // A button to submit a new note, with the id of the article saved to it
    $("#comments-section").append(
      "<button data-id='" + res._id + "' id='savecomment'>Save Comment</button>"
    );

    // If there's a note in the article
    if (res.comment) {
      // Place the title of the note in the title input
      $("#titleinput").val(res.comment.title);
      // Place the body of the note in the body textarea
      $("#bodyinput").val(res.comment.body);
    }
  });
});

// When you click the savenote button
$(document).on("click", "#savecomment", function() {
  // Grab the id associated with the article from the submit button
  let idSelected = $(this).attr("data-id");
  console.log(idSelected);
  // Run a POST request to change the comment, using what's entered in the inputs
  console.log($("#titleinput").val());
  console.log($("#bodyinput").val());
  $.ajax({
    method: "POST",
    url: "/articles/" + idSelected,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(res) {
      // Log the response
      // Empty the notes section
      $("#comments-section").empty();
    });

  // Also, remove the values entered in the input and textarea for comment entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
