const User = require('../models/user');

let auth = (req, res, next) => {
  let token = req.cookies.auth;

  User.findByToken(token, (err, user) => {
    if (err) {
      // Handle the error appropriately, such as logging or sending an error response
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }
    if (!user) {
      console.log('No user found');
      console.log('user', user);
      return res.redirect('/login?error=Please log in');
    }

    req.token = token;
    req.user = user;
    next();
  });
};
//hi
module.exports = { auth };

