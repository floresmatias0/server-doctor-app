const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_CALLBACK } = process.env;

const { createUser, findUserByEmail, updateUser, findUserById } = require('../controllers/users');

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CLIENT_CALLBACK,
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {

    const user = {
        name: profile.displayName,
        googleId: profile.id,
        email: profile.email,
        picture: profile.picture,
        accessToken,
        refreshToken,
        role: req.query.state
    };

    findUserByEmail(user?.email)
        .then(finded => {
            updateUser(finded?._id, { accessToken, refreshToken })
                .then(() => {
                    console.log("User accessToken, refreshToken updated!");
                })
                .catch(err => {
                    console.log("User accessToken update failed! ", err.message);
                    return done(err, null)
                })

            return done(null, finded)
        })
        .catch(() => {
            createUser(user)
                .then(created => {
                    return done(null, created)
                })
                .catch(err => {
                    return done(err, null)
                })
        })
    }
));

passport.serializeUser((user, done) => {
    return done(null, user._id);
});

passport.deserializeUser((id, done) => {
    findUserById(id)
    .then(user => {
        return done(null, user);
    })
    .catch(err => {
        return done(err, null)
    });
});

module.exports = passport;