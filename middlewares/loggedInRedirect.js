const User = require('../models/user');

const redirectLoggedIn = (req, res, next) => {
  let token = req.cookies.auth;
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (user) {
      return res.redirect('/library'); // Redirect to a different page if the user is logged in
    }
    next();
  });
};

module.exports = redirectLoggedIn;
