const express = require('express');
const router = express.Router();
const { Advertiser, Publisher } = require('../models'); // Import Advertiser and Publisher models

// GET /users/:email
router.get('/:email', async (req, res) => {
    try {
        const advertiser = await Advertiser.findOne({ where: { email: req.params.email } });
        const publisher = await Publisher.findOne({ where: { email: req.params.email } });

        if (advertiser || publisher) {
            return res.json({
                advertiserId: advertiser ? advertiser.id : null,
                publisherId: publisher ? publisher.id : null
            });
        }

        res.status(404).json({ error: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;