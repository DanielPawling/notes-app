require('dotenv').config();
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { format } = require('timeago.js');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');

// Inicialización
const app = express();
require('./database');

// Configuración
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(cors({
    origin: process.env.NOTES_APP_URL,
    credentials: true
}));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Configuración de sesión compartida con notes-app
app.use(session({
    secret: process.env.SESSION_SECRET, // MISMO secret que en notes-app
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambia a true si usas HTTPS
        sameSite: 'lax', // Importante para CORS
        maxAge: 24 * 60 * 60 * 1000 // 1 día
    }
}));

// Inicializar Passport (debe estar después de session)
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategia de autenticación (debe coincidir con notes-app)
const configurePassport = require('./config/passport');
configurePassport(passport);

// Configuración de Multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/img/uploads'),
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});
app.use(multer({ 
    storage,
    limits: { fileSize: 15 * 1024 * 1024 }
}).single('image'));

// Middleware para pasar user a las vistas
app.use((req, res, next) => {
    res.locals.user = req.user; // passport almacena el usuario aquí
    res.locals.format = format;
    next();
});

// Rutas
app.use(require('./routes/index'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir imágenes protegidas
app.get('/protected-img/:filename', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(403).send('Acceso no autorizado');
    }
    res.sendFile(path.join(__dirname, 'public/img/uploads', req.params.filename));
});

// Iniciar servidor
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});