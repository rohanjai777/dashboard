const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to log in first.");
  res.redirect("/");
};

module.exports = isLoggedIn;
