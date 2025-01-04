const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Advertiser, Publisher, Admin } = require('../models'); // Import Advertiser, Publisher, and Admin models
const { generateToken } = require('../utils/jwt');

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
        
        // Check if user already exists in any role
        const existingAdvertiser = await Advertiser.findOne({ where: { email } });
        const existingPublisher = await Publisher.findOne({ where: { email } });
        const existingAdmin = await Admin.findOne({ where: { email } });
        
        if (existingAdvertiser || existingPublisher || existingAdmin) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let newUser;
        
        // Create user based on role
        switch (role) {
            case 'advertiser':
                newUser = await Advertiser.create({ email, password: hashedPassword });
                break;
            case 'publisher':
                newUser = await Publisher.create({ email, password: hashedPassword });
                break;
            case 'admin':
                newUser = await Admin.create({ email, password: hashedPassword });
                break;
            default:
                return res.status(400).json({ error: 'Invalid role specified' });
        }

        // Generate JWT token
        const token = generateToken({ 
            id: newUser.id, 
            email: newUser.email, 
            role: role 
        });

        res.status(201).json({ 
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: role
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /users/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check all user tables
        const advertiser = await Advertiser.findOne({ where: { email } });
        const publisher = await Publisher.findOne({ where: { email } });
        const admin = await Admin.findOne({ where: { email } });
        
        const user = admin || advertiser || publisher;
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Determine role
        let role = 'publisher';
        if (admin) role = 'admin';
        else if (advertiser) role = 'advertiser';

        // Generate JWT token
        const token = generateToken({ 
            id: user.id, 
            email: user.email, 
            role: role 
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: role
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;