const express = require('express');
const session = require('express-session');
const passport = require('passport');
const axios = require('axios');
const path = require('path');
const authRoute = require('./routes/auth');
const manageRoute = require('./routes/manage');
const config = require('./config/config.json');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoute);
app.use('/manage', manageRoute);

app.get('/', (req, res) => {
    res.render('index', { user: req.user });
});

app.get('/dashboard', ensureAuthenticated, async (req, res) => {
    try {
        const response = await axios.get('https://discord.com/api/v8/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${req.user.accessToken}`
            }
        });
        res.render('dashboard', { user: { ...req.user, guilds: response.data } });
    } catch (err) {
        console.error('Error fetching guilds: ', err);
        res.redirect('/');
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/');
}

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});
