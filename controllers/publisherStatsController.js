const { Publisher, Ad, Interaction } = require('../models');
const logger = require('../utils/logger');

exports.getPublisherStats = async (req, res) => {
    const { id } = req.query;

    try {
        const publisher = await Publisher.findByPk(id);

        if (!publisher) {
            return res.status(404).json({ error: 'Publisher not found' });
        }

        const totalAdsPublished = await Ad.count({ where: { publisherId: id } });
        const totalRevenue = await Interaction.sum('revenue', { 
            where: { publisherId: id },
            raw: true
        }) || 0;

        const stats = {
            totalAdsPublished,
            totalRevenue: parseFloat(totalRevenue).toFixed(2)
        };

        res.json({ stats });
    } catch (err) {
        console.error('出版社の統計情報取得中にエラーが発生しました:', err);
        logger.error(`出版社の統計情報取得エラー: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};