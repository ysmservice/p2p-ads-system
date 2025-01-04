import express from 'express';
import dotenv from 'dotenv';
import models from './models/index.js';
const { sequelize } = models;
import logger from './utils/logger.js';
import cron from 'node-cron';
import paymentsController from './controllers/paymentsController.js';
import errorHandler from './middleware/errorHandler.js';
import bodyParser from 'body-parser';
import createLibp2pNode from './p2p/node.mjs';
import usersController from './controllers/usersController.js';
import './utils/customEvent.mjs';

// Convert requires to imports
import advertisersRoutes from './routes/advertisers.js';
import publishersRoutes from './routes/publishers.js';
import adsRoutes from './routes/ads.js';
import interactionsRoutes from './routes/interactions.js';
import paymentsRoutes from './routes/payments.mjs';
import advertiserStatsRoutes from './routes/advertiserStats.js';
import publisherStatsRoutes from './routes/publisherStats.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ルートの設定
app.use('/advertisers', advertisersRoutes);
app.use('/publishers', publishersRoutes);
app.use('/ads', adsRoutes);
app.use('/interactions', interactionsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/api/advertiser/stats', advertiserStatsRoutes);
app.use('/api/publisher/stats', publisherStatsRoutes);
app.use('/users', usersController);

// エラーハンドリングミドルウェアの設定
app.use(errorHandler);

// データベース接続とサーバーの起動
async function startServer() {
    try {
        await sequelize.authenticate();
        logger.info('データベースに接続しました');

        await sequelize.sync(); // モデルの同期

        // Initialize libp2p node with retries
        let libp2p = null;
        let retries = 3;
        
        while (retries > 0) {
            try {
                libp2p = await createLibp2pNode();
                break;
            } catch (err) {
                retries--;
                if (retries === 0) {
                    throw err;
                }
                logger.warn(`Libp2p node creation failed, retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        if (!libp2p) {
            throw new Error('Failed to initialize libp2p node');
        }

        // Start HTTP server
        app.listen(PORT, () => {
            logger.info(`HTTPサーバーがポート ${PORT} で起動しました`);
        });

        // 定期的な支払い処理のスケジュール設定（毎日午前2時に実行）
        cron.schedule('0 2 * * *', async () => {
            logger.info('定期支払い処理を開始します');
            await paymentsController.createPaymentInternal();
            logger.info('定期支払い処理が完了しました');
        });

    } catch (err) {
        logger.error(`サーバー起動エラー: ${err.message}`);
        process.exit(1);
    }
}

startServer();
