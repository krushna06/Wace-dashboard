const express = require('express');
const axios = require('axios');
const router = express.Router();

const api = axios.create({
    baseURL: process.env.API_BASE_URL,
    headers: {
        Authorization: process.env.API_AUTHORIZATION,
    },
});

// Middleware to ensure the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

router.get('/players/:guildId', isAuthenticated, async (req, res) => {
    try {
        const response = await api.get(`/v1/players/${req.params.guildId}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
