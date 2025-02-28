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
    // Asegurarse de que role se maneje correctamente como cadena de texto
    let role = '';
    try {
        const state = JSON.parse(req.query.state);
        role = state.role;
    } catch (e) {
        console.error('Error parsing state in passport.middleware:', e.message);
    }

    const user = {
        name: profile.displayName,
        firstName: profile?.given_name,
        lastName: profile?.family_name,
        googleId: profile.id,
        email: profile.email,
        picture: profile.picture,
        accessToken,
        refreshToken,
        role: role  // Asegurarse de que se pasa como cadena
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