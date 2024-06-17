const express = require('express');
const axios = require('axios');
const config = require('../config/config.json');

const router = express.Router();

router.get('/:guildId', async (req, res) => {
    const guildId = req.params.guildId;
    try {
        const response = await axios.get(`https://25560-krushna06-wace-c3bzv80osav.ws-us114.gitpod.io/v1/players/${guildId}`, {
            headers: {
                Authorization: 'youshallnotpass'
            }
        });
        res.render('manage', { guild: response.data });
    } catch (err) {
        console.error('Error fetching guild data: ', err);
        res.redirect('/dashboard');
    }
});

module.exports = router;
