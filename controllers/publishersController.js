const { Publisher } = require('../models');
const logger = require('../logger');
const { broadcastPublisher } = require('../p2p/broadcast');

exports.registerPublisher = async (req, res) => {
    const { name, email, paymentMethod, paymentDetails } = req.body;

    try {
        const existingPublisher = await Publisher.findOne({ where: { email } });
        if (existingPublisher) {
            return res.status(409).json({ error: 'Publisher with this email already exists' });
        }

        const newPublisher = await Publisher.create({ name, email, paymentMethod, paymentDetails });
        logger.info(`新しい出版社が登録されました: ${{newPublisher.id}}`);

        // P2Pネットワークに新しい出版社をブロードキャスト
        broadcastPublisher(newPublisher);

        res.status(201).json({ message: 'Publisher registered successfully', publisher: newPublisher });
    } catch (err) {
        console.error('出版社登録中にエラーが発生しました:', err);
        logger.error(`出版社登録エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getPublisher = async (req, res) => {
    const { id } = req.params;

    try {
        const publisher = await Publisher.findByPk(id);
        if (!publisher) {
            return res.status(404).json({ error: 'Publisher not found' });
        }
        res.json({ publisher });
    } catch (err) {
        console.error('出版社取得中にエラーが発生しました:', err);
        logger.error(`出版社取得エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.updatePublisher = async (req, res) => {
    const { id } = req.params;
    const { name, email, paymentMethod, paymentDetails } = req.body;

    try {
        const publisher = await Publisher.findByPk(id);
        if (!publisher) {
            return res.status(404).json({ error: 'Publisher not found' });
        }

        await publisher.update({ name, email, paymentMethod, paymentDetails });
        logger.info(`出版社が更新されました: ${{publisher.id}}`);

        // P2Pネットワークに出版社の更新をブロードキャスト
        broadcastPublisher(publisher);

        res.json({ message: 'Publisher updated successfully', publisher });
    } catch (err) {
        console.error('出版社更新中にエラーが発生しました:', err);
        logger.error(`出版社更新エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllPublishers = async (req, res) => {
    try {
        const publishers = await Publisher.findAll();
        res.json({ publishers });
    } catch (err) {
        console.error('出版社一覧取得中にエラーが発生しました:', err);
        logger.error(`出版社一覧取得エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
