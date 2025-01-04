const protobuf = require('protobufjs');
const logger = require('../utils/logger');
const { Advertiser, Publisher, Ad, Interaction, Payment } = require('../models');

// トピックの定義
const TOPICS = {
    ADVERTISER: 'advertiser',
    PUBLISHER: 'publisher',
    AD: 'ad',
    INTERACTION: 'interaction',
    PAYMENT: 'payment',
    SYNC_REQUEST: 'sync_request'
};

const TOPIC = 'p2p-ads-payments'

// メッセージのシリアライズ/デシリアライズ
const root = protobuf.Root.fromJSON({
    nested: {
        Advertiser: {
            fields: {
                id: { type: 'string', id: 1 },
                name: { type: 'string', id: 2 },
                email: { type: 'string', id: 3 },
                paymentMethod: { type: 'string', id: 4 },
                paymentDetails: { type: 'string', id: 5 } // JSON.stringifyされたデータ
            }
        },
        Publisher: {
            fields: {
                id: { type: 'string', id: 1 },
                name: { type: 'string', id: 2 },
                email: { type: 'string', id: 3 },
                paymentMethod: { type: 'string', id: 4 },
                paymentDetails: { type: 'string', id: 5 } // JSON.stringifyされたデータ
            }
        },
        Ad: {
            fields: {
                id: { type: 'string', id: 1 },
                type: { type: 'string', id: 2 },
                data: { type: 'string', id: 3 }, // JSON.stringifyされたデータ
                advertiserId: { type: 'string', id: 4 }
            }
        },
        Interaction: {
            fields: {
                id: { type: 'string', id: 1 },
                adId: { type: 'string', id: 2 },
                publisherId: { type: 'string', id: 3 },
                interactionType: { type: 'string', id: 4 },
                timestamp: { type: 'string', id: 5 } // ISO文字列
            }
        },
        Payment: {
            fields: {
                id: { type: 'int32', id: 1 },
                adType: { type: 'string', id: 2 },
                adId: { type: 'string', id: 3 },
                publisherId: { type: 'string', id: 4 },
                advertiserId: { type: 'string', id: 5 },
                amount: { type: 'double', id: 6 },
                currency: { type: 'string', id: 7 },
                status: { type: 'string', id: 8 },
                paypalTransactionId: { type: 'string', id: 9 },
                createdAt: { type: 'string', id: 10 } // ISO文字列
            }
        }
    }
});

// 各メッセージのエンコーダー/デコーダー
const AdvertiserMessage = root.lookupType('Advertiser');
const PublisherMessage = root.lookupType('Publisher');
const AdMessage = root.lookupType('Ad');
const InteractionMessage = root.lookupType('Interaction');
const PaymentMessage = root.lookupType('Payment');

const encodeAdvertiser = (advertiser) => AdvertiserMessage.encode(AdvertiserMessage.create(advertiser)).finish();
const decodeAdvertiser = (buffer) => AdvertiserMessage.toObject(AdvertiserMessage.decode(buffer), { enums: String, longs: String });

const encodePublisher = (publisher) => PublisherMessage.encode(PublisherMessage.create(publisher)).finish();
const decodePublisher = (buffer) => PublisherMessage.toObject(PublisherMessage.decode(buffer), { enums: String, longs: String });

const encodeAd = (ad) => AdMessage.encode(AdMessage.create(ad)).finish();
const decodeAd = (buffer) => AdMessage.toObject(AdMessage.decode(buffer), { enums: String, longs: String });

const encodeInteraction = (interaction) => InteractionMessage.encode(InteractionMessage.create(interaction)).finish();
const decodeInteraction = (buffer) => InteractionMessage.toObject(InteractionMessage.decode(buffer), { enums: String, longs: String });

const encodePayment = (payment) => PaymentMessage.encode(PaymentMessage.create(payment)).finish();
const decodePayment = (buffer) => PaymentMessage.toObject(PaymentMessage.decode(buffer), { enums: String, longs: String });

// ブロードキャスト関数
const broadcastMessage = async (topic, data) => {
    if (global.libp2p && global.libp2p.pubsub) {
        await global.libp2p.pubsub.publish(topic, data);
        logger.info(`Message broadcast to topic: ${topic}`);
    }
};

exports.broadcastAdvertiser = (advertiser) => {
    const data = encodeAdvertiser(advertiser);
    return broadcastMessage(TOPICS.ADVERTISER, data);
};

exports.broadcastPublisher = (publisher) => {
    const data = encodePublisher(publisher);
    return broadcastMessage(TOPICS.PUBLISHER, data);
};

exports.broadcastAd = (ad) => {
    const data = encodeAd(ad);
    return broadcastMessage(TOPICS.AD, data);
};

exports.broadcastInteraction = (interaction) => {
    const data = encodeInteraction(interaction);
    return broadcastMessage(TOPICS.INTERACTION, data);
};

exports.broadcastPayment = async (payment) => {
    try {
        if (!global.libp2p) {
            logger.error('Libp2p node is not initialized');
            return;
        }
        const data = encodePayment(payment);
        await broadcastMessage(TOPICS.PAYMENT, data);
    } catch (err) {
        logger.error('Failed to broadcast payment:', err);
    }
};

const subscribeToPayments = (node, callback) => {
    node.pubsub.subscribe(TOPIC)
    node.pubsub.addEventListener('message', (msg) => {
        try {
            const payment = JSON.parse(new TextDecoder().decode(msg.detail.data))
            callback(payment)
        } catch (err) {
            console.error('Failed to process received payment:', err)
        }
    })
}
