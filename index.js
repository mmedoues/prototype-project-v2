const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const User=require('./models/user');
const {auth} =require('./middlewares/auth');
const db=require('./config/config').get(process.env.NODE_ENV);
const routes = require('./routes/routes');
const path = require('path');
require('dotenv').config();
const port = process.env.PORT || 8080;
const app=express();
const axios = require('axios');
const querystring = require('querystring');
// ...
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = '984482563682-bhb1f4s39dj8fpv1tq2pshi6opvdivgd.apps.googleusercontent.com'; // Replace this with your Google client ID
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
// ...
const RECAPTCHA_SECRET_KEY = '6LforXInAAAAADzXzbPR8HCDUd6oSEED2xmLON3W';

// app use
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookieParser());
app.use('/', routes);
app.use(express.static(path.join(__dirname, './client')));
app.set('view engine', 'ejs'); 
app.set('views', path.join(__dirname, './client'));
app.use((req, res, next) => {
  res.removeHeader('Permissions-Policy');
  next();
});


app.post('/api/google-login', async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email } = payload;

    // Check if the user exists in your database (modify this part according to your User schema)
    User.findOne({ email }, (err, user) => {
      if (err) return res.status(500).json({ success: false, message: 'Internal server error' });

      if (!user) {
        // If the user does not exist, you can create a new account for them
        user = new User({ email }); // Replace this with the necessary user data you want to store
        user.save((err) => {
          if (err) return res.status(500).json({ success: false, message: 'Failed to create user' });
          // You can also generate a user session token and send it to the client to keep them logged in
          return res.status(200).json({ success: true, message: 'Login successful' });
        });
      } else {
        // If the user already exists, you can generate a user session token and send it to the client to keep them logged in
        return res.status(200).json({ success: true, message: 'Login successful' });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
  if (err) console.log(err);
  console.log("database is connected");

});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, 'g-recaptcha-response': recaptchaResponse } = req.body;

    // Convert the data to URL-encoded format
    const recaptchaData = querystring.stringify({
      secret: RECAPTCHA_SECRET_KEY,
      response: recaptchaResponse,
      remoteip: req.connection.remoteAddress, // Optional: You can send the user's IP address for additional verification
    });

    // // Verify the reCAPTCHA response using the correct content type
    // const recaptchaVerification = await axios.post('https://www.google.com/recaptcha/api/siteverify', recaptchaData, {
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    // });
    const recaptchaVerification = { data: { success: true } };
    if (recaptchaVerification.data.success) {
      // Handle your registration logic here...
      console.log('Registration request:', req.body);
      const newuser = new User(req.body);

      User.findOne({ email: newuser.email }, function (err, user) {
        if (user) {
          return res.status(400).render('signup', { error: 'Email already exists' });
        }

        newuser.save((err, doc) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ success: false });
          }

          res.redirect('/signup-successful');
        });
      });
    } else {
      // reCAPTCHA verification failed
      res.status(403).render('signup', { error: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password, 'g-recaptcha-response': recaptchaResponse } = req.body;

    // Convert the data to URL-encoded format
    const recaptchaData = querystring.stringify({
      secret: RECAPTCHA_SECRET_KEY,
      response: recaptchaResponse,
      remoteip: req.connection.remoteAddress, // Optional: You can send the user's IP address for additional verification
    });

    // Verify the reCAPTCHA response using the correct content type
    const recaptchaVerification = await axios.post('https://www.google.com/recaptcha/api/siteverify', recaptchaData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });


    if (recaptchaVerification.data.success) {
      // Handle your login logic here...
      console.log('Login request:', req.body);
      let token = req.cookies.auth;

      User.findByToken(token, (err, user) => {
        if (err) return res(err);
        if (user) {
          return res.redirect('/Library');
        } else {
          User.findOne({ 'email': req.body.email }, function(err, user) {
            if (!user) {
              return res.render('login', { error: 'Email not found' }); // Render login page with error message
            }

            user.comparepassword(req.body.password, (err, isMatch) => {
              if (!isMatch) {
                return res.render('login', { error: "Incorrect Password " }); // Render login page with error message
              }

              user.generateToken(process.env.SECRET_KEY, function(err, user) {
                if (err) return res.status(400).send(err);
                res.cookie('auth', user.token);
                return res.redirect('/Library'); // Redirect to the Library page
              });
            });
          });
        }
      });

      // For example, assume login is successful
      // res.status(200).json({ success: true, message: 'Login successful' });
    } else {
      // reCAPTCHA verification failed
      res.status(403).json({ success: false, message: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
app.get('/signup-successful', (req, res) => {
  setTimeout(() => {
    res.redirect('/login');
  }, 2000);
});



// Logout user
app.get('/api/logout', auth, function(req, res) {
    req.user.deleteToken(req.token, (err, user) => {
      if (err) return res.status(400).send(err);
      res.redirect('/login'); // Redirect to the login page
    });
  });

// get logged in user
app.get('/api/profile',auth,function(req,res){
        res.json({
            isAuth: true,
            id: req.user._id,
            email: req.user.email,
            name: req.user.firstname + req.user.lastname,
            country: req.user.country
        })
});
app.get('/',function(req,res){
  res.redirect('/land',{ userCount })
});

app.get('/*',function(req,res){
  res.redirect('/4042')
});

app.listen(port, () => {
  console.log(`app is live at ${port}`);
});