const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(new LocalStrategy(
    {
      usernameField: 'email', // o 'username' según tu campo de login
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }); // Cambia a 'username' si usas eso
        
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }
        
        // Comparación básica de contraseña (en producción usa bcrypt)
        if (user.password !== password) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Serialización modificada
  passport.serializeUser((user, done) => {
    done(null, { 
      id: user._id, 
      email: user.email,
      // Solo incluye datos necesarios
    });
  });

  // Deserialización modificada
  passport.deserializeUser(async (obj, done) => {
    try {
      const user = await User.findById(obj.id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};