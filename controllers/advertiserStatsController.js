const { Advertiser, Ad, Interaction } = require('../models');
const logger = require('../logger');

exports.getAdvertiserStats = async (req, res) => {
    const { id } = req.user; // Assuming user ID is available in req.user

    try {
        const advertiser = await Advertiser.findByPk(id, {
            include: [Ad]
        });

        if (!advertiser) {
            return res.status(404).json({ error: 'Advertiser not found' });
        }

        const totalAds = advertiser.Ads.length;
        const totalClicks = await Interaction.count({ where: { advertiserId: id, type: 'click' } });
        const totalViews = await Interaction.count({ where: { advertiserId: id, type: 'view' } });

        const stats = {
            totalAds,
            totalClicks,
            totalViews
        };

        res.json({ stats });
    } catch (err) {
        console.error('広告主の統計情報取得中にエラーが発生しました:', err);
        logger.error(`広告主の統計情報取得エラー: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};