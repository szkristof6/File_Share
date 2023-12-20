const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

require("dotenv").config();

// Configure Passport to use Google OAuth2.0
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Use profile information (like profile.id, profile.displayName, etc.) to create or find a user in your database
    // Return the user object to the callback
    return done(null, profile);
  }
));

module.exports = passport;