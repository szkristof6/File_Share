module.exports = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("upload", { user: req.user._json }); // Redirect to login if user is not authenticated
  } else {
    res.redirect("/auth/google"); // Redirect to login if user is not authenticated
  }
};
