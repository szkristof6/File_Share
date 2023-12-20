module.exports = (req, res) => {
  if (!req.isAuthenticated()) {
    res.render("login"); // Redirect to login if user is not authenticated
  } else {
    res.redirect("/"); // Redirect to login if user is not authenticated
  }
};
