const { Advertiser } = require('../models');
const logger = require('../utils/logger');
const { broadcastAdvertiser } = require('../p2p/broadcast');
const bcrypt = require('bcrypt');

exports.registerAdvertiser = async (req, res) => {
    const { name, email, paymentMethod, paymentDetails, password } = req.body;

    try {
        const existingAdvertiser = await Advertiser.findOne({ where: { email } });
        if (existingAdvertiser) {
            return res.status(409).json({ error: 'Advertiser with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdvertiser = await Advertiser.create({ name, email, paymentMethod, paymentDetails, hashedPassword });
        logger.info(`新しい広告主が登録されました: ${newAdvertiser.id}`, { 
            advertiserId: newAdvertiser.id,
            email: newAdvertiser.email
        });

        // P2Pネットワークに新しい広告主をブロードキャスト
        broadcastAdvertiser(newAdvertiser);

        res.status(201).json({ message: 'Advertiser registered successfully', advertiser: newAdvertiser });
    } catch (err) {
        logger.error('広告主登録中にエラーが発生しました', { 
            error: err.message,
            stack: err.stack
        });
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
        logger.error(`広告主取得エラー: ${err.message}`);
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
        logger.info(`広告主が更新されました: ${id}`, {
            advertiserId: id,
            updates: { name, email, paymentMethod }
        });

        // P2Pネットワークに広告主の更新をブロードキャスト
        broadcastAdvertiser(advertiser);

        res.json({ message: 'Advertiser updated successfully', advertiser });
    } catch (err) {
        logger.error('広告主更新中にエラーが発生しました', {
            advertiserId: id,
            error: err.message,
            stack: err.stack
        });
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllAdvertisers = async (req, res) => {
    try {
        const advertisers = await Advertiser.findAll();
        res.json({ advertisers });
    } catch (err) {
        console.error('広告主一覧取得中にエラーが発生しました:', err);
        logger.error(`広告主一覧取得エラー: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
