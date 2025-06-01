const express = require('express');
const router = express.Router();

const User = require('../models/User');

const passport = require('passport');

router.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

//inicio nuevo codigo
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

router.use(cookieParser());

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/generate-token', // Ruta intermedia
    failureRedirect: '/users/signin',
    failureFlash: true
}));

router.get('/generate-token', (req, res) => {
    // 1. Genera token JWT
    const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    
    // 2. Guarda en cookie HTTP-only (más seguro que URL)
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        domain: 'localhost' // Cambia a tu dominio en producción
    });
    
    // 3. Redirige a finteres
    res.redirect(process.env.FINTERES_URL);
});
//fin nuevo codigo experimental


/*router.post('/users/signin', passport.authenticate('local', {
    successRedirect: 'http://localhost:4000', // Redirige directamente al root de finteres
    failureRedirect: '/users/signin',
    failureFlash: true
}));*/

router.get('/users/signup', (req, res) =>{
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) =>{
    const { name, email, password, confirm_password } = req.body;
    const errors = [];

    if(name.length <= 0) {
        errors.push({text: 'Please Insert Your Name'})
    }
    if(email.length <= 0) {
        errors.push({text: 'Please Insert Your Email'})
    }
    if(password.length <= 0) {
        errors.push({text: 'Please Insert a Password'})
    }

    if(password != confirm_password) {
        errors.push({text: 'Password do not match'});
    }
    if(password.length < 4) {
        errors.push({text: 'password must be at least 4 characters'});
    }
    if(errors.length > 0) {
        res.render('users/signup', {errors, name, email, password, confirm_password});
    } else {
        const emailUser = await User.findOne({email: email});
        if(emailUser) {
            req.flash('error_msg', 'The Email is already in use');
            return res.redirect('/users/signin');
        }
        const newUser = new User({name, email, password});
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', 'You are registered');
        res.redirect('/users/signin');
    }
    
});

router.get('/users/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are logged out successfully');
        res.redirect('/');
    });
});


module.exports = router;