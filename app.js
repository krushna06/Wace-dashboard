const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'guilds']
},
(accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
        return done(null, profile);
    });
}));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// Homepage route
app.get('/', (req, res) => {
    res.render('index');
});

// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

// Dashboard route
app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

app.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/dashboard');
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    });
});


// Guild management route
app.get('/guild/:id', ensureAuthenticated, (req, res) => {
    const guildId = req.params.id;
    const guild = req.user.guilds.find(g => g.id === guildId);
    if (!guild) {
        return res.redirect('/dashboard');
    }
    res.render('guild', { guild: guild });
});

// Middleware to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
