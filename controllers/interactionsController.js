const { Interaction, Ad, Publisher } = require('../models');
const logger = require('../logger');
const { broadcastInteraction } = require('../p2p/broadcast');

exports.recordInteraction = async (req, res) => {
    const { adId, interactionType } = req.body;
    const publisherId = req.user.id; // JWTトークンから出版社のIDを取得

    try {
        const ad = await Ad.findByPk(adId);
        if (!ad) {
            return res.status(404).json({ error: 'Ad not found' });
        }

        const publisher = await Publisher.findByPk(publisherId);
        if (!publisher) {
            return res.status(404).json({ error: 'Publisher not found' });
        }

        const interaction = await Interaction.create({
            adId,
            publisherId,
            interactionType
        });

        logger.info(`インタラクションが記録されました: ${{interaction.id}}`);

        // P2Pネットワークにインタラクションをブロードキャスト
        broadcastInteraction(interaction);

        res.status(201).json({ message: 'Interaction recorded successfully', interaction });
    } catch (err) {
        console.error('インタラクション記録中にエラーが発生しました:', err);
        logger.error(`インタラクション記録エラー: ${{err.message}}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
