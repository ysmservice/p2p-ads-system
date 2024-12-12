const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const logger = require('./utils/logger');
const cron = require('node-cron');
const paymentsController = require('./controllers/paymentsController');
const errorHandler = require('./middleware/errorHandler');
const bodyParser = require('body-parser');
const createLibp2pNode = require('./p2p/node');
const usersController = require('./controllers/usersController'); // Add this line

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(bodyParser.json());

// ルートのインポート
const advertisersRoutes = require('./routes/advertisers');
const publishersRoutes = require('./routes/publishers');
const adsRoutes = require('./routes/ads');
const interactionsRoutes = require('./routes/interactions');
const paymentsRoutes = require('./routes/payments');
const advertiserStatsRoutes = require('./routes/advertiserStats');
const publisherStatsRoutes = require('./routes/publisherStats');

// ルートの設定
app.use('/advertisers', advertisersRoutes);
app.use('/publishers', publishersRoutes);
app.use('/ads', adsRoutes);
app.use('/interactions', interactionsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/api/advertiser/stats', advertiserStatsRoutes);
app.use('/api/publisher/stats', publisherStatsRoutes);
app.use('/users', usersController); // Add this line

// エラーハンドリングミドルウェアの設定
app.use(errorHandler);

// データベース接続とサーバーの起動
(async () => {
    try {
        await sequelize.authenticate();
        logger.info('データベースに接続しました');

        await sequelize.sync(); // モデルの同期

        // libp2pノードの起動
        const libp2p = await createLibp2pNode();
        global.libp2p = libp2p; // グローバルに設定してブロードキャスト関数からアクセス可能にする

        app.listen(PORT, () => {
            logger.info(`HTTPサーバーがポート ${{PORT}} で起動しました`);
        });

        // 定期的な支払い処理のスケジュール設定（毎日午前2時に実行）
        cron.schedule('0 2 * * *', async () => {
            logger.info('定期支払い処理を開始します');
            await paymentsController.createPaymentInternal();
            logger.info('定期支払い処理が完了しました');
        });

    } catch (err) {
        logger.error(`サーバー起動エラー: ${{err.message}}`);
        process.exit(1);
    }
})();
