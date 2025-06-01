

require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flsh = require('connect-flash');
const passport = require('passport');
const cookieParser = require('cookie-parser'); // Nuevo: Para manejar cookies
const cors = require('cors'); // Nuevo: Para CORS

// Initialization
const app = express();
require('./database');
require('./config/passport');

// Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Middleware
app.use(cors({
    origin: process.env.FINTERES_URL, // Permite solicitudes desde finteres
    credentials: true // Habilita el envío de cookies
}));
app.use(cookieParser()); // Para leer cookies
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // Nuevo: Para parsear JSON
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'mysecretapp', // Usa variable de entorno
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutos
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flsh());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use(require('./routes/index'));

app.use(require('./routes/users'));

// Nueva ruta para generar token después de login exitoso
app.get('/generate-token', (req, res) => {
    if (!req.user) {
        return res.redirect('/users/signin');
    }
    
    const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    
    res.cookie('authToken', token, {
        httpOnly: true,
        domain: process.env.NODE_ENV === 'production' ? '.midominio.com' : 'localhost',
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 15 * 60 * 1000
    });
    
    res.redirect(process.env.FINTERES_URL);
});

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Server is listening
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});