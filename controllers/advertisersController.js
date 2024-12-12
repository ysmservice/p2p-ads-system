const { Advertiser } = require('../models');
const logger = require('../logger');
const { broadcastAdvertiser } = require('../p2p/broadcast');

exports.registerAdvertiser = async (req, res) => {
    const { name, email, paymentMethod, paymentDetails } = req.body;

    try {
        const existingAdvertiser = await Advertiser.findOne({ where: { email } });
        if (existingAdvertiser) {
            return res.status(409).json({ error: 'Advertiser with this email already exists' });
        }

        const newAdvertiser = await Advertiser.create({ name, email, paymentMethod, paymentDetails });
        logger.info(`新しい広告主が登録されました: ${{newAdvertiser.id}}`);

        // P2Pネットワークに新しい広告主をブロードキャスト
        broadcastAdvertiser(newAdvertiser);

        res.status(201).json({ message: 'Advertiser registered successfully', advertiser: newAdvertiser });
    } catch (err) {
        console.error('広告主登録中にエラーが発生しました:', err);
        logger.error(`広告主登録エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAdvertiser = async (req, res) => {
    const { id } = req.params;

    try {
        const advertiser = await Advertiser.findByPk(id);
        if (!advertiser) {
            return res.status(404).json({ error: 'Advertiser not found' });
        }
        res.json({ advertiser });
    } catch (err) {
        console.error('広告主取得中にエラーが発生しました:', err);
        logger.error(`広告主取得エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updateAdvertiser = async (req, res) => {
    const { id } = req.params;
    const { name, email, paymentMethod, paymentDetails } = req.body;

    try {
        const advertiser = await Advertiser.findByPk(id);
        if (!advertiser) {
            return res.status(404).json({ error: 'Advertiser not found' });
        }

        await advertiser.update({ name, email, paymentMethod, paymentDetails });
        logger.info(`広告主が更新されました: ${{advertiser.id}}`);

        // P2Pネットワークに広告主の更新をブロードキャスト
        broadcastAdvertiser(advertiser);

        res.json({ message: 'Advertiser updated successfully', advertiser });
    } catch (err) {
        console.error('広告主更新中にエラーが発生しました:', err);
        logger.error(`広告主更新エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllAdvertisers = async (req, res) => {
    try {
        const advertisers = await Advertiser.findAll();
        res.json({ advertisers });
    } catch (err) {
        console.error('広告主一覧取得中にエラーが発生しました:', err);
        logger.error(`広告主一覧取得エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
