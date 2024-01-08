require("dotenv").config();

const app = require("./middlewares");

require("./mongodb"); // Connect to MongoDB

// Endpoint to display files using EJS
app.get("/", (req, res) => (!req.isAuthenticated() ? res.redirect("/auth/google") : res.redirect("/search")));

app.get("/up", (req, res) => res.json({ status: "up" }));

app.get("/search", require("./routes/render/search"));
app.get("/search/get", require("./routes/search/getFiles"));

app.get("/upload", require("./routes/render/upload"));

// Route to view a file using shareable link
app.get("/:link", require("./routes/render/view"));

// Route to get a file using shareable link
app.get("/get/:link", require("./routes/video/getMasterPlaylist"));

app.get("/get/:link/:resolution", require("./routes/video/getResolutionPlaylist"));

app.get("/get/:link/:resolution/:segmentId", require("./routes/video/getResolutionSegment"));

// Route to upload a file
app.post("/upload", require("./routes/upload/uploadFile"));

app.post("/convert/:id", require("./routes/upload/convertFile"));

// Route for file removal
app.post("/delete/:id", require("./routes/upload/deleteFile"));

const passport = require("./auth");

// Routes for authentication
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Routes for authentication
app.get("/auth/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/google");
  });
});

app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
  // Successful authentication, redirect or do something else
  res.redirect("/search");
});

app.listen(process.env.PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", process.env.PORT);
});
