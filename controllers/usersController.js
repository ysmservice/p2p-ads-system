const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
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

// POST /users/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // Check if user already exists
        const existingAdvertiser = await Advertiser.findOne({ where: { email } });
        const existingPublisher = await Publisher.findOne({ where: { email } });
        
        if (existingAdvertiser || existingPublisher) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user based on role
        if (role === 'advertiser') {
            await Advertiser.create({ email, password: hashedPassword });
        } else if (role === 'publisher') {
            await Publisher.create({ email, password: hashedPassword });
        } else {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /users/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check both Advertiser and Publisher tables
        const advertiser = await Advertiser.findOne({ where: { email } });
        const publisher = await Publisher.findOne({ where: { email } });
        
        const user = advertiser || publisher;
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({
            id: user.id,
            email: user.email,
            role: advertiser ? 'advertiser' : 'publisher'
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;