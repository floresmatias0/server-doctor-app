const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_CALLBACK } = process.env;

const { createUser, findUserByEmail, updateUser } = require('../controllers/users');

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CLIENT_CALLBACK,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    const user = {
        name: profile.displayName,
        googleId: profile.id,
        email: profile.email,
        picture: profile.picture,
        accessToken,
        refreshToken
    };

    findUserByEmail(user?.email)
        .then(finded => {
            if(!finded.accessToken  !== accessToken) {
                updateUser(finded?._id, { accessToken })
                    .then(() => {
                        console.log("User accessToken updated!");
                    })
                    .catch(err => {
                        console.log("User accessToken update failed! ", err.message);
                    })
            }

            if(!finded.refreshToken  !== refreshToken) {
                updateUser(finded?._id, { refreshToken })
                    .then(() => {
                        console.log("User refreshToken updated!");
                    })
                    .catch(err => {
                        console.log("User refreshToken update failed! ", err.message);
                    })
            }

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
    return done(null, user);
});

passport.deserializeUser((user, done) => {
    return done(null, user);
});

module.exports = passport;