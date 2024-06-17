const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const config = require('../config/config.json');

const router = express.Router();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: config.clientID,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: config.scopes
}, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => done(null, profile));
}));

router.use(passport.initialize());
router.use(passport.session());

router.get('/login', passport.authenticate('discord'));

router.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
