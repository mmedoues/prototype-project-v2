const express = require('express');
const router = express.Router();
const pathModule = require('path');
const redirectLoggedIn = require('../middlewares/loggedInRedirect');
const User=require('../models/user');

const { auth } = require('../middlewares/auth'); // Update import statement

// Define your routes dynamically
const pages = [
  { path: '/', page: 'land', useAuthMiddleware: false },
  { path: '/about', page: 'about', useAuthMiddleware: true },
  { path: '/10th-grade', page: '10th-grade', useAuthMiddleware: true },
  { path: '/11th-grade', page: '11th-grade', useAuthMiddleware: true },
  { path: '/12th-grade', page: '12th-grade', useAuthMiddleware: true },
  { path: '/404', page: '404', useAuthMiddleware: false },
  { path: '/4042', page: '4042', useAuthMiddleware: false },
  { path: '/7th-grade', page: '7th-grade', useAuthMiddleware: true },
  { path: '/8th-grade', page: '8th-grade', useAuthMiddleware: true },
  { path: '/9th-grade', page: '9th-grade', useAuthMiddleware: true },
  { path: '/Library', page: 'Library', useAuthMiddleware: true },
  { path: '/Universityapplications', page: 'Universityapplications', useAuthMiddleware: true },
  { path: '/abt-sat', page: 'abt-sat', useAuthMiddleware: true },
  { path: '/baccalaureate', page: 'baccalaureate', useAuthMiddleware: true },
  { path: '/bluebook', page: 'bluebook', useAuthMiddleware: true },
  { path: '/contacts', page: 'contacts', useAuthMiddleware: false },
  { path: '/pdf-documents-sat', page: 'pdf-documents-sat', useAuthMiddleware: true },
  { path: '/pdf-documents-duolingo', page: 'pdf-documents-duolingo', useAuthMiddleware: true },
  { path: '/abt-duolinguo', page: 'abt-duolinguo', useAuthMiddleware: true },
  { path: '/faq', page: 'faq', useAuthMiddleware: false },
  { path: '/onlinetests', page: 'onlinetests', useAuthMiddleware: true },
  { path: '/sat-rw', page: 'sat-rw', useAuthMiddleware: true },
  { path: '/sat-math', page: 'sat-math', useAuthMiddleware: true },
  { path: '/terms', page: 'untitled', useAuthMiddleware: false},
  { path: '/signup-successful', page: 'signup-successful', useAuthMiddleware: false },
  { path: '/khanacademy', page: 'khanacademy', useAuthMiddleware: true },
  { path: '/land', page: 'land', useAuthMiddleware: false },
  { path: '/login', page: 'login', useAuthMiddleware: false },
  { path: '/profile', page: 'profile', useAuthMiddleware: true },
  { path: '/sat-pdf', page: 'sat-pdf', useAuthMiddleware: true },
  { path: '/api/login', page: 'login', useAuthMiddleware: false },
  { path: '/sat', page: 'sat', useAuthMiddleware: true },
  { path: '/online-books-sat', page: 'online-books-sat', useAuthMiddleware: true },
  { path: '/duolinguo', page: 'duolinguo', useAuthMiddleware: true },
  { path: '/signup', page: 'signup', useAuthMiddleware: false },
  { path: '/Universityapplications/step-1', page: 'Universityapplications/step-1', useAuthMiddleware: true },
  { path: '/Universityapplications/step-2', page: 'Universityapplications/step-2', useAuthMiddleware: true },
  { path: '/Universityapplications/step-3', page: 'Universityapplications/step-3', useAuthMiddleware: true },
  { path: '/Universityapplications/step-4', page: 'Universityapplications/step-4', useAuthMiddleware: true },
  { path: '/Universityapplications/step-5', page: 'Universityapplications/step-5', useAuthMiddleware: true },
  { path: '/testimonials', page: 'testimonials', useAuthMiddleware: false },
  { path: '/toefl', page: 'toefl', useAuthMiddleware: true },
  { path: '/Saved-resources', page: 'Saved-resources', useAuthMiddleware: true },
  { path: '/browse-interests', page: 'browse-interests', useAuthMiddleware: true }
];

// Route handler for the profile page
router.get('/profile', auth, (req, res) => {
  // Get the user details from the request object
  const email= req.user.email;
  const firstname = req.user.FirstName;
  const lastname=req.user.LastName;
  const birthdate1 = req.user.birthdate;
  const level = req.user.level;
  const country = req.user.country;
  const birthdate = birthdate1.toDateString();
  // Render the profile page with the user details
  res.render('profile', { firstname, lastname, email,birthdate ,level,country});
});


router.get('/login', redirectLoggedIn, (req, res) => {
  res.render('login', { error: req.query.error  });

});
// Route handler for the login page
router.get('/land', redirectLoggedIn, async (req, res) => {
  try {
    
    // Count the total number of users
    const userCount = await User.countDocuments();

    // Render the login page with the userCount value
    res.render('land', { userCount });
  } catch (error) {
    console.error("Error fetching user count:", error);
    // Handle the error and render the login page without userCount
    res.render('land', { error: req.query.error });
  }
});
// Route handler for the signup page
router.get('/signup', redirectLoggedIn, (req, res) => {
  // Render the signup page
  res.render('signup', { error: req.query.error });
});

pages.forEach(({ path, page, useAuthMiddleware }) => {
  const routeMiddleware = useAuthMiddleware ? auth : [];

  router.get(path, routeMiddleware, (req, res) => {
    const viewPath = path === '/' ? 'land' : page;
    const fullPath = path === '/' ? 'land' : page;

    res.render(fullPath, { error: req.query.error }, (err, html) => {
      if (err) {

        console.error(`Error rendering ${viewPath}:`, err);
        res.status(404).render('4042');
      } else {
        res.send(html);
      }
    });
  });

});


module.exports = router;