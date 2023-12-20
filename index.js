require("dotenv").config();

const app = require("./middlewares");

require("./mongodb"); // Connect to MongoDB

// Endpoint to display files using EJS
app.get("/", require("./routes/render/index"));
app.get("/upload", require("./routes/render/upload"));

// Route to remove the share link associated with a file
app.delete("/removeShare/:id", require("./routes/share/removeShare"));

// Route to share a file and generate a unique shareable link
app.post("/share/:id", require("./routes/share/shareFile"));

// Route to view a file using shareable link
app.get("/view/:shareableLink", require("./routes/share/viewShare"));

// Route to upload a file
app.post("/upload", require("./routes/upload/uploadFile"));

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
  res.redirect("/");
});

app.listen(process.env.PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", process.env.PORT);
});
