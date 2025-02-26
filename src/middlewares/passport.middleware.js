const jwt = require('jsonwebtoken');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CLIENT_CALLBACK, JWT_SECRET } = process.env;

const { createUser, findUserByEmail, findUserByEmailAndRol, updateUser } = require('../controllers/users');

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CLIENT_CALLBACK,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    const user = {
        name: profile.displayName,
        firstName: profile?.given_name,
        lastName: profile?.family_name,
        googleId: profile.id,
        email: profile.email,
        picture: profile.picture,
        accessToken,
        refreshToken,
        role: req.query.state
    };

    try {
        //let findedUser = await findUserByEmail(user?.email);
        let findedUser = await findUserByEmailAndRol(user?.email, user?.role);
  
        if (findedUser) {
          await updateUser(findedUser?._id, { accessToken, refreshToken });
          console.log("User accessToken, refreshToken updated!");
        } else {
          findedUser = await createUser(user);
          console.log("User created!");
        }

        const token = jwt.sign({ id: findedUser._id }, JWT_SECRET, { expiresIn: '5h' });
  
        return done(null, { user: findedUser, token });
    } catch (err) {
        console.log("Error: ", err.message);
        return done(err, null);
    }
}));

module.exports = passport;