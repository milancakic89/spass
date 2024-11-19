exports.preventIfAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  next();
};
