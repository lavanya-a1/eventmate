const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const secrets = require('./secrets');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

if (secrets.google.clientId && secrets.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: secrets.google.clientId,
        clientSecret: secrets.google.clientSecret,
        callbackURL: secrets.google.callbackUrl,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if a user with this googleId already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user);
          }

          // Check if a local user with the same email exists — link accounts
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = profile.id;
              user.provider = user.provider === 'local' ? 'local' : 'google';
              if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
              return done(null, user);
            }
          }

          // Create a new user
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            provider: 'google',
            avatar: profile.photos?.[0]?.value || undefined,
          });

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
}

module.exports = passport;
