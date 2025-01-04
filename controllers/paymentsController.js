const { Payment, Advertiser, Publisher, Ad, Interaction } = require('../models');
const paypalClient = require('../config/paypalClient').client;
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const logger = require('../utils/logger');
const dotenv = require('dotenv');
const { Op } = require('sequelize');
const { broadcastPayment } = require('../p2p/broadcast');

dotenv.config();

// インタラクションごとの支払い額と請求期間を設定ファイルから取得
const INTERACTION_RATES = JSON.parse(process.env.INTERACTION_RATES || '{}');
const BILLING_PERIOD_DAYS = parseInt(process.env.BILLING_PERIOD_DAYS) || 30;

// 支払いの作成（内部呼び出し用）
exports.createPaymentInternal = async () => {
    try {
        const billingStartDate = new Date();
        billingStartDate.setDate(billingStartDate.getDate() - BILLING_PERIOD_DAYS);

        // 各広告主ごとにインタラクションを集計
        const advertisers = await Advertiser.findAll({
            include: [{
                model: Ad,
                include: [{
                    model: Interaction,
                    where: {
                        timestamp: {
                            [Op.gte]: billingStartDate
                        }
                    },
                    required: false
                }]
            }]
        });

        for (const advertiser of advertisers) {
            let publisherAmounts = {};

            // 広告ごとのインタラクションを集計
            for (const ad of advertiser.Ads) {
                for (const interaction of ad.Interactions) {
                    const publisherId = interaction.Publisher.id;
                    const rate = INTERACTION_RATES[interaction.interactionType] || 0;

                    if (!publisherAmounts[publisherId]) {
                        publisherAmounts[publisherId] = 0;
                    }
                    publisherAmounts[publisherId] += rate;
                }
            }

            // 各出版社ごとに支払いを作成
            for (const [publisherId, amount] of Object.entries(publisherAmounts)) {
                if (amount <= 0) continue;

                const publisher = await Publisher.findByPk(publisherId);
                if (!publisher) {
                    logger.error(`Publisher not found: ${{publisherId}}`);
                    continue;
                }

                // PayPalの注文を作成
                let request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
                request.prefer("return=representation");
                request.requestBody({
                    intent: 'CAPTURE',
                    purchase_units: [{
                        amount: {
                            currency_code: 'USD',
                            value: amount.toFixed(2)
                        },
                        payee: {
                            email_address: advertiser.paymentDetails.paypalEmail
                        }
                    }],
                    application_context: {
                        brand_name: 'P2P Ad Server',
                        landing_page: 'BILLING',
                        user_action: 'PAY_NOW',
                        return_url: `${process.env.PAYPAL_RETURN_URL}?paymentId=`,
                        cancel_url: process.env.PAYPAL_CANCEL_URL
                    }
                });

                try {
                    const order = await paypalClient.execute(request);

                    // 支払い記録の作成（ステータスは'pending'）
                    const paymentRecord = await Payment.create({
                        adType: 'bulk',
                        adId: null,
                        publisherId,
                        advertiserId: advertiser.id,
                        amount,
                        currency: 'USD',
                        status: 'pending',
                        paypalTransactionId: order.result.id
                    });

                    // 承認URLの取得
                    const approvalLink = order.result.links.find(link => link.rel === 'approve').href;
                    logger.info(`支払いが作成されました: ${paymentRecord.id}, PayPal Order ID: ${order.result.id}`);

                    // P2Pネットワークに支払い情報をブロードキャスト
                    broadcastPayment(paymentRecord);

                    // 必要に応じて広告主にメール通知などを実装
                } catch (err) {
                    console.error('内部支払い作成中にエラーが発生しました:', err);
                    logger.error(`内部支払い作成エラー: ${err.message}`);
                }
            }
        }
    } catch (err) {
        console.error('累積支払い処理中にエラーが発生しました:', err);
        logger.error(`累積支払い処理エラー: ${err.message}`);
    }
};

// Webhookの処理
exports.handleWebhook = async (req, res) => {
    const webhookId = process.env.WEBHOOK_ID;
    const body = req.body;
    const headers = req.headers;

    // Webhookの検証
    const isValid = await verifyWebhook(body, headers, webhookId);
    if (!isValid) {
        return res.status(400).send('Invalid Webhook');
    }

    // イベントの処理
    const eventType = body.event_type;
    if (eventType === 'CHECKOUT.ORDER.APPROVED') {
        const orderId = body.resource.id;

        try {
            // 注文情報を取得してキャプチャ
            let captureRequest = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
            captureRequest.requestBody({});

            const capture = await paypalClient.execute(captureRequest);

            // 支払い記録の更新
            const payment = await Payment.findOne({ where: { paypalTransactionId: orderId } });
            if (payment) {
                payment.status = 'completed';
                payment.paypalTransactionId = capture.result.id;
                await payment.save();
                logger.info(`支払いが完了しました: ${payment.id}, PayPal Transaction ID: ${capture.result.id}`);

                // P2Pネットワークに支払いステータスの更新をブロードキャスト
                broadcastPayment(payment);
            }

            res.status(200).send('Webhook received and processed');
        } catch (err) {
            console.error('Webhook処理中にエラーが発生しました:', err);
            logger.error(`Webhook処理エラー: ${err.message}`);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(200).send('Webhook received');
    }
};

// Webhookの検証関数
async function verifyWebhook(body, headers, webhookId) {
    const request = new checkoutNodeJssdk.webhooks.WebhookVerifySignatureRequest();
    request.requestBody({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: body
    });

    try {
        const response = await paypalClient.execute(request);
        return response.result.verification_status === 'SUCCESS';
    } catch (err) {
        console.error('Webhook検証中にエラーが発生しました:', err);
        logger.error(`Webhook検証エラー: ${err.message}`);
        return false;
    }
}

// 管理者による累積支払い処理の手動トリガー
exports.processBulkPayments = async (req, res) => {
    try {
        await this.createPaymentInternal();
        res.status(200).json({ message: 'Bulk payments processed successfully' });
    } catch (err) {
        console.error('Bulk payments処理中にエラーが発生しました:', err);
        logger.error(`Bulk payments処理エラー: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 支払い履歴の取得
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [
                { model: Advertiser, attributes: ['id', 'name', 'email'] },
                { model: Publisher, attributes: ['id', 'name', 'email'] },
                { model: Ad, attributes: ['id', 'type'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ payments });
    } catch (err) {
        console.error('支払い一覧取得中にエラーが発生しました:', err);
        logger.error(`支払い一覧取得エラー: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// 特定の支払いの取得
exports.getPayment = async (req, res) => {
    const { id } = req.params;

    try {
        const payment = await Payment.findByPk(id, {
            include: [
                { model: Advertiser, attributes: ['id', 'name', 'email'] },
                { model: Publisher, attributes: ['id', 'name', 'email'] },
                { model: Ad, attributes: ['id', 'type'] }
            ]
        });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.json({ payment });
    } catch (err) {
        console.error('支払い取得中にエラーが発生しました:', err);
        logger.error(`支払い取得エラー: ${err.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
