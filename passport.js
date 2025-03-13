const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;


require("dotenv").config()

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      // Save user info to DB or session
      const user = {
        googleId: profile.id,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value, // Primary email
        photo: profile.photos[0].value, // Profile picture
      };
      return done(null, profile);
    }
  
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;