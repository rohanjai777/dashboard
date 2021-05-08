const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const { GoogleClientID, GoogleClientSecret } = require('./keys');
const User = require('../models/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GoogleClientID,
      clientSecret: GoogleClientSecret,
      callbackURL: '/auth/google/redirect',
    },
    function (accessToken, refreshToken, profile, done) {
      //console.log(profile);
      User.findOne({ googleID: profile.id })
        .then((existingUser) => {
          if (existingUser) {
            console.log('Existing User', existingUser);
            done(null, existingUser);
          } else {
            let newUser = new User({
              fName: profile.displayName,
              googleID: profile.id,
              email: profile._json.email,
            });
            newUser.save((err, user) => {
              if (err) console.log(err);
              else {
                console.log('new user', user);
                done(null, user);
              }
            });
          }
        })
        .catch((e) => console.log(e));

      //done(null, false);
    }
  )
);
