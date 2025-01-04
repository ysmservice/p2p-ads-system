const { Publisher, Ad, Interaction } = require('../models');
const logger = require('../utils/logger');
const dotenv = require('dotenv');

dotenv.config();

// Get interaction rates from environment variables
const INTERACTION_RATES = JSON.parse(process.env.INTERACTION_RATES || '{}');

exports.getPublisherStats = async (req, res) => {
    const { id } = req.query;

    try {
        const publisher = await Publisher.findByPk(id);

        if (!publisher) {
            return res.status(404).json({ error: 'Publisher not found' });
        }

        // Get all ads for this publisher
        const ads = await Ad.findAll({
            where: { publisherId: id }
        });

        const totalAdsPublished = ads.length;

        // Get all interactions for this publisher
        const interactions = await Interaction.findAll({
            where: { publisherId: id }
        });

        // Calculate total revenue based on interaction types and rates
        const totalRevenue = interactions.reduce((sum, interaction) => {
            const rate = INTERACTION_RATES[interaction.interactionType] || 0;
            return sum + rate;
        }, 0);

        const stats = {
            totalAdsPublished,
            totalRevenue: parseFloat(totalRevenue.toFixed(2))
        };

        res.json({ stats });
    } catch (err) {
        console.error('出版社の統計情報取得中にエラーが発生しました:', err);
        logger.error(`出版社の統計情報取得エラー: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};