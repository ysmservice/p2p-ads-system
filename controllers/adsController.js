const { Ad, Advertiser } = require('../models');
const logger = require('../logger');
const { broadcastAd } = require('../p2p/broadcast');

exports.registerAd = async (req, res) => {
    const { type, data, advertiserId } = req.body;

    try {
        const advertiser = await Advertiser.findByPk(advertiserId);
        if (!advertiser) {
            return res.status(404).json({ error: 'Advertiser not found' });
        }

        const newAd = await Ad.create({ type, data, advertiserId });
        logger.info(`新しい広告が登録されました: ${{newAd.id}}`);

        // P2Pネットワークに新しい広告をブロードキャスト
        broadcastAd(newAd);

        res.status(201).json({ message: 'Ad registered successfully', ad: newAd });
    } catch (err) {
        console.error('広告登録中にエラーが発生しました:', err);
        logger.error(`広告登録エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAd = async (req, res) => {
    const { id } = req.params;

    try {
        const ad = await Ad.findByPk(id, {
            include: [{
                model: Advertiser,
                attributes: ['id', 'name', 'email']
            }]
        });
        if (!ad) {
            return res.status(404).json({ error: 'Ad not found' });
        }
        res.json({ ad });
    } catch (err) {
        console.error('広告取得中にエラーが発生しました:', err);
        logger.error(`広告取得エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateAd = async (req, res) => {
    const { id } = req.params;
    const { type, data, advertiserId } = req.body;

    try {
        const ad = await Ad.findByPk(id);
        if (!ad) {
            return res.status(404).json({ error: 'Ad not found' });
        }

        if (advertiserId) {
            const advertiser = await Advertiser.findByPk(advertiserId);
            if (!advertiser) {
                return res.status(404).json({ error: 'Advertiser not found' });
            }
        }

        await ad.update({ type, data, advertiserId });
        logger.info(`広告が更新されました: ${{ad.id}}`);

        // P2Pネットワークに広告の更新をブロードキャスト
        broadcastAd(ad);

        res.json({ message: 'Ad updated successfully', ad });
    } catch (err) {
        console.error('広告更新中にエラーが発生しました:', err);
        logger.error(`広告更新エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllAds = async (req, res) => {
    try {
        const ads = await Ad.findAll({
            include: [{
                model: Advertiser,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ ads });
    } catch (err) {
        console.error('広告一覧取得中にエラーが発生しました:', err);
        logger.error(`広告一覧取得エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
