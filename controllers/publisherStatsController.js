const { Publisher, Ad, Interaction } = require('../models');
const logger = require('../utils/logger');

exports.getPublisherStats = async (req, res) => {
    const { id } = req.user; // Assuming user ID is available in req.user

    try {
        const publisher = await Publisher.findByPk(id, {
            include: [Ad]
        });

        if (!publisher) {
            return res.status(404).json({ error: 'Publisher not found' });
        }

        const totalAdsPublished = publisher.Ads.length;
        const totalRevenue = await Interaction.sum('revenue', { where: { publisherId: id } });

        const stats = {
            totalAdsPublished,
            totalRevenue
        };

        res.json({ stats });
    } catch (err) {
        console.error('出版社の統計情報取得中にエラーが発生しました:', err);
        logger.error(`出版社の統計情報取得エラー: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};