const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: 'email', // Campo del formulario que se usará como nombre de usuario
    passReqToCallback: true // Permite pasar el objeto `req` al callback
}, async (req, email, password, done) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        return done(null, false, req.flash('error_msg', 'User not found')); // Mensaje de error
    } else {
        const match = await user.matchPassword(password);
        if (match) {
            return done(null, user);
        } else {
            return done(null, false, req.flash('error_msg', 'Incorrect password')); // Mensaje de error
        }
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Usar async/await
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});